"""Фоновый воркер досинхронизации очереди pending_sync с CRM.

Периодически берёт лиды, которые не удалось отправить в Google Sheets,
и повторяет попытку. Так данные клиента не теряются при недоступности CRM.
"""

from __future__ import annotations

import asyncio

from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession

from bot.config import get_settings
from bot.logger import get_logger
from bot.services import leads as leads_service
from bot.services.crm import CRMClient

logger = get_logger(__name__)


async def _process_batch(
    sessionmaker: async_sessionmaker[AsyncSession], crm: CRMClient
) -> int:
    """Обработать одну пачку очереди. Вернуть число успешно синхронизированных."""
    processed = 0
    async with sessionmaker() as session:
        pending_items = await leads_service.get_pending(session)
        for item in pending_items:
            lead = await leads_service.get_lead(session, item.lead_id)
            if lead is None:
                # Лид исчез — чистим «висячую» задачу
                await leads_service.drop_pending(session, item.id)
                continue
            ok = await crm.push_lead(lead)
            if ok:
                await leads_service.mark_synced(session, lead.id)
                await leads_service.drop_pending(session, item.id)
                processed += 1
            else:
                await leads_service.bump_pending_attempt(
                    session, item, "CRM недоступна при досинхронизации"
                )
        await session.commit()
    return processed


async def sync_worker(
    sessionmaker: async_sessionmaker[AsyncSession], crm: CRMClient
) -> None:
    """Бесконечный цикл досинхронизации. Запускается как фоновая задача.

    Останавливается при отмене задачи (CancelledError) на завершении бота.
    """
    settings = get_settings()
    logger.info("Фоновая синхронизация запущена (интервал %sс)", settings.sync_interval)
    try:
        while True:
            await asyncio.sleep(settings.sync_interval)
            if not crm.enabled:
                continue
            try:
                done = await _process_batch(sessionmaker, crm)
                if done:
                    logger.info("Досинхронизировано лидов: %s", done)
            except Exception as exc:  # noqa: BLE001 — воркер не должен падать
                logger.exception("Ошибка в цикле синхронизации: %s", exc)
    except asyncio.CancelledError:
        logger.info("Фоновая синхронизация остановлена")
        raise
