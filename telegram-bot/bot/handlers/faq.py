"""FAQ — частые вопросы. Всегда с кнопками (никаких тупиков)."""

from __future__ import annotations

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import CallbackQuery, Message

from bot.handlers.ui import send_or_edit
from bot.keyboards import callbacks as cb
from bot.keyboards.inline import to_menu_kb
from bot.locales.i18n import t

router = Router(name="faq")


@router.callback_query(F.data == cb.MENU_FAQ)
async def show_faq_cb(cb_q: CallbackQuery, lang: str) -> None:
    """Показать FAQ из меню."""
    await cb_q.answer()
    await send_or_edit(cb_q, t(lang, "faq_text"), to_menu_kb(lang))


@router.message(Command("faq"))
async def show_faq_cmd(message: Message, lang: str) -> None:
    """Команда /faq."""
    await send_or_edit(message, t(lang, "faq_text"), to_menu_kb(lang))
