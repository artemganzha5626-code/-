"""Фабрики для тестов: mock-бот и конструкторы Telegram-апдейтов.

Не импортирует пакет `bot`, чтобы порядок настройки окружения в conftest
оставался под контролем.
"""

from __future__ import annotations

from datetime import datetime

from aiogram import Bot
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.methods import TelegramMethod
from aiogram.types import CallbackQuery, Chat, Message, Update, User as TgUser

USER_ID = 555
MANAGER_CHAT_ID = -100999


class RecordingBot(Bot):
    """Bot без сети: записывает вызванные методы и возвращает заглушки."""

    def __init__(self) -> None:
        super().__init__("123:ABC", default=DefaultBotProperties(parse_mode=ParseMode.HTML))
        self.calls: list[TelegramMethod] = []

    async def __call__(self, method: TelegramMethod, request_timeout: int | None = None):
        self.calls.append(method)
        name = type(method).__name__
        if name in ("SendMessage", "EditMessageText"):
            return Message(
                message_id=999,
                date=datetime.now(),
                chat=Chat(id=getattr(method, "chat_id", USER_ID), type="private"),
                text=getattr(method, "text", ""),
            )
        return True

    # --- удобные геттеры для ассертов ---
    def clear(self) -> None:
        self.calls.clear()

    def method_names(self) -> list[str]:
        return [type(m).__name__ for m in self.calls]

    def all_text(self) -> str:
        return "\n".join(getattr(m, "text", "") or "" for m in self.calls)

    def messages_to(self, chat_id: int) -> list[TelegramMethod]:
        return [m for m in self.calls if getattr(m, "chat_id", None) == chat_id]


def msg_update(update_id: int, text: str, user_id: int = USER_ID, lang: str = "ru") -> Update:
    """Апдейт-сообщение от пользователя."""
    return Update(
        update_id=update_id,
        message=Message(
            message_id=update_id,
            date=datetime.now(),
            chat=Chat(id=user_id, type="private"),
            from_user=TgUser(id=user_id, is_bot=False, first_name="Test", language_code=lang),
            text=text,
        ),
    )


def cb_update(update_id: int, data: str, user_id: int = USER_ID, lang: str = "ru") -> Update:
    """Апдейт нажатия инлайн-кнопки."""
    return Update(
        update_id=update_id,
        callback_query=CallbackQuery(
            id=str(update_id),
            chat_instance="ci",
            from_user=TgUser(id=user_id, is_bot=False, first_name="Test", language_code=lang),
            data=data,
            message=Message(
                message_id=1,
                date=datetime.now(),
                chat=Chat(id=user_id, type="private"),
                from_user=TgUser(id=1, is_bot=True, first_name="Bot"),
                text="prev",
            ),
        ),
    )
