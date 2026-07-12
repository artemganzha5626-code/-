"""Роутеры-хендлеры бота.

Порядок включения важен: сначала команды и колбэки, в самом конце —
текстовый fallback с intent-matching, чтобы он не перехватывал остальное.
"""

from aiogram import Router

from bot.handlers import common, errors, faq, lead, manager


def get_main_router() -> Router:
    """Собрать корневой роутер со всеми хендлерами в правильном порядке."""
    router = Router(name="main")
    router.include_router(manager.router)   # /manager, кнопки менеджера
    router.include_router(faq.router)       # FAQ
    router.include_router(lead.router)      # воронка (со своими состояниями)
    router.include_router(common.router)    # /start, /menu, язык, fallback
    return router


__all__ = ["get_main_router", "errors"]
