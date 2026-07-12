"""Тесты валидаторов свободного ввода."""

import pytest

from bot.utils.validators import (
    validate_contact,
    validate_email,
    validate_name,
    validate_phone,
)


@pytest.mark.parametrize("raw,expected", [
    ("Анна", "Анна"),
    ("  Іван  ", "Іван"),
    ("Mary Jane", "Mary Jane"),
    ("Анна-Мария", "Анна-Мария"),
    ("O'Brien", "O'Brien"),
])
def test_valid_names(raw, expected):
    assert validate_name(raw) == expected


@pytest.mark.parametrize("raw", [
    "A",                       # слишком короткое
    "Иван123",                 # цифры
    "http://spam.com",         # ссылка
    "t.me/spammer",            # телеграм-ссылка
    "@username",               # упоминание
    "x" * 60,                  # слишком длинное
    "",                        # пусто
])
def test_invalid_names(raw):
    assert validate_name(raw) is None


@pytest.mark.parametrize("raw,expected", [
    ("+380671234567", "+380671234567"),
    ("380671234567", "+380671234567"),
    ("+7 (912) 345-67-89", "+79123456789"),
    ("067 123 45 67", "+0671234567"),
])
def test_valid_phones(raw, expected):
    assert validate_phone(raw) == expected


@pytest.mark.parametrize("raw", ["12345", "abcdefg", "phone", "++++"])
def test_invalid_phones(raw):
    assert validate_phone(raw) is None


@pytest.mark.parametrize("raw,expected", [
    ("name@mail.com", "name@mail.com"),
    ("  User@Mail.COM ", "user@mail.com"),
    ("a.b+tag@sub.domain.io", "a.b+tag@sub.domain.io"),
])
def test_valid_emails(raw, expected):
    assert validate_email(raw) == expected


@pytest.mark.parametrize("raw", ["notanemail", "a@b", "@mail.com", "x@y."])
def test_invalid_emails(raw):
    assert validate_email(raw) is None


def test_contact_accepts_phone_or_email():
    assert validate_contact("+380671234567") == "+380671234567"
    assert validate_contact("name@mail.com") == "name@mail.com"
    assert validate_contact("не скажу") is None
