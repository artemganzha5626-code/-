"""Middleware контекста: одна async-сессия БД на апдейт + язык пользователя.

Загружает (или создаёт) запись User, обновляет username/имя и прокидывает
в хендлеры готовые `session`, `user` и `lang`. Так язык не приходится
переспрашивать и не нужно дёргать БД в каждом хендлере вручную.
"""

from __future__ import annotations

from typing import Any, Awaitable, Callable

from aiogram import BaseMiddleware
from aiogram.types import CallbackQuery, Message, TelegramObject, User as TgUser

from bot.logger import get_logger
from bot.models import User
from bot.models.db import get_sessionmaker

logger = get_logger(__name__)


class ContextMiddleware(BaseMiddleware):
    """Открывает сессию БД, обеспечивает наличие пользователя и его языка."""

    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        tg_user: TgUser | None = data.get("event_from_user")

        sessionmaker = get_sessionmaker()
        async with sessionmaker() as session:
            user: User | None = None
            if tg_user is not None:
                user = await self._get_or_create_user(session, tg_user)
                await session.commit()

            data["session"] = session
            data["user"] = user
            data["lang"] = user.language if user else "ru"

            return await handler(event, data)

    async def _get_or_create_user(self, session, tg_user: TgUser) -> User:
        """Найти пользователя или создать нового; обновить профиль."""
        user = await session.get(User, tg_user.id)
        if user is None:
            user = User(
                id=tg_user.id,
                username=tg_user.username,
                full_name=tg_user.full_name,
                language=self._guess_language(tg_user),
            )
            session.add(user)
            logger.info("Новый пользователь id=%s", tg_user.id)
        else:
            # Держим профиль актуальным (юзер мог сменить username)
            user.username = tg_user.username
            user.full_name = tg_user.full_name
        return user

    @staticmethod
    def _guess_language(tg_user: TgUser) -> str:
        """Первичная догадка о языке по настройкам Telegram-клиента."""
        code = (tg_user.language_code or "ru")[:2]
        return code if code in ("ru", "uk", "en") else "ru"
