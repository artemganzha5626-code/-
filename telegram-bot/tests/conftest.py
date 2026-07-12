"""Общие фикстуры pytest.

ВАЖНО: переменные окружения задаются до импорта пакета `bot`, потому что
настройки (pydantic-settings) и движок БД читают их при инициализации.
Тестовая БД — временный файл SQLite, схема пересоздаётся перед каждым тестом.
"""

from __future__ import annotations

import os
import tempfile

# --- окружение для тестов (до импорта bot.*) ---
_TMP_DB = os.path.join(tempfile.gettempdir(), "crmino_test.db")
os.environ["BOT_TOKEN"] = "123:ABC"
os.environ["MANAGER_CHAT_ID"] = "-100999"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_TMP_DB}"
os.environ["THROTTLE_RATE"] = "0"  # отключаем троттлинг в тестах
os.environ["GOOGLE_CREDENTIALS_FILE"] = ""
os.environ["GOOGLE_SHEET_ID"] = ""

import pytest  # noqa: E402
import pytest_asyncio  # noqa: E402

from bot.config import get_settings  # noqa: E402
from bot.main import build_dispatcher  # noqa: E402
from bot.models.base import Base  # noqa: E402
from bot.models.db import get_engine, get_sessionmaker  # noqa: E402
from bot.services.crm import CRMClient  # noqa: E402
from tests.factories import RecordingBot  # noqa: E402


@pytest_asyncio.fixture(autouse=True)
async def _reset_db():
    """Пересоздать схему БД перед каждым тестом (полная изоляция)."""
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield


@pytest.fixture
def settings():
    return get_settings()


@pytest.fixture
def sessionmaker():
    return get_sessionmaker()


@pytest.fixture
def bot() -> RecordingBot:
    return RecordingBot()


@pytest.fixture(scope="session")
def dp():
    # Роутеры aiogram — модульные синглтоны, поэтому диспетчер собираем один раз
    # за сессию (как и в проде). Изоляция состояния — через /start в тестах и
    # пересоздание FSM-хранилища фикстурой _reset_fsm.
    return build_dispatcher()


@pytest.fixture(autouse=True)
def _reset_fsm(dp):
    """Чистое FSM-хранилище перед каждым тестом (изоляция состояния)."""
    from aiogram.fsm.storage.memory import MemoryStorage

    dp.fsm.storage = MemoryStorage()
    yield


@pytest.fixture
def crm(settings) -> CRMClient:
    return CRMClient(settings)


@pytest_asyncio.fixture
async def feed(bot, dp, crm):
    """Функция прогона апдейта через диспетчер; возвращает mock-бот с записями."""

    async def _feed(update):
        bot.clear()
        await dp.feed_update(bot, update, crm=crm)
        return bot

    return _feed
