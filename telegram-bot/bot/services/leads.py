"""Операции с лидами в БД: создание, постановка в очередь, чтение очереди."""

from __future__ import annotations

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from bot.logger import get_logger
from bot.models import Lead, PendingSync

logger = get_logger(__name__)


async def create_lead(session: AsyncSession, data: dict) -> Lead:
    """Создать лид из собранных в FSM данных.

    :param data: словарь с ключами name, contact, category, size, budget,
                 comment, language, tg_user_id, tg_username.
    """
    lead = Lead(
        tg_user_id=data["tg_user_id"],
        tg_username=data.get("tg_username"),
        name=data["name"],
        contact=data["contact"],
        category=data.get("category"),
        size=data.get("size"),
        budget=data.get("budget"),
        comment=data.get("comment"),
        language=data.get("language", "ru"),
        crm_status="pending",
    )
    session.add(lead)
    await session.flush()  # получаем lead.id до commit
    logger.info("Создан лид id=%s user=%s", lead.id, lead.tg_user_id)
    return lead


async def enqueue_sync(session: AsyncSession, lead_id: int, error: str | None = None) -> None:
    """Поставить лид в очередь на досинхронизацию с CRM."""
    session.add(PendingSync(lead_id=lead_id, attempts=0, last_error=error))
    logger.warning("Лид id=%s поставлен в очередь pending_sync", lead_id)


async def mark_synced(session: AsyncSession, lead_id: int) -> None:
    """Отметить лид как успешно отправленный в CRM."""
    await session.execute(
        update(Lead).where(Lead.id == lead_id).values(crm_status="synced")
    )


async def get_pending(session: AsyncSession, limit: int = 20) -> list[PendingSync]:
    """Получить пачку задач из очереди синхронизации."""
    result = await session.execute(
        select(PendingSync).order_by(PendingSync.id).limit(limit)
    )
    return list(result.scalars().all())


async def get_lead(session: AsyncSession, lead_id: int) -> Lead | None:
    """Получить лид по id."""
    return await session.get(Lead, lead_id)


async def drop_pending(session: AsyncSession, pending_id: int) -> None:
    """Удалить успешно обработанную задачу из очереди."""
    obj = await session.get(PendingSync, pending_id)
    if obj is not None:
        await session.delete(obj)


async def bump_pending_attempt(
    session: AsyncSession, pending: PendingSync, error: str
) -> None:
    """Увеличить счётчик попыток и записать последнюю ошибку."""
    pending.attempts += 1
    pending.last_error = error[:500]
