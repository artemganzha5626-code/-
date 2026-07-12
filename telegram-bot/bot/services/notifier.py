"""Уведомление менеджеров и безопасная рассылка (троттлинг + retry на 429).

Карточка лида уходит в отдельный чат/группу менеджеров (MANAGER_CHAT_ID).
Рассылка (если понадобится) учитывает лимит Telegram 30 сообщений/сек.
"""

from __future__ import annotations

import asyncio
from typing import Iterable

from aiogram import Bot
from aiogram.exceptions import TelegramRetryAfter, TelegramAPIError

from bot.config import get_settings
from bot.locales.i18n import budget_label, category_label
from bot.logger import get_logger
from bot.models import Lead

logger = get_logger(__name__)

# Безопасный лимит: держим ниже 30 msg/sec на бота
_BROADCAST_RATE = 25
_BROADCAST_DELAY = 1 / _BROADCAST_RATE


def build_lead_card(lead: Lead, stuck_step: str | None = None) -> str:
    """Собрать карточку лида для менеджера (на русском).

    :param stuck_step: если лид пришёл по кнопке «Связаться с менеджером»,
                       указываем шаг, на котором пользователь был.
    """
    username = f"@{lead.tg_username}" if lead.tg_username else "—"
    lines = [
        "🔥 <b>Новый лид — CRMino</b>",
        "",
        f"👤 <b>Имя:</b> {lead.name}",
        f"📞 <b>Контакт:</b> {lead.contact}",
        f"🛍 <b>Интерес:</b> {category_label(lead.category, 'ru')}",
    ]
    if lead.size:
        lines.append(f"📏 <b>Размер:</b> {lead.size}")
    if lead.budget:
        lines.append(f"💰 <b>Бюджет:</b> {budget_label(lead.budget, 'ru')}")
    if lead.comment:
        lines.append(f"💬 <b>Комментарий:</b> {lead.comment}")
    lines += [
        f"🌐 <b>Язык:</b> {lead.language}",
        f"🆔 <b>Telegram:</b> {username} (id <code>{lead.tg_user_id}</code>)",
    ]
    if stuck_step:
        lines.append(f"⚠️ <b>Остановился на шаге:</b> {stuck_step}")
    return "\n".join(lines)


def build_handoff_card(
    user_full_name: str | None,
    username: str | None,
    user_id: int,
    data: dict,
    step_label: str | None,
) -> str:
    """Карточка для менеджера, когда пользователь нажал «Связаться с менеджером».

    Воронка могла быть не завершена — берём всё, что уже известно из FSM-данных,
    и обязательно указываем шаг, на котором пользователь остановился.
    """
    uname = f"@{username}" if username else "—"
    lines = [
        "🙋 <b>Запрос менеджеру — CRMino</b>",
        "",
        f"👤 <b>Клиент:</b> {user_full_name or '—'}",
        f"🆔 <b>Telegram:</b> {uname} (id <code>{user_id}</code>)",
    ]
    # Всё, что уже успели собрать в воронке
    if data.get("name"):
        lines.append(f"✍️ <b>Имя:</b> {data['name']}")
    if data.get("contact"):
        lines.append(f"📞 <b>Контакт:</b> {data['contact']}")
    if data.get("category"):
        lines.append(f"🛍 <b>Интерес:</b> {category_label(data['category'], 'ru')}")
    if data.get("size"):
        lines.append(f"📏 <b>Размер:</b> {data['size']}")
    if data.get("budget"):
        lines.append(f"💰 <b>Бюджет:</b> {budget_label(data['budget'], 'ru')}")
    if data.get("comment"):
        lines.append(f"💬 <b>Комментарий:</b> {data['comment']}")
    lines.append(f"⚠️ <b>Остановился на шаге:</b> {step_label or 'главное меню'}")
    return "\n".join(lines)


async def notify_manager(bot: Bot, text: str) -> bool:
    """Отправить сообщение в чат менеджеров с обработкой ошибок.

    :return: True если доставлено, False если нет (не роняем основной поток).
    """
    settings = get_settings()
    try:
        await bot.send_message(settings.manager_chat_id, text)
        return True
    except TelegramRetryAfter as exc:
        # 429 — ждём указанное время и пробуем ещё раз
        logger.warning("429 при уведомлении менеджера, retry через %ss", exc.retry_after)
        await asyncio.sleep(exc.retry_after)
        try:
            await bot.send_message(settings.manager_chat_id, text)
            return True
        except TelegramAPIError as exc2:
            logger.error("Повторно не удалось уведомить менеджера: %s", exc2)
            return False
    except TelegramAPIError as exc:
        logger.error("Не удалось уведомить менеджера: %s", exc)
        return False


async def broadcast(bot: Bot, chat_ids: Iterable[int], text: str) -> dict[str, int]:
    """Массовая рассылка с троттлингом под лимит Telegram и retry на 429.

    Используется ТОЛЬКО когда пользователи явно подписаны. По ТЗ никаких
    самовольных напоминаний.

    :return: статистика {"sent": N, "failed": M}.
    """
    sent = 0
    failed = 0
    for chat_id in chat_ids:
        try:
            await bot.send_message(chat_id, text)
            sent += 1
        except TelegramRetryAfter as exc:
            logger.warning("429 в рассылке, пауза %ss", exc.retry_after)
            await asyncio.sleep(exc.retry_after)
            try:
                await bot.send_message(chat_id, text)
                sent += 1
            except TelegramAPIError:
                failed += 1
        except TelegramAPIError as exc:
            # Пользователь заблокировал бота и т.п. — просто считаем и идём дальше
            logger.info("Рассылка: не доставлено в %s (%s)", chat_id, exc)
            failed += 1
        # Троттлинг: держимся ниже лимита 30 msg/sec
        await asyncio.sleep(_BROADCAST_DELAY)
    logger.info("Рассылка завершена: доставлено=%s, ошибок=%s", sent, failed)
    return {"sent": sent, "failed": failed}
