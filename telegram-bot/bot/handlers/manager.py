"""Хендлеры выхода на живого менеджера.

Доступно из любой точки: команда /manager, кнопка в меню и кнопка навигации
на шагах воронки. Уведомляет чат менеджеров карточкой лида и сообщает
пользователю ожидаемое время ответа.
"""

from __future__ import annotations

from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from bot.config import get_settings
from bot.handlers.ui import send_or_edit
from bot.keyboards import callbacks as cb
from bot.keyboards.inline import to_menu_kb
from bot.locales.i18n import t
from bot.logger import get_logger
from bot.models import User
from bot.services.notifier import build_handoff_card, notify_manager

logger = get_logger(__name__)
router = Router(name="manager")

# Человекочитаемые названия шагов воронки для карточки менеджера
_STEP_LABELS: dict[str, str] = {
    "LeadForm:category": "выбор категории",
    "LeadForm:category_other": "уточнение категории",
    "LeadForm:size": "выбор размера",
    "LeadForm:budget": "выбор бюджета",
    "LeadForm:name": "ввод имени",
    "LeadForm:contact": "ввод контакта",
    "LeadForm:comment": "комментарий",
    "LeadForm:confirm": "подтверждение заявки",
}


async def perform_handoff(
    event: Message | CallbackQuery, state: FSMContext, user: User | None, lang: str
) -> None:
    """Собрать карточку, уведомить менеджера, ответить пользователю.

    Состояние FSM НЕ сбрасываем — пользователь может продолжить воронку.
    """
    settings = get_settings()
    bot = event.bot
    data = await state.get_data()
    raw_state = await state.get_state()
    step_label = _STEP_LABELS.get(raw_state or "")

    # Показываем «печатает…», пока обращаемся к чату менеджеров
    chat_id = event.message.chat.id if isinstance(event, CallbackQuery) else event.chat.id
    if bot is not None:
        await bot.send_chat_action(chat_id, "typing")

    card = build_handoff_card(
        user_full_name=user.full_name if user else None,
        username=user.username if user else None,
        user_id=user.id if user else (event.from_user.id if event.from_user else 0),
        data=data,
        step_label=step_label,
    )
    delivered = await notify_manager(bot, card) if bot is not None else False
    if not delivered:
        logger.error("Хендофф: не удалось доставить карточку менеджеру (user=%s)",
                     user.id if user else "?")

    await send_or_edit(
        event,
        t(lang, "manager_user_notified", minutes=settings.manager_response_minutes),
        to_menu_kb(lang),
    )


@router.message(F.text.in_({"/manager", "/менеджер"}))
async def cmd_manager(message: Message, state: FSMContext, user: User | None, lang: str) -> None:
    """Команда /manager — вызов менеджера."""
    await perform_handoff(message, state, user, lang)


@router.callback_query(F.data == cb.MENU_MANAGER)
async def menu_manager(cb_q: CallbackQuery, state: FSMContext, user: User | None, lang: str) -> None:
    """Кнопка «Связаться с менеджером» в главном меню."""
    await cb_q.answer()
    await perform_handoff(cb_q, state, user, lang)


@router.callback_query(F.data == cb.NAV_MANAGER)
async def nav_manager(cb_q: CallbackQuery, state: FSMContext, user: User | None, lang: str) -> None:
    """Кнопка «Менеджер» на шагах воронки."""
    await cb_q.answer()
    await perform_handoff(cb_q, state, user, lang)
