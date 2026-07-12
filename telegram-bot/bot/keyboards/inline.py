"""Инлайн-клавиатуры. Все подписи локализованы через i18n.

Принцип «никаких тупиков»: на каждом шаге воронки внизу есть строка навигации
(Назад / Меню / Менеджер), чтобы пользователь всегда знал, что делать дальше.
"""

from __future__ import annotations

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder

from bot.keyboards import callbacks as cb
from bot.locales.i18n import t


def language_kb() -> InlineKeyboardMarkup:
    """Выбор языка (S0)."""
    builder = InlineKeyboardBuilder()
    builder.button(text="🇷🇺 Русский", callback_data=f"{cb.LANG_PREFIX}:ru")
    builder.button(text="🇺🇦 Українська", callback_data=f"{cb.LANG_PREFIX}:uk")
    builder.button(text="🇬🇧 English", callback_data=f"{cb.LANG_PREFIX}:en")
    builder.adjust(1)
    return builder.as_markup()


def main_menu_kb(lang: str) -> InlineKeyboardMarkup:
    """Главное меню (S1)."""
    builder = InlineKeyboardBuilder()
    builder.button(text=t(lang, "btn_lead"), callback_data=cb.MENU_LEAD)
    builder.button(text=t(lang, "btn_faq"), callback_data=cb.MENU_FAQ)
    builder.button(text=t(lang, "btn_manager"), callback_data=cb.MENU_MANAGER)
    builder.button(text=t(lang, "btn_change_lang"), callback_data=cb.MENU_LANG)
    builder.adjust(1)
    return builder.as_markup()


def _nav_buttons(lang: str, with_back: bool = True) -> list[InlineKeyboardButton]:
    """Строка навигации: Назад / Меню / Менеджер."""
    row: list[InlineKeyboardButton] = []
    if with_back:
        row.append(InlineKeyboardButton(text=t(lang, "btn_back"), callback_data=cb.NAV_BACK))
    row.append(InlineKeyboardButton(text=t(lang, "btn_menu"), callback_data=cb.NAV_MENU))
    row.append(InlineKeyboardButton(text=t(lang, "btn_manager"), callback_data=cb.NAV_MANAGER))
    return row


def category_kb(lang: str) -> InlineKeyboardMarkup:
    """Выбор категории (S2)."""
    builder = InlineKeyboardBuilder()
    for code in ("women", "men", "kids", "accessories", "wholesale", "other"):
        builder.button(text=t(lang, f"cat_{code}"), callback_data=f"{cb.CAT_PREFIX}:{code}")
    builder.adjust(2)
    builder.row(*_nav_buttons(lang, with_back=False))
    return builder.as_markup()


def size_kb(lang: str) -> InlineKeyboardMarkup:
    """Выбор размера (S3). Есть «Свой вариант» и «Пропустить»."""
    builder = InlineKeyboardBuilder()
    for size in ("S", "M", "L", "XL", "XXL"):
        builder.button(text=size, callback_data=f"{cb.SIZE_PREFIX}:{size}")
    builder.button(text=t(lang, "btn_own"), callback_data=f"{cb.SIZE_PREFIX}:own")
    builder.button(text=t(lang, "btn_skip"), callback_data=f"{cb.SIZE_PREFIX}:skip")
    builder.adjust(5, 2)
    builder.row(*_nav_buttons(lang))
    return builder.as_markup()


def budget_kb(lang: str) -> InlineKeyboardMarkup:
    """Выбор бюджета (S4)."""
    builder = InlineKeyboardBuilder()
    builder.button(text=t(lang, "budget_lt1000"), callback_data=f"{cb.BUDGET_PREFIX}:lt1000")
    builder.button(text=t(lang, "budget_1000_3000"), callback_data=f"{cb.BUDGET_PREFIX}:1000_3000")
    builder.button(text=t(lang, "budget_gt3000"), callback_data=f"{cb.BUDGET_PREFIX}:gt3000")
    builder.button(text=t(lang, "btn_skip"), callback_data=f"{cb.BUDGET_PREFIX}:skip")
    builder.adjust(1)
    builder.row(*_nav_buttons(lang))
    return builder.as_markup()


def nav_kb(lang: str) -> InlineKeyboardMarkup:
    """Только навигация (Назад/Меню/Менеджер) — для шагов свободного ввода (S5, S6)."""
    builder = InlineKeyboardBuilder()
    builder.row(*_nav_buttons(lang))
    return builder.as_markup()


def comment_kb(lang: str) -> InlineKeyboardMarkup:
    """Шаг комментария (S7): «Пропустить» + навигация."""
    builder = InlineKeyboardBuilder()
    builder.button(text=t(lang, "btn_skip"), callback_data=cb.COMMENT_SKIP)
    builder.adjust(1)
    builder.row(*_nav_buttons(lang))
    return builder.as_markup()


def confirm_kb(lang: str) -> InlineKeyboardMarkup:
    """Подтверждение отправки (S8)."""
    builder = InlineKeyboardBuilder()
    builder.button(text=t(lang, "btn_send"), callback_data=cb.CONFIRM_SEND)
    builder.button(text=t(lang, "btn_edit"), callback_data=cb.CONFIRM_EDIT)
    builder.adjust(1)
    builder.row(*_nav_buttons(lang, with_back=True))
    return builder.as_markup()


def to_menu_kb(lang: str) -> InlineKeyboardMarkup:
    """Финальная клавиатура: вернуться в меню / менеджер."""
    builder = InlineKeyboardBuilder()
    builder.button(text=t(lang, "btn_menu"), callback_data=cb.NAV_MENU)
    builder.button(text=t(lang, "btn_manager"), callback_data=cb.NAV_MANAGER)
    builder.adjust(1)
    return builder.as_markup()


def offer_manager_kb(lang: str) -> InlineKeyboardMarkup:
    """Предложение переключиться на менеджера (после 3 непониманий)."""
    builder = InlineKeyboardBuilder()
    builder.button(text=t(lang, "btn_manager"), callback_data=cb.NAV_MANAGER)
    builder.button(text=t(lang, "btn_menu"), callback_data=cb.NAV_MENU)
    builder.adjust(1)
    return builder.as_markup()
