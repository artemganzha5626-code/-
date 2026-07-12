"""Rate limiting: защита от спама и двойных нажатий.

Не более одного обрабатываемого апдейта от пользователя за короткий интервал
(THROTTLE_RATE). Быстрые повторы гасятся: у callback-кнопок отвечаем тихим
alert-ом, чтобы у пользователя не «висела» кнопка.
"""

from __future__ import annotations

import time
from typing import Any, Awaitable, Callable

from aiogram import BaseMiddleware
from aiogram.types import CallbackQuery, TelegramObject

from bot.config import get_settings
from bot.logger import get_logger

logger = get_logger(__name__)


class ThrottlingMiddleware(BaseMiddleware):
    """Простой in-memory троттлинг по user_id.

    Для одного инстанса бота этого достаточно. При горизонтальном
    масштабировании счётчики стоит вынести в Redis.
    """

    def __init__(self) -> None:
        self._last_seen: dict[int, float] = {}
        self._rate = get_settings().throttle_rate

    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        tg_user = data.get("event_from_user")
        if tg_user is None:
            return await handler(event, data)

        now = time.monotonic()
        last = self._last_seen.get(tg_user.id, 0.0)
        if now - last < self._rate:
            # Слишком часто — пропускаем обработку
            if isinstance(event, CallbackQuery):
                # Снимаем «часики» на кнопке, но обработчик не запускаем
                await event.answer()
            logger.debug("Троттлинг: пропущен апдейт от %s", tg_user.id)
            return None

        self._last_seen[tg_user.id] = now
        return await handler(event, data)
