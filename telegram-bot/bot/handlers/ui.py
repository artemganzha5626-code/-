"""Общие UI-хелперы, используемые несколькими роутерами.

Вынесены сюда, чтобы избежать циклических импортов между common/lead/manager.
Ничего «бизнесового» — только показ меню/языка, старт воронки и учёт «непониманий».
"""

from __future__ import annotations

from aiogram.exceptions import TelegramBadRequest
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from bot.keyboards import inline
from bot.locales.i18n import t
from bot.states import LeadForm

# Порог непониманий подряд, после которого предлагаем менеджера
MISUNDERSTAND_LIMIT = 3


async def send_or_edit(event: Message | CallbackQuery, text: str, reply_markup=None) -> None:
    """Показать текст: для колбэка — редактируем сообщение, для сообщения — отвечаем.

    Тихо гасим TelegramBadRequest вида «message is not modified».
    """
    if isinstance(event, CallbackQuery):
        message = event.message
        if message is None:
            return
        try:
            await message.edit_text(text, reply_markup=reply_markup)
        except TelegramBadRequest:
            # Сообщение не изменилось / устарело — отправим новым
            await message.answer(text, reply_markup=reply_markup)
    else:
        await event.answer(text, reply_markup=reply_markup)


async def show_language(event: Message | CallbackQuery) -> None:
    """Показать выбор языка (S0)."""
    await send_or_edit(event, t("ru", "choose_language"), inline.language_kb())


async def show_main_menu(event: Message | CallbackQuery, lang: str, greeting: bool = False) -> None:
    """Показать главное меню (S1). greeting=True — с приветствием после /start."""
    text = t(lang, "welcome") if greeting else t(lang, "menu_title")
    await send_or_edit(event, text, inline.main_menu_kb(lang))


async def start_lead_funnel(event: Message | CallbackQuery, state: FSMContext, lang: str) -> None:
    """Запустить воронку лида с шага категории (S2), очистив прошлые данные."""
    await state.set_data({"strikes": 0})
    await state.set_state(LeadForm.category)
    await send_or_edit(event, t(lang, "ask_category"), inline.category_kb(lang))


async def add_strike(state: FSMContext) -> int:
    """Увеличить счётчик непониманий подряд и вернуть новое значение."""
    data = await state.get_data()
    strikes = int(data.get("strikes", 0)) + 1
    await state.update_data(strikes=strikes)
    return strikes


async def reset_strikes(state: FSMContext) -> None:
    """Сбросить счётчик непониманий после успешного шага."""
    await state.update_data(strikes=0)
