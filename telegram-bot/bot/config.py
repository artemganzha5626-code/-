"""Конфигурация приложения.

Все секреты и параметры читаются из .env через pydantic-settings.
Никаких токенов в коде — только имена переменных окружения.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Корень проекта (папка telegram-bot/)
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Настройки бота. Значения подтягиваются из переменных окружения / .env."""

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Telegram ---
    bot_token: str = Field(..., alias="BOT_TOKEN")
    # Чат/группа менеджеров, куда падают карточки лидов
    manager_chat_id: int = Field(..., alias="MANAGER_CHAT_ID")
    # Ожидаемое время ответа менеджера (минуты) — показывается пользователю
    manager_response_minutes: int = Field(15, alias="MANAGER_RESPONSE_MINUTES")

    # --- База данных ---
    # По умолчанию SQLite для MVP. Для PostgreSQL:
    # postgresql+asyncpg://user:pass@host:5432/dbname
    database_url: str = Field(
        f"sqlite+aiosqlite:///{BASE_DIR / 'data' / 'bot.db'}",
        alias="DATABASE_URL",
    )

    # --- CRM: Google Sheets ---
    # Путь к JSON сервис-аккаунта Google
    google_credentials_file: str | None = Field(
        None, alias="GOOGLE_CREDENTIALS_FILE"
    )
    # ID таблицы Google Sheets (из URL: /spreadsheets/d/<ID>/edit)
    google_sheet_id: str | None = Field(None, alias="GOOGLE_SHEET_ID")
    # Название листа внутри таблицы
    google_sheet_worksheet: str = Field("Leads", alias="GOOGLE_SHEET_WORKSHEET")

    # --- Таймауты / надёжность ---
    # Максимальное время ожидания внешнего сервиса (сек). По ТЗ — не более 3с.
    external_timeout: float = Field(3.0, alias="EXTERNAL_TIMEOUT")
    # Период фоновой досинхронизации очереди pending_sync (сек)
    sync_interval: int = Field(60, alias="SYNC_INTERVAL")

    # --- Rate limiting ---
    # Минимальный интервал между обработанными апдейтами одного юзера (сек)
    throttle_rate: float = Field(0.5, alias="THROTTLE_RATE")

    # --- Логирование ---
    log_level: str = Field("INFO", alias="LOG_LEVEL")

    @field_validator("log_level")
    @classmethod
    def _upper_log_level(cls, value: str) -> str:
        return value.upper()

    @property
    def crm_enabled(self) -> bool:
        """CRM активна только если заданы креды и ID таблицы."""
        return bool(self.google_credentials_file and self.google_sheet_id)


@lru_cache
def get_settings() -> Settings:
    """Singleton настроек (кешируется на всё время жизни процесса)."""
    return Settings()  # type: ignore[call-arg]
