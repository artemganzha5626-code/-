"""Тесты слоя работы с лидами в БД."""

from bot.services import leads as L


def _payload(**kw):
    data = dict(
        tg_user_id=555, tg_username="tester", name="Анна",
        contact="+380671234567", category="women", size="M",
        budget="1000_3000", comment="платье", language="ru",
    )
    data.update(kw)
    return data


async def test_create_lead(sessionmaker):
    async with sessionmaker() as s:
        lead = await L.create_lead(s, _payload())
        await s.commit()
        assert lead.id is not None
        assert lead.crm_status == "pending"
        assert lead.name == "Анна"


async def test_enqueue_and_get_pending(sessionmaker):
    async with sessionmaker() as s:
        lead = await L.create_lead(s, _payload())
        await L.enqueue_sync(s, lead.id, "CRM offline")
        await s.commit()
        pending = await L.get_pending(s)
        assert len(pending) == 1
        assert pending[0].lead_id == lead.id
        assert pending[0].last_error == "CRM offline"


async def test_mark_synced_and_drop(sessionmaker):
    async with sessionmaker() as s:
        lead = await L.create_lead(s, _payload())
        await L.enqueue_sync(s, lead.id)
        await s.commit()

        pending = await L.get_pending(s)
        await L.mark_synced(s, lead.id)
        await L.drop_pending(s, pending[0].id)
        await s.commit()

        refreshed = await L.get_lead(s, lead.id)
        assert refreshed.crm_status == "synced"
        assert await L.get_pending(s) == []


async def test_bump_pending_attempt(sessionmaker):
    async with sessionmaker() as s:
        lead = await L.create_lead(s, _payload())
        await L.enqueue_sync(s, lead.id)
        await s.commit()
        pending = (await L.get_pending(s))[0]
        await L.bump_pending_attempt(s, pending, "ещё раз не вышло")
        await s.commit()
        again = (await L.get_pending(s))[0]
        assert again.attempts == 1
        assert again.last_error == "ещё раз не вышло"
