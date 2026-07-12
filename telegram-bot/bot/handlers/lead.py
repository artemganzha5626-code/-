"""Воронка лида (FSM LeadForm): S2..S10 из карты диалога.

Здесь живёт вся многошаговая логика: категория → размер → бюджет → имя →
контакт → комментарий → подтверждение → сохранение. На каждом шаге есть
кнопки навигации, валидация свободного ввода, intent-matching и счётчик
непониманий (после 3 подряд — предложение менеджера).
"""

from __future__ import annotations

from aiogram import Bot, F, Router
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message
from sqlalchemy.ext.asyncio import AsyncSession

from bot.handlers.manager import perform_handoff
from bot.handlers.ui import (
    MISUNDERSTAND_LIMIT,
    add_strike,
    reset_strikes,
    send_or_edit,
    start_lead_funnel,
)
from bot.keyboards import callbacks as cb
from bot.keyboards import inline
from bot.locales.i18n import budget_label, category_label, t
from bot.logger import get_logger
from bot.models import User
from bot.services import leads as leads_service
from bot.services.crm import CRMClient
from bot.services.intent import detect_intent
from bot.services.notifier import build_lead_card, notify_manager
from bot.states import LeadForm
from bot.utils.validators import validate_contact, validate_name

logger = get_logger(__name__)
router = Router(name="lead")

# Фильтр «текст, но не команда» — чтобы /start, /menu и т.п. проходили дальше
TEXT_NOT_COMMAND = F.text & ~F.text.startswith("/")

# Карта перехода «назад»: текущее состояние -> предыдущий шаг
BACK_MAP: dict[str, LeadForm] = {
    LeadForm.category_other.state: LeadForm.category,
    LeadForm.size.state: LeadForm.category,
    LeadForm.budget.state: LeadForm.size,
    LeadForm.name.state: LeadForm.budget,
    LeadForm.contact.state: LeadForm.name,
    LeadForm.comment.state: LeadForm.contact,
    LeadForm.confirm.state: LeadForm.comment,
}


# ---------------------------------------------------------------------------
# Хелперы отображения шагов
# ---------------------------------------------------------------------------
async def go_to_step(event: Message | CallbackQuery, state: FSMContext, lang: str, step: LeadForm) -> None:
    """Установить состояние step и показать соответствующий вопрос с клавиатурой."""
    await state.set_state(step)
    if step == LeadForm.category:
        await send_or_edit(event, t(lang, "ask_category"), inline.category_kb(lang))
    elif step == LeadForm.size:
        await send_or_edit(event, t(lang, "ask_size"), inline.size_kb(lang))
    elif step == LeadForm.budget:
        await send_or_edit(event, t(lang, "ask_budget"), inline.budget_kb(lang))
    elif step == LeadForm.name:
        await send_or_edit(event, t(lang, "ask_name"), inline.nav_kb(lang))
    elif step == LeadForm.contact:
        await send_or_edit(event, t(lang, "ask_contact"), inline.nav_kb(lang))
    elif step == LeadForm.comment:
        await send_or_edit(event, t(lang, "ask_comment"), inline.comment_kb(lang))


async def render_confirmation(event: Message | CallbackQuery, state: FSMContext, lang: str) -> None:
    """Показать карточку заявки (S8) с кнопками отправки/изменения."""
    await state.set_state(LeadForm.confirm)
    data = await state.get_data()
    empty = t(lang, "confirm_empty")
    lines = [
        t(lang, "confirm_title"),
        "",
        f"👤 <b>{t(lang, 'confirm_name')}:</b> {data.get('name', empty)}",
        f"📞 <b>{t(lang, 'confirm_contact')}:</b> {data.get('contact', empty)}",
        f"🛍 <b>{t(lang, 'confirm_category')}:</b> {category_label(data.get('category'), lang)}",
        f"📏 <b>{t(lang, 'confirm_size')}:</b> {data.get('size') or empty}",
        f"💰 <b>{t(lang, 'confirm_budget')}:</b> {budget_label(data.get('budget'), lang)}",
        f"💬 <b>{t(lang, 'confirm_comment')}:</b> {data.get('comment') or empty}",
    ]
    await send_or_edit(event, "\n".join(lines), inline.confirm_kb(lang))


