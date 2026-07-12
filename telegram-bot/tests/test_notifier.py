"""Тесты построения карточек для менеджера."""

from bot.models import Lead
from bot.services.notifier import build_handoff_card, build_lead_card


def _lead(**kw) -> Lead:
    defaults = dict(
        tg_user_id=555, tg_username="tester", name="Анна",
        contact="+380671234567", category="women", size="M",
        budget="1000_3000", comment="платье", language="ru", crm_status="pending",
    )
    defaults.update(kw)
    return Lead(**defaults)


def test_lead_card_contains_all_fields():
    card = build_lead_card(_lead())
    assert "Анна" in card
    assert "+380671234567" in card
    assert "Женское" in card          # категория локализована на русский
    assert "M" in card
    assert "1000" in card             # бюджет
    assert "платье" in card
    assert "@tester" in card
    assert "555" in card


def test_lead_card_without_optional_fields():
    card = build_lead_card(_lead(size=None, budget=None, comment=None))
    assert "Размер" not in card
    assert "Бюджет" not in card
    assert "Комментарий" not in card
    # Обязательные — на месте
    assert "Анна" in card and "+380671234567" in card


def test_handoff_card_partial_data_and_step():
    card = build_handoff_card(
        user_full_name="Иван Петров", username="ivanp", user_id=777,
        data={"category": "men", "name": "Иван"}, step_label="выбор размера",
    )
    assert "Иван Петров" in card
    assert "@ivanp" in card
    assert "777" in card
    assert "Мужское" in card
    assert "выбор размера" in card


def test_handoff_card_no_username_no_step():
    card = build_handoff_card(
        user_full_name=None, username=None, user_id=1, data={}, step_label=None,
    )
    assert "—" in card
    assert "главное меню" in card  # шаг по умолчанию
