"""Общие хендлеры: /start, /menu, выбор языка и текстовый fallback.

Fallback c intent-matching включается последним, чтобы не перехватывать
шаги воронки и команды.
"""

from __future__ import annotations

from aiogram import F, Router
from aiogram.filters import Command, CommandStart, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message
from sqlalchemy.ext.asyncio import AsyncSession

from bot.handlers.manager import perform_handoff
from bot.handlers.ui import (
    MISUNDERSTAND_LIMIT,
    add_strike,
    reset_strikes,
    send_or_edit,
    show_language,
    show_main_menu,
    start_lead_funnel,
)
from bot.keyboards import callbacks as cb
from bot.keyboards import inline
from bot.locales.i18n import normalize_lang, t
from bot.logger import get_logger
from bot.models import User
from bot.services.intent import detect_intent

logger = get_logger(__name__)
router = Router(name="common")

TEXT_NOT_COMMAND = F.text & ~F.text.startswith("/")


# ---------------------------------------------------------------------------
# Команды
# ---------------------------------------------------------------------------
@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext) -> None:
    """/start — всегда сбрасывает FSM и показывает выбор языка (S0)."""
    await state.clear()
    await show_language(message)


@router.message(Command("menu"))
async def cmd_menu(message: Message, state: FSMContext, lang: str) -> None:
    """/menu — вернуться в главное меню из любого места."""
    await state.clear()
    await show_main_menu(message, lang)


# ---------------------------------------------------------------------------
# Выбор / смена языка
# ---------------------------------------------------------------------------
@router.callback_query(F.data.startswith(f"{cb.LANG_PREFIX}:"))
async def choose_language(
    cb_q: CallbackQuery, state: FSMContext, session: AsyncSession, user: User | None
) -> None:
    """Пользователь выбрал язык — сохраняем и показываем меню."""
    code = normalize_lang(cb_q.data.split(":", 1)[1])
    if user is not None:
        user.language = code
        await session.commit()
    await cb_q.answer(t(code, "lang_changed"))
    await show_main_menu(cb_q, code, greeting=True)


@router.callback_query(F.data == cb.MENU_LANG)
async def menu_change_language(cb_q: CallbackQuery) -> None:
    """Кнопка «Сменить язык» из меню."""
    await cb_q.answer()
    await show_language(cb_q)


# ---------------------------------------------------------------------------
# Навигация «в меню» (доступна из любого шага)
# ---------------------------------------------------------------------------
@router.callback_query(F.data == cb.NAV_MENU)
async def nav_menu(cb_q: CallbackQuery, state: FSMContext, lang: str) -> None:
    """Кнопка «Меню» — сброс воронки и возврат в главное меню."""
    await cb_q.answer()
    await state.clear()
    await show_main_menu(cb_q, lang)


# ---------------------------------------------------------------------------
# Текстовый fallback вне воронки: intent-matching
# ---------------------------------------------------------------------------
@router.message(StateFilter(None), TEXT_NOT_COMMAND)
async def fallback_text(message: Message, state: FSMContext, user: User | None, lang: str) -> None:
    """Свободный текст без активного шага — пытаемся понять намерение."""
    intent = detect_intent(message.text or "")

    if intent == "manager":
        await reset_strikes(state)
        await perform_handoff(message, state, user, lang)
        return
    if intent == "lead":
        await reset_strikes(state)
        await start_lead_funnel(message, state, lang)
        return
    if intent == "faq":
        await reset_strikes(state)
        await send_or_edit(message, t(lang, "faq_text"), inline.to_menu_kb(lang))
        return
    if intent in ("menu", "greeting"):
        await reset_strikes(state)
        await show_main_menu(message, lang, greeting=(intent == "greeting"))
        return

    # Намерение не распознано — считаем непонимания
    strikes = await add_strike(state)
    if strikes >= MISUNDERSTAND_LIMIT:
        await reset_strikes(state)
        await message.answer(t(lang, "offer_manager"), reply_markup=inline.offer_manager_kb(lang))
        return
    await message.answer(t(lang, "unknown"), reply_markup=inline.main_menu_kb(lang))


# ---------------------------------------------------------------------------
# Страховочные обработчики: никакой «тишины»
# ---------------------------------------------------------------------------
@router.callback_query()
async def stale_callback(cb_q: CallbackQuery) -> None:
    """Устаревшая/неизвестная инлайн-кнопка — гасим «часики», не падаем."""
    await cb_q.answer()


@router.message()
async def catch_all(message: Message, lang: str) -> None:
    """Любое необработанное сообщение (стикер, фото и т.п.) — вежливая подсказка."""
    await message.answer(t(lang, "unknown"), reply_markup=inline.main_menu_kb(lang))
