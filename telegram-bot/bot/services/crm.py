"""Интеграция с CRM = Google Sheets.

gspread — синхронная библиотека, поэтому все её вызовы выполняются в
пуле потоков (run_in_executor) и оборачиваются в asyncio.wait_for с таймаутом
(по ТЗ — не больше 3 секунд). Если Sheets не отвечает или падает — метод
возвращает False, а вызывающий код кладёт лид в очередь pending_sync.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from functools import partial
from typing import Any

from bot.config import Settings
from bot.locales.i18n import budget_label, category_label
from bot.logger import get_logger
from bot.models import Lead

logger = get_logger(__name__)

# Заголовки колонок в Google-таблице (создаются один раз при первом запуске)
SHEET_HEADERS = [
    "Дата",
    "Имя",
    "Контакт",
    "Категория",
    "Размер",
    "Бюджет",
    "Комментарий",
    "Язык",
    "TG username",
    "TG user id",
]


class CRMClient:
    """Обёртка над Google Sheets."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._worksheet: Any | None = None  # ленивая инициализация
        self._lock = asyncio.Lock()

    @property
    def enabled(self) -> bool:
        return self._settings.crm_enabled

    def _connect_sync(self) -> Any:
        """Синхронное подключение к листу (выполняется в executor)."""
        import gspread  # локальный импорт — не тянем зависимость, если CRM выкл.

        client = gspread.service_account(
            filename=self._settings.google_credentials_file
        )
        spreadsheet = client.open_by_key(self._settings.google_sheet_id)
        try:
            worksheet = spreadsheet.worksheet(self._settings.google_sheet_worksheet)
        except gspread.WorksheetNotFound:
            worksheet = spreadsheet.add_worksheet(
                title=self._settings.google_sheet_worksheet, rows=1000, cols=len(SHEET_HEADERS)
            )
            worksheet.append_row(SHEET_HEADERS)
        # Проставляем заголовки, если лист пустой
        if not worksheet.get_all_values():
            worksheet.append_row(SHEET_HEADERS)
        return worksheet

    async def _get_worksheet(self) -> Any:
        """Вернуть закешированный лист, при необходимости подключиться."""
        if self._worksheet is None:
            async with self._lock:
                if self._worksheet is None:
                    loop = asyncio.get_running_loop()
                    self._worksheet = await loop.run_in_executor(
                        None, self._connect_sync
                    )
        return self._worksheet

    def _lead_to_row(self, lead: Lead) -> list[str]:
        """Преобразовать лид в строку таблицы (значения — на русском для менеджера)."""
        return [
            datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"),
            lead.name,
            lead.contact,
            category_label(lead.category, "ru"),
            lead.size or "",
            budget_label(lead.budget, "ru") if lead.budget else "",
            lead.comment or "",
            lead.language,
            f"@{lead.tg_username}" if lead.tg_username else "",
            str(lead.tg_user_id),
        ]

    async def push_lead(self, lead: Lead) -> bool:
        """Отправить лид в Google Sheets.

        :return: True при успехе, False при таймауте/ошибке (лид уйдёт в очередь).
        """
        if not self.enabled:
            logger.info("CRM выключена (нет кредов/ID) — пропускаю отправку лида %s", lead.id)
            return False

        try:
            worksheet = await asyncio.wait_for(
                self._get_worksheet(), timeout=self._settings.external_timeout
            )
            loop = asyncio.get_running_loop()
            row = self._lead_to_row(lead)
            await asyncio.wait_for(
                loop.run_in_executor(
                    None, partial(worksheet.append_row, row, value_input_option="USER_ENTERED")
                ),
                timeout=self._settings.external_timeout,
            )
            logger.info("Лид id=%s отправлен в Google Sheets", lead.id)
            return True
        except asyncio.TimeoutError:
            logger.warning("Таймаут (%.1fс) при отправке лида id=%s в CRM",
                           self._settings.external_timeout, lead.id)
            # Сбрасываем кеш листа — вдруг соединение протухло
            self._worksheet = None
            return False
        except Exception as exc:  # noqa: BLE001 — любую ошибку CRM гасим и логируем
            logger.exception("Ошибка отправки лида id=%s в CRM: %s", lead.id, exc)
            self._worksheet = None
            return False
