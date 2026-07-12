"""Reply-клавиатуры. Используются точечно — например, кнопка «поделиться контактом»,
которую нельзя сделать инлайн-кнопкой (request_contact доступен только в reply).
"""

from __future__ import annotations

from aiogram.types import KeyboardButton, ReplyKeyboardMarkup, ReplyKeyboardRemove

from bot.locales.i18n import t


def share_contact_kb(lang: str) -> ReplyKeyboardMarkup:
    """Клавиатура с кнопкой отправки собственного контакта (S6)."""
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text=t(lang, "btn_share_contact"), request_contact=True)]],
        resize_keyboard=True,
        one_time_keyboard=True,
        input_field_placeholder=t(lang, "ask_contact"),
    )


def remove_kb() -> ReplyKeyboardRemove:
    """Убрать reply-клавиатуру."""
    return ReplyKeyboardRemove()
