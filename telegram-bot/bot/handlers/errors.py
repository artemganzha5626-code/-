"""Глобальный перехват необработанных исключений в хендлерах.

Любая ошибка логируется, а пользователь получает вежливое сообщение вместо
«тишины» или зависшей кнопки. Обработчик всегда возвращает True — считаем
ошибку обработанной, чтобы диспетчер не падал.
"""

from __future__ import annotations

from aiogram import Dispatcher
from aiogram.types import ErrorEvent

from bot.locales.i18n import normalize_lang, t
from bot.logger import get_logger

logger = get_logger(__name__)


async def on_error(event: ErrorEvent) -> bool:
    """Обработать любое исключение из хендлера."""
    logger.exception("Необработанная ошибка в хендлере: %s", event.exception)

    update = event.update
    # Пытаемся понять язык из апдейта, иначе — русский
    lang = "ru"
    if update.event_from_user and update.event_from_user.language_code:
        lang = normalize_lang(update.event_from_user.language_code[:2])

    try:
        if update.message is not None:
            await update.message.answer(t(lang, "error_generic"))
        elif update.callback_query is not None:
            await update.callback_query.answer()
            if update.callback_query.message is not None:
                await update.callback_query.message.answer(t(lang, "error_generic"))
    except Exception as exc:  # noqa: BLE001 — даже уведомить не смогли, просто логируем
        logger.error("Не удалось отправить сообщение об ошибке: %s", exc)

    return True


def register_errors(dp: Dispatcher) -> None:
    """Подключить глобальный обработчик ошибок к диспетчеру."""
    dp.errors.register(on_error)
