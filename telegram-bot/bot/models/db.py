"""Инициализация движка БД и фабрики сессий (async SQLAlchemy)."""

from __future__ import annotations

from pathlib import Path

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from bot.config import get_settings
from bot.logger import get_logger
from bot.models.base import Base

logger = get_logger(__name__)

_engine: AsyncEngine | None = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None


def _ensure_sqlite_dir(database_url: str) -> None:
    """Создать директорию для файла SQLite, если её ещё нет."""
    prefix = "sqlite+aiosqlite:///"
    if database_url.startswith(prefix):
        db_path = Path(database_url[len(prefix):])
        db_path.parent.mkdir(parents=True, exist_ok=True)


def get_engine() -> AsyncEngine:
    """Ленивая инициализация движка."""
    global _engine
    if _engine is None:
        settings = get_settings()
        _ensure_sqlite_dir(settings.database_url)
        _engine = create_async_engine(
            settings.database_url,
            echo=False,
            pool_pre_ping=True,
        )
        logger.info("DB engine создан: %s", settings.database_url.split("://")[0])
    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    """Фабрика async-сессий."""
    global _sessionmaker
    if _sessionmaker is None:
        _sessionmaker = async_sessionmaker(
            bind=get_engine(),
            expire_on_commit=False,
            class_=AsyncSession,
        )
    return _sessionmaker


async def init_models() -> None:
    """Создать таблицы, если их нет.

    Для MVP удобно создавать схему автоматически. В проде миграции
    накатываются через Alembic (см. alembic/), а этот вызов можно убрать.
    """
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Таблицы БД проверены/созданы")


async def dispose_engine() -> None:
    """Корректно закрыть пул соединений при остановке бота."""
    global _engine
    if _engine is not None:
        await _engine.dispose()
        _engine = None
