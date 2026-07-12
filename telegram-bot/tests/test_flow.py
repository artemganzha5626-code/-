"""Интеграционные тесты диалога: прогон апдейтов через реальный диспетчер."""

from bot.services import leads as L
from tests.factories import MANAGER_CHAT_ID, cb_update, msg_update


async def test_start_shows_language(feed):
    bot = await feed(msg_update(1, "/start"))
    assert "SendMessage" in bot.method_names()
    assert "Выберите язык" in bot.all_text()


async def test_language_switch_to_english(feed):
    await feed(msg_update(1, "/start"))
    bot = await feed(cb_update(2, "lang:en"))
    assert "AnswerCallbackQuery" in bot.method_names()
    # Меню-приветствие пришло на английском
    assert "Hello" in bot.all_text()


async def test_full_funnel_creates_lead(feed, sessionmaker):
    steps = [
        msg_update(1, "/start"),
        cb_update(2, "lang:ru"),
        cb_update(3, "menu:lead"),
        cb_update(4, "cat:women"),
        cb_update(5, "size:M"),
        cb_update(6, "budget:skip"),
        msg_update(7, "Анна"),
        msg_update(8, "+380671234567"),
        cb_update(9, "comment:skip"),
        cb_update(10, "confirm:send"),
    ]
    bot = None
    for u in steps:
        bot = await feed(u)

    # Финальный шаг: индикатор, карточка менеджеру и благодарность пользователю
    names = bot.method_names()
    assert "SendChatAction" in names
    assert bot.messages_to(MANAGER_CHAT_ID), "карточка менеджеру не отправлена"
    assert "Спасибо" in bot.all_text()

    # Лид реально сохранён
    async with sessionmaker() as s:
        lead = await L.get_lead(s, 1)
        assert lead is not None
        assert lead.name == "Анна"
        assert lead.contact == "+380671234567"
        assert lead.category == "women"
        assert lead.size == "M"
        assert lead.language == "ru"


async def test_manager_intent_triggers_handoff(feed):
    await feed(msg_update(1, "/start"))
    await feed(cb_update(2, "lang:ru"))
    bot = await feed(msg_update(3, "позовите менеджера"))
    # Карточка ушла менеджеру, пользователю — уведомление
    assert bot.messages_to(MANAGER_CHAT_ID)
    assert "менеджер" in bot.all_text().lower()


async def test_three_strikes_offers_manager(feed):
    await feed(msg_update(1, "/start"))
    await feed(cb_update(2, "lang:ru"))

    bot = await feed(msg_update(3, "asdf qwer"))
    assert "Не совсем понял" in bot.all_text()

    await feed(msg_update(4, "zzz xxx"))
    bot = await feed(msg_update(5, "qqq rrr"))
    # На третье непонимание — предложение менеджера
    assert "менеджер" in bot.all_text().lower()


async def test_invalid_contact_shows_hint(feed):
    seq = [
        msg_update(1, "/start"),
        cb_update(2, "lang:ru"),
        cb_update(3, "menu:lead"),
        cb_update(4, "cat:men"),
        cb_update(5, "size:skip"),
        cb_update(6, "budget:skip"),
        msg_update(7, "Иван"),
    ]
    for u in seq:
        await feed(u)
    bot = await feed(msg_update(8, "не скажу"))
    assert "не похоже на телефон" in bot.all_text()


async def test_back_navigation_returns_to_previous_step(feed):
    await feed(msg_update(1, "/start"))
    await feed(cb_update(2, "lang:ru"))
    await feed(cb_update(3, "menu:lead"))     # → категория
    await feed(cb_update(4, "cat:women"))     # → размер
    bot = await feed(cb_update(5, "nav:back"))  # ← назад к категории
    assert "Что вас интересует" in bot.all_text()


async def test_start_resets_fsm_midway(feed):
    await feed(msg_update(1, "/start"))
    await feed(cb_update(2, "lang:ru"))
    await feed(cb_update(3, "menu:lead"))
    await feed(cb_update(4, "cat:women"))     # в середине воронки
    bot = await feed(msg_update(5, "/start"))  # сброс
    # Снова показан выбор языка (состояние очищено)
    assert "Выберите язык" in bot.all_text()
