import sys
from pathlib import Path
import os

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json().get("status") == "healthy"


def test_memory_create_and_list():
    user_id = "test_user"
    res = client.post(
        "/api/memory/",
        json={"content": "テスト記憶", "user_id": user_id, "metadata": {"category": "test"}},
    )
    assert res.status_code == 200

    res2 = client.get(f"/api/memory/all/{user_id}")
    assert res2.status_code == 200
    body = res2.json()
    assert "memories" in body
    assert len(body["memories"]) >= 1


def test_chat_without_openai_key():
    res = client.post(
        "/api/chat/message",
        json={"message": "こんにちは", "user_id": "test_user", "use_memory": True},
    )
    assert res.status_code == 200
    body = res.json()
    assert "response" in body


def test_pocket_chat_and_memory():
    user_id = "user_001"

    res = client.post("/api/chat", json={"message": "市場調査やっといて。箇条書きで数字多め。", "userId": user_id})
    assert res.status_code == 200
    body = res.json()
    assert "response" in body
    assert "score" in body
    assert "scoreDelta" in body
    assert "newMemory" in body
    episode_id = body.get("newMemory", {}).get("episodes", [{}])[0].get("id")
    assert episode_id

    res_fb = client.post(
        "/api/feedback",
        json={"userId": user_id, "episodeId": episode_id, "rating": "like", "comment": "良い感じ"},
    )
    assert res_fb.status_code == 200

    res2 = client.get(f"/api/memory?userId={user_id}")
    assert res2.status_code == 200
    mem = res2.json()
    assert mem.get("userId") == user_id
    assert "identity" in mem
    assert "projects" in mem
    assert "episodes" in mem
    assert "score" in mem
    target = next((e for e in mem.get("episodes", []) if e.get("id") == episode_id), None)
    assert target
    assert target.get("feedback", {}).get("rating") == "like"
    assert target.get("memory_used") is not None


def test_feedback_comment_updates_identity_style():
    user_id = "user_002"

    res = client.post("/api/chat", json={"message": "文章でお願い。", "userId": user_id})
    assert res.status_code == 200
    body = res.json()
    episode_id = body.get("newMemory", {}).get("episodes", [{}])[0].get("id")
    assert episode_id

    res_fb = client.post(
        "/api/feedback",
        json={"userId": user_id, "episodeId": episode_id, "rating": "dislike", "comment": "やっぱり箇条書きで。数字も。"},
    )
    assert res_fb.status_code == 200

    res2 = client.get(f"/api/memory?userId={user_id}")
    assert res2.status_code == 200
    mem = res2.json()
    style = (mem.get("identity") or {}).get("style") or {}
    assert style.get("format") == "bullet_points"
    assert style.get("detail_level") == "data_driven"


def test_api_key_auth_enforced_and_user_state_api():
    prev = os.environ.get("API_KEY")
    os.environ["API_KEY"] = "testkey"
    try:
        res_health = client.get("/api/health")
        assert res_health.status_code == 200

        res_no_key = client.post("/api/chat", json={"message": "テスト", "userId": "k_user"})
        assert res_no_key.status_code == 401

        res_ok = client.post(
            "/api/chat",
            json={"message": "テスト", "userId": "k_user"},
            headers={"x-api-key": "testkey"},
        )
        assert res_ok.status_code == 200

        put_body = {
            "userId": "k_user",
            "identity": {"style": {"format": "bullet_points"}, "preferences": [], "updated_at": None},
            "projects": [],
            "episodes": [],
            "score": 0,
        }
        res_put = client.put("/api/user/k_user", json=put_body, headers={"x-api-key": "testkey"})
        assert res_put.status_code == 200

        res_get = client.get("/api/user/k_user", headers={"x-api-key": "testkey"})
        assert res_get.status_code == 200
        body = res_get.json()
        assert body.get("userId") == "k_user"
        assert (body.get("identity") or {}).get("style", {}).get("format") == "bullet_points"
    finally:
        if prev is None:
            os.environ.pop("API_KEY", None)
        else:
            os.environ["API_KEY"] = prev