async def offer_manager_on_limit(event: Message | CallbackQuery, state: FSMContext, lang: str) -> bool:
    """Зарегистрировать непонимание. Если их 3 подряд — предложить менеджера.

    :return: True, если сработал лимит (вызывающему нужно остановиться).
    """
    strikes = await add_strike(state)
    if strikes >= MISUNDERSTAND_LIMIT:
        await reset_strikes(state)
        await send_or_edit(event, t(lang, "offer_manager"), inline.offer_manager_kb(lang))
        return True
    return False


async def _maybe_handoff(event: Message, state: FSMContext, user: User | None, lang: str) -> bool:
    """Если в тексте явное намерение «менеджер» — сразу выполнить хендофф.

    :return: True, если хендофф выполнен и дальнейшую обработку нужно прервать.
    """
    if detect_intent(event.text or "") == "manager":
        await perform_handoff(event, state, user, lang)
        return True
    return False


# ---------------------------------------------------------------------------
# Вход в воронку
# ---------------------------------------------------------------------------
@router.callback_query(F.data == cb.MENU_LEAD)
async def enter_funnel(cb_q: CallbackQuery, state: FSMContext, lang: str) -> None:
    """Кнопка «Оставить заявку» из меню — старт воронки."""
    await cb_q.answer()
    await start_lead_funnel(cb_q, state, lang)


# ---------------------------------------------------------------------------
# Навигация «назад»
# ---------------------------------------------------------------------------
@router.callback_query(F.data == cb.NAV_BACK, StateFilter(LeadForm))
async def nav_back(cb_q: CallbackQuery, state: FSMContext, lang: str) -> None:
    """Кнопка «Назад» — вернуться на предыдущий шаг, не теряя данные."""
    await cb_q.answer()
    current = await state.get_state()
    prev = BACK_MAP.get(current or "")
    if prev is None:
        # С первого шага «назад» некуда — просто перерисуем категорию
        await go_to_step(cb_q, state, lang, LeadForm.category)
        return
    if prev == LeadForm.confirm:
        await render_confirmation(cb_q, state, lang)
    else:
        await go_to_step(cb_q, state, lang, prev)


# ---------------------------------------------------------------------------
# S2: Категория
# ---------------------------------------------------------------------------
@router.callback_query(StateFilter(LeadForm.category), F.data.startswith(f"{cb.CAT_PREFIX}:"))
async def category_chosen(cb_q: CallbackQuery, state: FSMContext, lang: str) -> None:
    """Выбор категории кнопкой."""
    await cb_q.answer()
    code = cb_q.data.split(":", 1)[1]
    if code == "other":
        await state.set_state(LeadForm.category_other)
        await send_or_edit(cb_q, t(lang, "ask_category_other"), inline.nav_kb(lang))
        return
    await state.update_data(category=code)
    await reset_strikes(state)
    await go_to_step(cb_q, state, lang, LeadForm.size)


@router.message(StateFilter(LeadForm.category), TEXT_NOT_COMMAND)
async def category_text(message: Message, state: FSMContext, user: User | None, lang: str) -> None:
    """Пользователь написал категорию текстом — принимаем как свободный ввод."""
    if await _maybe_handoff(message, state, user, lang):
        return
    await state.update_data(category=message.text.strip()[:120])
    await reset_strikes(state)
    await go_to_step(message, state, lang, LeadForm.size)


@router.message(StateFilter(LeadForm.category_other), TEXT_NOT_COMMAND)
async def category_other_text(message: Message, state: FSMContext, user: User | None, lang: str) -> None:
    """Свободный ввод категории после кнопки «Другое»."""
    if await _maybe_handoff(message, state, user, lang):
        return
    await state.update_data(category=message.text.strip()[:120])
    await reset_strikes(state)
    await go_to_step(message, state, lang, LeadForm.size)


