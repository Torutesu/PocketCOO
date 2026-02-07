import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from services.memu_service import MemUService


class _FakeResponse:
    def __init__(self, payload, status_code=200):
        self._payload = payload
        self.status_code = status_code

    def raise_for_status(self):
        if self.status_code >= 400:
            raise Exception("http error")

    def json(self):
        return self._payload


class _FakeClient:
    def __init__(self, *args, **kwargs):
        pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def post(self, url, headers=None, json=None):
        if url.endswith("/api/v3/memory/retrieve"):
            return _FakeResponse(
                {
                    "rewritten_query": "dummy",
                    "items": [
                        {"memory_type": "preference", "content": "ユーザーは箇条書きを好む"},
                        {"memory_type": "habit", "content": "毎朝ランニングする"},
                    ],
                }
            )
        if url.endswith("/api/v3/memory/memorize"):
            return _FakeResponse({"task_id": "task_123", "status": "PENDING"})
        return _FakeResponse({}, status_code=404)

    def get(self, url, headers=None):
        return _FakeResponse({}, status_code=404)


def test_memuu_retrieve_is_used_when_api_key_set(monkeypatch):
    monkeypatch.setenv("MEMUU_API_KEY", "dummy_key")
    monkeypatch.setenv("MEMUU_BASE_URL", "https://api.memu.so")
    monkeypatch.setenv("MEMUU_AGENT_ID", "personalos")

    import services.memu_service as memu_mod

    monkeypatch.setattr(memu_mod.httpx, "Client", _FakeClient)

    svc = MemUService()
    results = svc.search_memories(query="好み", user_id="u1", limit=10)
    assert any(r.get("metadata", {}).get("provider") == "memuu" for r in results)


def test_memuu_memorize_is_called_after_buffer_has_three_messages(monkeypatch):
    monkeypatch.setenv("MEMUU_API_KEY", "dummy_key")
    monkeypatch.setenv("MEMUU_BASE_URL", "https://api.memu.so")
    monkeypatch.setenv("MEMUU_AGENT_ID", "personalos")

    import services.memu_service as memu_mod

    monkeypatch.setattr(memu_mod.httpx, "Client", _FakeClient)

    svc = MemUService()
    task1 = svc.record_chat_turn_for_memuu(user_id="u1", user_message="こんにちは", assistant_message="どうも")
    assert task1 is None
    task2 = svc.record_chat_turn_for_memuu(user_id="u1", user_message="好きな形式は？", assistant_message="箇条書きが良いです")
    assert task2 == "task_123"


def test_memuu_disabled_when_no_key(monkeypatch):
    monkeypatch.delenv("MEMUU_API_KEY", raising=False)
    monkeypatch.delenv("MEMU_API_KEY", raising=False)

    svc = MemUService()
    assert svc.retrieve_memories(query="x", user_id="u1") is None
