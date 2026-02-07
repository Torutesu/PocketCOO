import sys
from pathlib import Path
import os

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


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
        if url.endswith("/api/v3/memory/categories"):
            return _FakeResponse(
                {
                    "categories": [
                        {
                            "name": "preferences",
                            "description": "User preferences",
                            "user_id": json.get("user_id"),
                            "agent_id": json.get("agent_id"),
                            "summary": "箇条書きが好き",
                        }
                    ]
                }
            )
        if url.endswith("/api/v3/memory/retrieve"):
            return _FakeResponse(
                {
                    "items": [
                        {"memory_type": "preference", "content": "ユーザーは箇条書きを好む"},
                        {"memory_type": "preference", "content": "数字・データを多めにしてほしい"},
                    ]
                }
            )
        if url.endswith("/api/v3/memory/memorize"):
            return _FakeResponse({"task_id": "task_123", "status": "PENDING"})
        return _FakeResponse({}, status_code=404)

    def get(self, url, headers=None):
        return _FakeResponse({}, status_code=404)


def test_memuu_categories_endpoint(monkeypatch):
    prev_api_key = os.environ.get("API_KEY")
    os.environ["API_KEY"] = "testkey"
    try:
        monkeypatch.setenv("MEMUU_API_KEY", "dummy_key")
        monkeypatch.setenv("MEMUU_BASE_URL", "https://api.memu.so")
        monkeypatch.setenv("MEMUU_AGENT_ID", "personalos")

        import services.memu_service as memu_mod

        monkeypatch.setattr(memu_mod.httpx, "Client", _FakeClient)

        res = client.get("/api/memuu/categories?userId=u1", headers={"x-api-key": "testkey"})
        assert res.status_code == 200
        body = res.json()
        assert "categories" in body
        assert body["categories"][0]["name"] == "preferences"
    finally:
        if prev_api_key is None:
            os.environ.pop("API_KEY", None)
        else:
            os.environ["API_KEY"] = prev_api_key


def test_pocket_chat_applies_memuu_identity_hints(monkeypatch):
    prev_api_key = os.environ.get("API_KEY")
    os.environ["API_KEY"] = "testkey"
    try:
        monkeypatch.setenv("MEMUU_API_KEY", "dummy_key")
        monkeypatch.setenv("MEMUU_BASE_URL", "https://api.memu.so")
        monkeypatch.setenv("MEMUU_AGENT_ID", "personalos")

        import services.memu_service as memu_mod

        monkeypatch.setattr(memu_mod.httpx, "Client", _FakeClient)

        user_id = "memuu_user_1"
        res = client.post(
            "/api/chat",
            json={"message": "これやっといて", "userId": user_id},
            headers={"x-api-key": "testkey"},
        )
        assert res.status_code == 200

        mem = client.get(f"/api/memory?userId={user_id}", headers={"x-api-key": "testkey"})
        assert mem.status_code == 200
        state = mem.json()
        style = (state.get("identity") or {}).get("style") or {}
        assert style.get("format") == "bullet_points"
        assert style.get("detail_level") == "data_driven"
    finally:
        if prev_api_key is None:
            os.environ.pop("API_KEY", None)
        else:
            os.environ["API_KEY"] = prev_api_key