# ---------------------------------------------------------------------------
# S3: Размер
# ---------------------------------------------------------------------------
@router.callback_query(StateFilter(LeadForm.size), F.data.startswith(f"{cb.SIZE_PREFIX}:"))
async def size_chosen(cb_q: CallbackQuery, state: FSMContext, lang: str) -> None:
    """Выбор размера кнопкой / «Свой вариант» / «Пропустить»."""
    await cb_q.answer()
    value = cb_q.data.split(":", 1)[1]
    if value == "own":
        await send_or_edit(cb_q, t(lang, "ask_size_own"), inline.nav_kb(lang))
        return
    if value == "skip":
        await state.update_data(size=None)
    else:
        await state.update_data(size=value)
    await reset_strikes(state)
    await go_to_step(cb_q, state, lang, LeadForm.budget)


@router.message(StateFilter(LeadForm.size), TEXT_NOT_COMMAND)
async def size_text(message: Message, state: FSMContext, user: User | None, lang: str) -> None:
    """Свой размер текстом."""
    if await _maybe_handoff(message, state, user, lang):
        return
    await state.update_data(size=message.text.strip()[:40])
    await reset_strikes(state)
    await go_to_step(message, state, lang, LeadForm.budget)


# ---------------------------------------------------------------------------
# S4: Бюджет
# ---------------------------------------------------------------------------
@router.callback_query(StateFilter(LeadForm.budget), F.data.startswith(f"{cb.BUDGET_PREFIX}:"))
async def budget_chosen(cb_q: CallbackQuery, state: FSMContext, lang: str) -> None:
    """Выбор бюджета кнопкой / «Пропустить»."""
    await cb_q.answer()
    value = cb_q.data.split(":", 1)[1]
    await state.update_data(budget=None if value == "skip" else value)
    await reset_strikes(state)
    await go_to_step(cb_q, state, lang, LeadForm.name)


@router.message(StateFilter(LeadForm.budget), TEXT_NOT_COMMAND)
async def budget_text(message: Message, state: FSMContext, user: User | None, lang: str) -> None:
    """Бюджет, введённый текстом."""
    if await _maybe_handoff(message, state, user, lang):
        return
    await state.update_data(budget=message.text.strip()[:60])
    await reset_strikes(state)
    await go_to_step(message, state, lang, LeadForm.name)


# ---------------------------------------------------------------------------
# S5: Имя
# ---------------------------------------------------------------------------
@router.message(StateFilter(LeadForm.name), TEXT_NOT_COMMAND)
async def name_entered(message: Message, state: FSMContext, user: User | None, lang: str) -> None:
    """Ввод и валидация имени."""
    if await _maybe_handoff(message, state, user, lang):
        return
    name = validate_name(message.text or "")
    if name is None:
        if await offer_manager_on_limit(message, state, lang):
            return
        await message.answer(t(lang, "name_invalid"), reply_markup=inline.nav_kb(lang))
        return
    await state.update_data(name=name)
    await reset_strikes(state)
    await go_to_step(message, state, lang, LeadForm.contact)


# ---------------------------------------------------------------------------
# S6: Контакт
# ---------------------------------------------------------------------------
@router.message(StateFilter(LeadForm.contact), F.contact)
async def contact_shared(message: Message, state: FSMContext, lang: str) -> None:
    """Пользователь поделился контактом через вложение Telegram."""
    phone = message.contact.phone_number
    if phone and not phone.startswith("+"):
        phone = "+" + phone
    await state.update_data(contact=phone)
    await reset_strikes(state)
    await go_to_step(message, state, lang, LeadForm.comment)


@router.message(StateFilter(LeadForm.contact), TEXT_NOT_COMMAND)
async def contact_entered(message: Message, state: FSMContext, user: User | None, lang: str) -> None:
    """Ввод и валидация телефона/email."""
    if await _maybe_handoff(message, state, user, lang):
        return
    contact = validate_contact(message.text or "")
    if contact is None:
        if await offer_manager_on_limit(message, state, lang):
            return
        await message.answer(t(lang, "contact_invalid"), reply_markup=inline.nav_kb(lang))
        return
    await state.update_data(contact=contact)
    await reset_strikes(state)
    await go_to_step(message, state, lang, LeadForm.comment)


