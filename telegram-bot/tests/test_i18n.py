"""Тесты локализации: паритет ключей, фолбэки, форматирование."""

import pytest

from bot.locales import en, ru, uk
from bot.locales.i18n import (
    SUPPORTED_LANGS,
    budget_label,
    category_label,
    normalize_lang,
    t,
)


def test_locale_key_parity():
    """Во всех языках должен быть одинаковый набор ключей."""
    ru_keys = set(ru.TEXTS)
    assert set(uk.TEXTS) == ru_keys, set(uk.TEXTS) ^ ru_keys
    assert set(en.TEXTS) == ru_keys, set(en.TEXTS) ^ ru_keys


def test_supported_langs():
    assert set(SUPPORTED_LANGS) == {"ru", "uk", "en"}


@pytest.mark.parametrize("raw,expected", [
    ("ru", "ru"), ("uk", "uk"), ("en", "en"),
    ("de", "ru"), (None, "ru"), ("", "ru"),
])
def test_normalize_lang(raw, expected):
    assert normalize_lang(raw) == expected


def test_translation_and_fallback():
    assert t("en", "btn_menu")  # существует
    # Неизвестный ключ → возвращается сам ключ, без исключения
    assert t("ru", "no_such_key_xyz") == "no_such_key_xyz"
    # Неизвестный язык → фолбэк на русский
    assert t("de", "confirm_name") == ru.TEXTS["confirm_name"]


def test_translation_formatting():
    out = t("ru", "lead_saved", name="Анна", minutes=15)
    assert "Анна" in out and "15" in out
    # Отсутствующий kwarg не роняет — возвращает шаблон
    assert t("ru", "lead_saved") == ru.TEXTS["lead_saved"]


def test_category_and_budget_labels():
    assert category_label("women", "en") == en.TEXTS["cat_women"]
    assert category_label("women", "uk") == uk.TEXTS["cat_women"]
    # Свободный ввод возвращается как есть
    assert category_label("вечернее платье", "ru") == "вечернее платье"
    assert budget_label("lt1000", "en") == en.TEXTS["budget_lt1000"]
    assert budget_label(None, "ru") == ru.TEXTS["confirm_empty"]
