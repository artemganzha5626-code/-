"""Тесты фоновой досинхронизации очереди pending_sync."""

from bot.services import leads as L
from bot.services.sync import _process_batch


class _FakeCRM:
    """Заглушка CRM с управляемым результатом push_lead."""

    def __init__(self, ok: bool):
        self.enabled = True
        self._ok = ok
        self.pushed: list[int] = []

    async def push_lead(self, lead) -> bool:
        self.pushed.append(lead.id)
        return self._ok


def _payload():
    return dict(
        tg_user_id=555, tg_username="t", name="Анна", contact="+380671234567",
        category="women", size=None, budget=None, comment=None, language="ru",
    )


async def test_process_batch_success(sessionmaker):
    async with sessionmaker() as s:
        lead = await L.create_lead(s, _payload())
        await L.enqueue_sync(s, lead.id, "offline")
        await s.commit()
        lead_id = lead.id

    crm = _FakeCRM(ok=True)
    done = await _process_batch(sessionmaker, crm)
    assert done == 1
    assert crm.pushed == [lead_id]

    async with sessionmaker() as s:
        assert (await L.get_lead(s, lead_id)).crm_status == "synced"
        assert await L.get_pending(s) == []


async def test_process_batch_failure_keeps_queue(sessionmaker):
    async with sessionmaker() as s:
        lead = await L.create_lead(s, _payload())
        await L.enqueue_sync(s, lead.id, "offline")
        await s.commit()

    crm = _FakeCRM(ok=False)
    done = await _process_batch(sessionmaker, crm)
    assert done == 0

    async with sessionmaker() as s:
        pending = await L.get_pending(s)
        assert len(pending) == 1
        assert pending[0].attempts == 1  # попытка засчитана


async def test_process_batch_drops_orphan_pending(sessionmaker):
    # Задача в очереди ссылается на несуществующий лид → чистим
    async with sessionmaker() as s:
        await L.enqueue_sync(s, lead_id=99999)
        await s.commit()

    crm = _FakeCRM(ok=True)
    await _process_batch(sessionmaker, crm)

    async with sessionmaker() as s:
        assert await L.get_pending(s) == []
    assert crm.pushed == []  # push не вызывался — лида нет