# ---------------------------------------------------------------------------
# S7: Комментарий
# ---------------------------------------------------------------------------
@router.callback_query(StateFilter(LeadForm.comment), F.data == cb.COMMENT_SKIP)
async def comment_skip(cb_q: CallbackQuery, state: FSMContext, lang: str) -> None:
    """Пропуск комментария."""
    await cb_q.answer()
    await state.update_data(comment=None)
    await render_confirmation(cb_q, state, lang)


@router.message(StateFilter(LeadForm.comment), TEXT_NOT_COMMAND)
async def comment_entered(message: Message, state: FSMContext, user: User | None, lang: str) -> None:
    """Ввод комментария."""
    if await _maybe_handoff(message, state, user, lang):
        return
    await state.update_data(comment=(message.text or "").strip()[:500])
    await reset_strikes(state)
    await render_confirmation(message, state, lang)


# ---------------------------------------------------------------------------
# S8/S9: Подтверждение и сохранение
# ---------------------------------------------------------------------------
@router.callback_query(StateFilter(LeadForm.confirm), F.data == cb.CONFIRM_EDIT)
async def confirm_edit(cb_q: CallbackQuery, state: FSMContext, lang: str) -> None:
    """«Изменить» — начать воронку заново."""
    await cb_q.answer()
    await start_lead_funnel(cb_q, state, lang)


@router.message(StateFilter(LeadForm.confirm), TEXT_NOT_COMMAND)
async def confirm_text(message: Message, state: FSMContext, user: User | None, lang: str) -> None:
    """Текст на шаге подтверждения — напоминаем про кнопки, считаем непонимание."""
    if await _maybe_handoff(message, state, user, lang):
        return
    if await offer_manager_on_limit(message, state, lang):
        return
    await render_confirmation(message, state, lang)


@router.callback_query(StateFilter(LeadForm.confirm), F.data == cb.CONFIRM_SEND)
async def confirm_send(
    cb_q: CallbackQuery,
    state: FSMContext,
    session: AsyncSession,
    user: User | None,
    lang: str,
    bot: Bot,
    crm: CRMClient,
) -> None:
    """Финал (S9→S10): сохранить лид, отправить в CRM, уведомить менеджера."""
    await cb_q.answer()
    data = await state.get_data()

    # Индикатор «печатает…» на время работы с БД/CRM
    await bot.send_chat_action(cb_q.message.chat.id, "typing")

    # 1) Критично: сохраняем лид локально (не теряем данные клиента)
    try:
        payload = {
            "tg_user_id": user.id if user else cb_q.from_user.id,
            "tg_username": user.username if user else cb_q.from_user.username,
            "name": data.get("name", "—"),
            "contact": data.get("contact", "—"),
            "category": data.get("category"),
            "size": data.get("size"),
            "budget": data.get("budget"),
            "comment": data.get("comment"),
            "language": lang,
        }
        lead = await leads_service.create_lead(session, payload)
        await session.commit()
    except Exception as exc:  # noqa: BLE001
        logger.exception("Не удалось сохранить лид в БД: %s", exc)
        await cb_q.message.answer(t(lang, "error_generic"), reply_markup=inline.to_menu_kb(lang))
        return

    # 2) Best-effort: отправка в CRM (Google Sheets) с таймаутом и очередью
    if crm.enabled:
        pushed = await crm.push_lead(lead)
        if pushed:
            await leads_service.mark_synced(session, lead.id)
        else:
            await leads_service.enqueue_sync(session, lead.id, "CRM недоступна при создании")
        await session.commit()

    # 3) Best-effort: карточка менеджеру
    await notify_manager(bot, build_lead_card(lead))

    # 4) Финальный экран пользователю
    from bot.config import get_settings

    minutes = get_settings().manager_response_minutes
    await send_or_edit(
        cb_q,
        t(lang, "lead_saved", name=lead.name, minutes=minutes),
        inline.to_menu_kb(lang),
    )
    await state.clear()
    logger.info("Лид id=%s обработан (crm_enabled=%s)", lead.id, crm.enabled)
