"""Валидация свободного ввода: имя, телефон, email.

Возвращают нормализованное значение или None, если ввод не прошёл проверку.
Понятные подсказки при ошибке формируются в хендлерах через i18n.
"""

from __future__ import annotations

import re

# Телефон: допускаем +, пробелы, скобки, дефисы; 10–15 цифр итого.
_PHONE_RE = re.compile(r"^\+?[\d\s\-()]{9,20}$")
_DIGITS_RE = re.compile(r"\d")

# Email — прагматичная проверка (не полный RFC, но покрывает реальные адреса).
_EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")

# Имя: буквы (лат/кир), пробелы, дефис, апостроф. Без цифр и ссылок.
_NAME_RE = re.compile(r"^[A-Za-zА-Яа-яЁёІіЇїЄєҐґ'\-\s]{2,50}$")
_URL_RE = re.compile(r"(https?://|www\.|t\.me/|@\w)", re.IGNORECASE)


def validate_name(raw: str) -> str | None:
    """Проверить имя. Вернуть очищенное имя или None."""
    name = raw.strip()
    if _URL_RE.search(name):
        return None
    if not _NAME_RE.match(name):
        return None
    # Схлопываем множественные пробелы
    return re.sub(r"\s+", " ", name)


def validate_phone(raw: str) -> str | None:
    """Проверить телефон. Вернуть нормализованный (только + и цифры) или None."""
    value = raw.strip()
    if not _PHONE_RE.match(value):
        return None
    digits = "".join(_DIGITS_RE.findall(value))
    if not (9 <= len(digits) <= 15):
        return None
    # Сохраняем ведущий + если был, иначе добавляем по количеству цифр
    return ("+" if value.startswith("+") else "+") + digits


def validate_email(raw: str) -> str | None:
    """Проверить email. Вернуть нормализованный (lower) или None."""
    value = raw.strip().lower()
    return value if _EMAIL_RE.match(value) else None


def validate_contact(raw: str) -> str | None:
    """Контакт может быть телефоном ИЛИ email. Вернуть валидный или None."""
    return validate_phone(raw) or validate_email(raw)
