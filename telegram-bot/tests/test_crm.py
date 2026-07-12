"""Тесты поведения CRM-клиента (без реального Google Sheets)."""

from bot.config import Settings
from bot.models import Lead
from bot.services.crm import CRMClient


def _lead():
    return Lead(
        tg_user_id=1, tg_username="t", name="Анна", contact="+380671234567",
        category="women", size=None, budget=None, comment=None,
        language="ru", crm_status="pending",
    )


def test_crm_disabled_without_creds():
    settings = Settings(
        BOT_TOKEN="1:x", MANAGER_CHAT_ID=-1,
        GOOGLE_CREDENTIALS_FILE=None, GOOGLE_SHEET_ID=None,
    )
    crm = CRMClient(settings)
    assert crm.enabled is False


async def test_push_lead_returns_false_when_disabled():
    settings = Settings(BOT_TOKEN="1:x", MANAGER_CHAT_ID=-1)
    crm = CRMClient(settings)
    # CRM выключена → отправка не выполняется, лид уйдёт в очередь
    assert await crm.push_lead(_lead()) is False


def test_crm_enabled_with_creds():
    settings = Settings(
        BOT_TOKEN="1:x", MANAGER_CHAT_ID=-1,
        GOOGLE_CREDENTIALS_FILE="/tmp/creds.json", GOOGLE_SHEET_ID="abc123",
    )
    assert CRMClient(settings).enabled is True
