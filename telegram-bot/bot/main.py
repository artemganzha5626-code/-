"""Точка входа: сборка и запуск бота (aiogram 3.x, long polling).

Здесь связываем всё вместе: настройки, БД, middleware, роутеры, обработчик
ошибок, CRM-клиент и фоновую синхронизацию очереди pending_sync.
"""

from __future__ import annotations

import asyncio

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import BotCommand

from bot.config import get_settings
from bot.handlers import errors, get_main_router
from bot.logger import get_logger, setup_logging
from bot.middlewares import ContextMiddleware, ThrottlingMiddleware
from bot.models.db import dispose_engine, get_sessionmaker, init_models
from bot.services.crm import CRMClient
from bot.services.sync import sync_worker

logger = get_logger(__name__)


async def set_commands(bot: Bot) -> None:
    """Зарегистрировать команды бота (видны в меню Telegram)."""
    await bot.set_my_commands(
        [
            BotCommand(command="start", description="Запустить / начать заново"),
            BotCommand(command="menu", description="Главное меню"),
            BotCommand(command="manager", description="Связаться с менеджером"),
            BotCommand(command="faq", description="Частые вопросы"),
        ]
    )


def build_dispatcher() -> Dispatcher:
    """Создать диспетчер: хранилище FSM, middleware, роутеры, ошибки."""
    dp = Dispatcher(storage=MemoryStorage())

    # Middleware: сначала троттлинг (внешний), затем контекст пользователя.
    for observer in (dp.message, dp.callback_query):
        observer.middleware(ThrottlingMiddleware())
        observer.middleware(ContextMiddleware())

    dp.include_router(get_main_router())
    errors.register_errors(dp)
    return dp


async def main() -> None:
    """Асинхронный запуск бота."""
    settings = get_settings()
    setup_logging(settings.log_level)

    # Схема БД (для MVP создаём таблицы на старте; в проде — Alembic)
    await init_models()

    bot = Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = build_dispatcher()
    crm = CRMClient(settings)

    if not crm.enabled:
        logger.warning(
            "CRM (Google Sheets) не настроена — лиды сохраняются в БД и уходят "
            "менеджеру, но не пишутся в таблицу. Задайте GOOGLE_CREDENTIALS_FILE "
            "и GOOGLE_SHEET_ID, чтобы включить."
        )

    # Фоновая досинхронизация очереди pending_sync
    sync_task = asyncio.create_task(sync_worker(get_sessionmaker(), crm))

    try:
        await set_commands(bot)
        await bot.delete_webhook(drop_pending_updates=True)
        logger.info("Бот запущен (long polling)")
        # crm прокидывается в хендлеры как workflow-данные
        await dp.start_polling(bot, crm=crm)
    finally:
        logger.info("Останавливаю бота…")
        sync_task.cancel()
        try:
            await sync_task
        except asyncio.CancelledError:
            pass
        await bot.session.close()
        await dispose_engine()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Остановлено вручную")
