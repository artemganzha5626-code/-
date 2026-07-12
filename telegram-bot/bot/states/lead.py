"""Состояния конечного автомата (FSM) воронки лида.

Каждый шаг воронки — отдельное состояние. Бот всегда помнит, где находится
пользователь, и не переспрашивает уже полученные данные.
"""

from __future__ import annotations

from aiogram.fsm.state import State, StatesGroup


class LeadForm(StatesGroup):
    """Шаги сбора заявки: S0..S8 из карты диалога."""

    choosing_language = State()  # S0: выбор языка
    category = State()           # S2: категория интереса
    category_other = State()     # S2': свободный ввод категории
    size = State()               # S3: размер (необязательно)
    budget = State()             # S4: бюджет (необязательно)
    name = State()               # S5: имя
    contact = State()            # S6: телефон / email
    comment = State()            # S7: комментарий (необязательно)
    confirm = State()            # S8: подтверждение перед отправкой
