"""Простой intent-matching по ключевым словам (ru/uk/en).

Когда пользователь пишет текстом вместо нажатия кнопки — пытаемся понять
намерение, а не сразу отвечать «не понял». Не ML, а прагматичный словарь:
дёшево, быстро, предсказуемо.
"""

from __future__ import annotations

# Намерение -> набор подстрок-триггеров (регистронезависимо)
_KEYWORDS: dict[str, tuple[str, ...]] = {
    "manager": (
        "менедж", "оператор", "человек", "живой", "консультант",  # ru
        "менедж", "людин", "оператор",                              # uk
        "manager", "human", "agent", "operator", "support",         # en
    ),
    "lead": (
        "заявк", "купить", "заказ", "хочу", "подобрать", "оставить",  # ru
        "заявк", "купити", "замовлен", "хочу", "підібрати", "залишити",  # uk
        "request", "buy", "order", "want", "lead", "leave",           # en
    ),
    "faq": (
        "достав", "оплат", "возврат", "обмен", "вопрос", "цена", "гарант",  # ru
        "достав", "оплат", "поверн", "обмін", "питанн", "ціна",             # uk
        "delivery", "payment", "return", "refund", "faq", "price", "question",  # en
    ),
    "menu": (
        "меню", "начать", "старт", "назад",   # ru/uk
        "menu", "start", "back", "home",      # en
    ),
    "greeting": (
        "привет", "здравств", "добрый", "хай",   # ru
        "привіт", "вітаю", "добрий",             # uk
        "hello", "hi", "hey",                     # en
    ),
}


def detect_intent(text: str) -> str | None:
    """Определить намерение по тексту. Вернуть код намерения или None.

    Порядок проверки важен: сначала явный запрос менеджера, затем заявка,
    FAQ, меню и приветствие.
    """
    if not text:
        return None
    lowered = text.lower()
    for intent in ("manager", "lead", "faq", "menu", "greeting"):
        for kw in _KEYWORDS[intent]:
            if kw in lowered:
                return intent
    return None
