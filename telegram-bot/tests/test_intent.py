"""Тесты intent-matching по ключевым словам."""

import pytest

from bot.services.intent import detect_intent


@pytest.mark.parametrize("text,intent", [
    # менеджер
    ("хочу поговорить с менеджером", "manager"),
    ("покличте оператора", "manager"),
    ("connect me to a human", "manager"),
    # заявка
    ("хочу оставить заявку", "lead"),
    ("хочу купити сукню", "lead"),
    ("i want to order", "lead"),
    # faq
    ("сколько стоит доставка", "faq"),
    ("яка оплата", "faq"),
    ("what about refund", "faq"),
    # меню
    ("меню", "menu"),
    ("back", "menu"),
    # приветствие
    ("привет", "greeting"),
    ("hello there", "greeting"),
])
def test_detects_intents(text, intent):
    assert detect_intent(text) == intent


@pytest.mark.parametrize("text", ["asdf qwer", "zzz xxx", "", "42"])
def test_unknown_intent(text):
    assert detect_intent(text) is None


def test_manager_has_priority_over_faq():
    # В тексте есть и «цена», и «менеджер» — приоритет у менеджера
    assert detect_intent("какая цена, позовите менеджера") == "manager"
