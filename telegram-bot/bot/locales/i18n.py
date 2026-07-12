"""Простой словарный переводчик.

Функция t(lang, key, **kwargs) возвращает готовый текст на нужном языке.
Если ключа нет в выбранном языке — фолбэк на русский, затем на сам ключ.
"""

from __future__ import annotations

from bot.locales import en, ru, uk

# Реестр языков
_REGISTRY: dict[str, dict[str, str]] = {
    "ru": ru.TEXTS,
    "uk": uk.TEXTS,
    "en": en.TEXTS,
}

DEFAULT_LANG = "ru"
SUPPORTED_LANGS = tuple(_REGISTRY.keys())

# Канонические коды категорий → ключ локали
CATEGORY_KEYS: dict[str, str] = {
    "women": "cat_women",
    "men": "cat_men",
    "kids": "cat_kids",
    "accessories": "cat_accessories",
    "wholesale": "cat_wholesale",
    "other": "cat_other",
}

# Канонические коды бюджета → ключ локали
BUDGET_KEYS: dict[str, str] = {
    "lt1000": "budget_lt1000",
    "1000_3000": "budget_1000_3000",
    "gt3000": "budget_gt3000",
}


def normalize_lang(lang: str | None) -> str:
    """Привести язык к поддерживаемому, иначе вернуть язык по умолчанию."""
    if lang and lang in _REGISTRY:
        return lang
    return DEFAULT_LANG


def t(lang: str, key: str, **kwargs) -> str:
    """Перевести ключ на язык lang с подстановкой параметров.

    :param lang: код языка (ru/uk/en).
    :param key: ключ строки.
    :param kwargs: значения для .format().
    """
    lang = normalize_lang(lang)
    text = _REGISTRY[lang].get(key) or _REGISTRY[DEFAULT_LANG].get(key) or key
    if kwargs:
        try:
            return text.format(**kwargs)
        except (KeyError, IndexError):
            # Не роняем бота из-за проблем форматирования — возвращаем как есть
            return text
    return text


def category_label(code: str | None, lang: str) -> str:
    """Человекочитаемое название категории на нужном языке.

    Если code не из справочника — считаем, что это свободный ввод «Другое».
    """
    if not code:
        return t(lang, "confirm_empty")
    key = CATEGORY_KEYS.get(code)
    if key:
        return t(lang, key)
    return code  # свободный текст пользователя


def budget_label(code: str | None, lang: str) -> str:
    """Человекочитаемый диапазон бюджета на нужном языке."""
    if not code:
        return t(lang, "confirm_empty")
    key = BUDGET_KEYS.get(code)
    return t(lang, key) if key else code
