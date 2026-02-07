from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import json
import uuid
import hashlib
import math
import re

from sqlalchemy.orm import Session

from db.models import UserState


def _now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


def default_user_memory(user_id: str) -> Dict[str, Any]:
    return {
        "userId": user_id,
        "identity": {
            "style": {},
            "preferences": [],
            "updated_at": _now_iso(),
        },
        "projects": [],
        "episodes": [],
        "score": 0,
    }


def _is_demo_user(user_id: str) -> bool:
    u = (user_id or "").strip().lower()
    return u in {"default_user", "demo", "demo_user"} or u.startswith("demo_")


def _demo_profile(user_id: str) -> Dict[str, Any]:
    display = "徹"
    if user_id and user_id not in {"default_user", "demo", "demo_user"}:
        cleaned = re.sub(r"[_-]+", " ", user_id).strip()
        if cleaned:
            display = cleaned[:24]
    return {
        "displayName": display,
        "personas": ["日本人", "ソロプレナー", "エンジニア", "グローバルプロダクト"],
        "base": "東京",
        "timezone": "Asia/Tokyo",
        "languages": ["日本語", "English"],
        "product": "グローバル向けSaaS（B2B）",
        "northStar": "Weekly Activated Teams",
        "focus": ["PMF→Scale", "収益化", "計測/実験", "信頼性/運用"],
    }


def _demo_templates() -> List[Dict[str, Any]]:
    return [
        {
            "summary": "北極星指標の定義を詰めた（WAT/定義/計測）",
            "user": "北極星指標（North Star）を『Weekly Activated Teams』にする案、定義を固めたい。イベント設計も。",
            "assistant": "結論: WATでOK。理由: 価値の継続利用を直接表す。次アクション: ①Activation条件を3段階で定義 ②イベント命名規則 ③ダッシュボード1枚に落とす。",
            "tags": ["product", "pm", "engineering"],
            "topics": ["north star", "kpi", "計測", "event schema", "activation", "dashboard"],
        },
        {
            "summary": "英語LPのA/B（訴求/比較表/CTA）を設計",
            "user": "英語LPのCVRを上げたい。訴求と比較表、CTAの案を出して。",
            "assistant": "結論: 3訴求×2CTAでA/B。理由: 早く学習できる。次アクション: ①仮説と成功指標 ②比較表の差別化軸 ③計測イベントの実装。",
            "tags": ["product", "launch"],
            "topics": ["lp", "ab test", "copy", "cta", "cvr", "experiment"],
        },
        {
            "summary": "B2Bオンボーディングの摩擦を洗い出し（7分→3分）",
            "user": "オンボーディングが重い。初回体験を短くしたい。",
            "assistant": "結論: 3分で価値到達。理由: 初回の離脱が最大ボトルネック。次アクション: ①必須入力を2つに圧縮 ②テンプレデータ自動投入 ③成功体験までの導線を1本化。",
            "tags": ["product", "pm"],
            "topics": ["onboarding", "activation", "ux", "dropoff", "funnel"],
        },
        {
            "summary": "多言語対応の設計（i18n/通貨/税）を整理",
            "user": "グローバル対応したい。i18nと通貨・税の設計観点まとめて。",
            "assistant": "結論: i18nは最小から。理由: 先に価値検証が必要。次アクション: ①文言キー設計 ②通貨はUSD固定→段階導入 ③請求書/税は後追いで機能フラグ。",
            "tags": ["product", "engineering", "launch"],
            "topics": ["i18n", "currency", "tax", "feature flag", "global"],
        },
        {
            "summary": "SLOと監視を導入（p95/エラー率/オンコール）",
            "user": "最近遅い。SLOと監視を整えたい。最小構成は？",
            "assistant": "結論: 3指標で回す（p95/5xx/ジョブ失敗）。理由: 運用負荷を増やさず改善できる。次アクション: ①SLO定義 ②アラート閾値 ③週次レビュー。",
            "tags": ["reliability", "engineering"],
            "topics": ["slo", "monitoring", "latency", "alert", "oncall"],
        },
        {
            "summary": "価格テスト（$19/$39/$79）とパッケージング案",
            "user": "価格どうする？3つくらい案を出して、テスト設計も。",
            "assistant": "結論: 3ティアでOK。理由: 価値の段階に沿う。次アクション: ①機能の線引き ②価格仮説 ③LP/CheckoutのAB ④回収指標(ARPA/解約)。",
            "tags": ["product", "pm", "launch"],
            "topics": ["pricing", "packaging", "arpa", "churn", "experiment"],
        },
        {
            "summary": "技術負債の返済計画（2週間で体感改善）",
            "user": "技術負債が溜まった。2週間で体感改善する返済計画を作りたい。",
            "assistant": "結論: 3カテゴリで切る（速度/品質/運用）。理由: 効果が測れる。次アクション: ①ボトルネック計測 ②リファクタ候補をImpact×Effortで並べ替え ③週次で効果測定。",
            "tags": ["engineering", "pm"],
            "topics": ["tech debt", "refactor", "metrics", "impact effort", "velocity"],
        },
        {
            "summary": "ユーザーインタビューの台本を作成（仮説検証）",
            "user": "ユーザーインタビューの台本と質問リストを作りたい。",
            "assistant": "結論: 仮説→反証の流れで。理由: 学びが最大化。次アクション: ①スクリーニング条件 ②当日台本 ③学びの整理テンプレ。",
            "tags": ["product"],
            "topics": ["interview", "discovery", "hypothesis", "research", "pmf"],
        },
    ]


def _build_demo_episodes(total: int) -> List[Dict[str, Any]]:
    now = datetime.utcnow()
    templates = _demo_templates()
    out: List[Dict[str, Any]] = []
    for i in range(total):
        t = templates[i % len(templates)]
        dt = now - timedelta(days=int((total - i) * 0.6), hours=int((i * 7) % 24))
        summary = t["summary"]
        user_message = t["user"]
        assistant_message = t["assistant"]
        full_text = "\n".join([user_message, assistant_message, summary]).strip()
        tokens_for_embed = _tokens_from_text(full_text, include_bigrams=True)
        embedding_dim = 96
        embedding = _hash_embedding_int8(tokens_for_embed, dim=embedding_dim)
        episode = {
            "id": f"ep_demo_{i:04d}",
            "date": dt.isoformat() + "Z",
            "type": "demo_log",
            "user_message": user_message,
            "assistant_message": assistant_message,
            "memory_used": [],
            "summary": summary,
            "learnings": [],
            "feedback": None,
            "tags": t.get("tags") or [],
            "topics": t.get("topics") or [],
            "embedding": embedding,
            "embedding_dim": embedding_dim,
            "embedding_model": "hashing_v1_int8",
            "embedding_at": _now_iso(),
        }
        out.append(episode)
    return out


def seeded_demo_state(user_id: str) -> Dict[str, Any]:
    state = default_user_memory(user_id)
    profile = _demo_profile(user_id)
    identity = state.setdefault("identity", {})
    identity["profile"] = profile
    identity["style"] = {
        "tone": "結論→理由→次アクション",
        "language": "日本語（必要なら英語）",
        "format": "箇条書き＋必要なら表",
        "depth": "まず全体像→深掘り",
        "product": "北極星指標から逆算",
        "engineering": "リスク/依存/計測を明示",
    }
    identity["preferences"] = [
        {"key": "意思決定", "value": "選択肢→比較→推奨案→根拠", "confidence": 0.92},
        {"key": "重視", "value": "数字・データ", "confidence": 0.9},
        {"key": "スピード", "value": "小さく出して学習", "confidence": 0.88},
        {"key": "設計", "value": "API/DB/運用まで一気通貫", "confidence": 0.9},
    ]
    identity["updated_at"] = _now_iso()

    state["projects"] = [
        {
            "id": "proj_demo_001",
            "name": "Pocket COO",
            "status": "in_progress",
            "goal": "グローバルPMF→Scale",
            "north_star": profile.get("northStar"),
            "region": "Global",
        },
        {
            "id": "proj_demo_002",
            "name": "Billing/Monetization",
            "status": "in_progress",
            "goal": "価格/パッケージングの検証",
            "region": "US/EU",
        },
        {
            "id": "proj_demo_003",
            "name": "Reliability Baseline",
            "status": "in_progress",
            "goal": "SLO/監視/オンコールの最小構成",
            "region": "Global",
        },
    ]
    state["episodes"] = _build_demo_episodes(total=110)
    state["demoSeeded"] = "v1"
    state["score"] = calculate_score(state)
    return state


def ensure_demo_seeded(state: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
    uid = (state.get("userId") or user_id or "").strip()
    if uid and state.get("userId") != uid:
        state["userId"] = uid
    if not _is_demo_user(uid):
        return state
    if state.get("demoSeeded") == "v1":
        return state
    return seeded_demo_state(uid or "default_user")


def _identity_count(identity: Dict[str, Any]) -> int:
    style = identity.get("style") or {}
    preferences = identity.get("preferences") or []
    style_count = sum(1 for v in style.values() if v not in (None, "", []))
    pref_count = len(preferences)
    return style_count + pref_count


def _project_count(projects: List[Dict[str, Any]]) -> int:
    return len(projects or [])


def _episode_count(episodes: List[Dict[str, Any]]) -> int:
    return len(episodes or [])


def calculate_score(state: Dict[str, Any]) -> int:
    identity_n = _identity_count(state.get("identity") or {})
    projects_n = _project_count(state.get("projects") or [])
    episodes_n = _episode_count(state.get("episodes") or [])
    identity_score = min(50, identity_n * 5)
    projects_score = min(25, projects_n * 8)
    episodes_score = int(round(25 * (1.0 - math.exp(-float(episodes_n) / 60.0))))
    score = identity_score + projects_score + episodes_score
    return max(0, min(100, int(score)))


def _add_preference(identity: Dict[str, Any], key: str, value: str, confidence: float) -> Optional[Dict[str, Any]]:
    prefs: List[Dict[str, Any]] = identity.setdefault("preferences", [])
    for p in prefs:
        if p.get("key") == key:
            if p.get("value") != value:
                p["value"] = value
                p["confidence"] = max(float(p.get("confidence") or 0.0), confidence)
                identity["updated_at"] = _now_iso()
                return {"key": key, "value": value, "confidence": p["confidence"]}
            return None
    item = {"key": key, "value": value, "confidence": confidence}
    prefs.append(item)
    identity["updated_at"] = _now_iso()
    return item


def _adjust_preference_confidence(identity: Dict[str, Any], key: str, delta: float) -> Optional[Dict[str, Any]]:
    prefs: List[Dict[str, Any]] = identity.setdefault("preferences", [])
    for p in prefs:
        if p.get("key") == key:
            current = float(p.get("confidence") or 0.0)
            next_val = max(0.0, min(1.0, current + delta))
            p["confidence"] = next_val
            identity["updated_at"] = _now_iso()
            return {"key": p.get("key"), "value": p.get("value"), "confidence": next_val}
    return None


def _apply_feedback_comment_to_identity(identity: Dict[str, Any], comment: Optional[str]) -> List[Dict[str, Any]]:
    if not comment:
        return []
    changes: List[Dict[str, Any]] = []
    style = identity.setdefault("style", {})
    lower = comment.lower()

    if "箇条書き" in comment:
        if style.get("format") != "bullet_points":
            style["format"] = "bullet_points"
            changes.append({"type": "style", "key": "format", "value": "bullet_points"})
        added = _add_preference(identity, "フォーマット", "箇条書き", 0.95)
        if added:
            changes.append({"type": "preference", **added})
    if "文章" in comment and "箇条書き" not in comment:
        if style.get("format") != "paragraph":
            style["format"] = "paragraph"
            changes.append({"type": "style", "key": "format", "value": "paragraph"})
        added = _add_preference(identity, "フォーマット", "文章", 0.85)
        if added:
            changes.append({"type": "preference", **added})
    if "丁寧" in comment or "フォーマル" in comment:
        if style.get("communication") != "formal":
            style["communication"] = "formal"
            changes.append({"type": "style", "key": "communication", "value": "formal"})
        added = _add_preference(identity, "文体", "フォーマル", 0.85)
        if added:
            changes.append({"type": "preference", **added})
    if "カジュアル" in comment or "くだけ" in comment:
        if style.get("communication") != "casual":
            style["communication"] = "casual"
            changes.append({"type": "style", "key": "communication", "value": "casual"})
        added = _add_preference(identity, "文体", "カジュアル", 0.9)
        if added:
            changes.append({"type": "preference", **added})
    if "数字" in comment or "データ" in comment or "定量" in comment or "kpi" in lower:
        if style.get("detail_level") != "data_driven":
            style["detail_level"] = "data_driven"
            changes.append({"type": "style", "key": "detail_level", "value": "data_driven"})
        added = _add_preference(identity, "重視", "数字・データ", 0.8)
        if added:
            changes.append({"type": "preference", **added})

    return changes


def _apply_memuu_items_to_identity(
    identity: Dict[str, Any],
    memuu_items: Optional[List[Dict[str, Any]]],
) -> List[Dict[str, Any]]:
    if not memuu_items:
        return []
    changes: List[Dict[str, Any]] = []
    for it in memuu_items:
        text = it.get("memory") or it.get("content") or ""
        if not text:
            continue
        changes.extend(_apply_feedback_comment_to_identity(identity, str(text)))
    return changes


def extract_memory_from_message(message: str) -> Dict[str, Any]:
    identity_style: Dict[str, str] = {}
    new_preferences: List[Dict[str, Any]] = []
    new_projects: List[Dict[str, Any]] = []
    lower = message.lower()

    if "カジュアル" in message or "くだけ" in message:
        identity_style["communication"] = "casual"
        new_preferences.append({"key": "文体", "value": "カジュアル", "confidence": 0.9})
    if "フォーマル" in message or "丁寧" in message:
        identity_style["communication"] = "formal"
        new_preferences.append({"key": "文体", "value": "フォーマル", "confidence": 0.85})
    if "箇条書き" in message:
        identity_style["format"] = "bullet_points"
        new_preferences.append({"key": "フォーマット", "value": "箇条書き", "confidence": 0.95})
    if "文章" in message and "箇条書き" not in message:
        identity_style["format"] = "paragraph"
        new_preferences.append({"key": "フォーマット", "value": "文章", "confidence": 0.8})
    if "数字" in message or "データ" in message or "定量" in message or "kpi" in lower:
        identity_style["detail_level"] = "data_driven"
        new_preferences.append({"key": "重視", "value": "数字・データ", "confidence": 0.8})

    if "市場調査" in message:
        new_projects.append(
            {
                "id": f"proj_{uuid.uuid4().hex[:8]}",
                "name": "市場調査",
                "status": "in_progress",
                "context": "",
                "stakeholders": [],
                "deadline": None,
                "decisions": [],
            }
        )
    elif "調査" in message:
        new_projects.append(
            {
                "id": f"proj_{uuid.uuid4().hex[:8]}",
                "name": "調査",
                "status": "in_progress",
                "context": "",
                "stakeholders": [],
                "deadline": None,
                "decisions": [],
            }
        )

    return {
        "identity_style": identity_style,
        "new_preferences": new_preferences,
        "new_projects": new_projects,
    }


def build_prompt_memories(state: Dict[str, Any]) -> Tuple[str, str, str, List[str]]:
    identity = state.get("identity") or {}
    projects = state.get("projects") or []
    episodes = state.get("episodes") or []

    identity_memory = json.dumps(identity, ensure_ascii=False)
    project_memory = json.dumps(projects, ensure_ascii=False)
    episode_memory = json.dumps(episodes[-5:], ensure_ascii=False)

    used: List[str] = []
    style = identity.get("style") or {}
    if style.get("format") == "bullet_points":
        used.append("preferences.format")
    if style.get("detail_level") == "data_driven":
        used.append("preferences.detail_level")
    if style.get("communication") == "casual":
        used.append("preferences.communication")

    return identity_memory, project_memory, episode_memory, used


_STOPWORDS = {
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "is",
    "are",
    "be",
    "this",
    "that",
    "it",
    "we",
    "you",
    "i",
    "me",
    "our",
    "your",
    "as",
    "at",
    "by",
    "from",
    "about",
    "って",
    "それ",
    "これ",
    "あれ",
    "ここ",
    "そこ",
    "ため",
    "ので",
    "こと",
    "よう",
    "もの",
    "など",
    "です",
    "ます",
    "する",
    "した",
    "して",
    "いる",
    "ある",
    "なる",
    "やる",
    "できる",
    "できない",
    "したい",
    "ほしい",
    "欲しい",
    "了解",
    "まず",
    "次に",
}


def _tokens_from_text(text: str, include_bigrams: bool = True) -> List[str]:
    s = (text or "").lower()
    out: List[str] = []

    latin = re.findall(r"[a-z0-9]{2,}", s)
    out.extend(latin)

    jp_seqs = re.findall(r"[一-龥ぁ-んァ-ン]{2,}", s)
    for seq in jp_seqs:
        out.append(seq)
        if include_bigrams:
            for i in range(0, max(0, len(seq) - 1)):
                out.append(seq[i : i + 2])

    spaced = re.split(r"[\s\u3000/_,.()【】「」『』:;!?。、・]+", s)
    for w in spaced:
        if len(w) >= 2:
            out.append(w)

    cleaned: List[str] = []
    for t in out:
        tt = t.strip()
        if not tt or tt in _STOPWORDS:
            continue
        if tt.isdigit():
            continue
        cleaned.append(tt)
    return cleaned


def _topics_from_tokens(tokens: List[str], limit: int = 6) -> List[str]:
    if not tokens:
        return []
    freq: Dict[str, int] = {}
    for t in tokens:
        if len(t) > 18:
            continue
        freq[t] = freq.get(t, 0) + 1
    ranked = sorted(freq.items(), key=lambda kv: (-kv[1], -len(kv[0]), kv[0]))
    topics: List[str] = []
    for t, _ in ranked:
        if t in topics:
            continue
        if len(topics) >= limit:
            break
        topics.append(t)
    return topics


_TOPIC_KEYWORDS = [
    "prd",
    "kpi",
    "kgi",
    "north star",
    "北極星指標",
    "成功指標",
    "スプリント",
    "バックログ",
    "ロードマップ",
    "優先度",
    "見積もり",
    "db",
    "スキーマ",
    "schema",
    "migration",
    "技術負債",
    "設計",
    "実装",
    "api",
    "テスト",
    "障害",
    "slo",
    "監視",
]


def _keyword_topics(text: str, limit: int = 6) -> List[str]:
    s = (text or "").lower()
    found: List[str] = []
    for kw in _TOPIC_KEYWORDS:
        k = kw.lower()
        if k in s:
            found.append(kw.upper() if kw in {"prd", "kpi", "kgi", "db", "api", "slo"} else kw)
    uniq: List[str] = []
    for x in found:
        if x not in uniq:
            uniq.append(x)
        if len(uniq) >= limit:
            break
    return uniq


def _tags_from_text(text: str, topics: List[str]) -> List[str]:
    s = (text or "").lower()
    tset = set(topics)

    def has_any(words: List[str]) -> bool:
        for w in words:
            if w.lower() in s or w in tset:
                return True
        return False

    tags: List[str] = []
    if has_any(["prd", "requirements", "spec", "仕様", "要件", "pr", "kpi", "kgi", "ns", "北極星", "north star"]):
        tags.append("product")
    if has_any(["sprint", "backlog", "スプリント", "バックログ", "優先度", "見積もり", "ロードマップ"]):
        tags.append("pm")
    if has_any(["api", "db", "sql", "schema", "migration", "設計", "実装", "リファクタ", "テスト"]):
        tags.append("engineering")
    if has_any(["incident", "障害", "latency", "遅延", "監視", "slo", "sla", "oncall"]):
        tags.append("reliability")
    if has_any(["launch", "release", "リリース", "ローンチ", "go-to-market", "gtm"]):
        tags.append("launch")
    return tags[:6]


def _hash_embedding_int8(tokens: List[str], dim: int = 96) -> List[int]:
    if dim <= 0:
        dim = 96
    if not tokens:
        return [0 for _ in range(dim)]

    freq: Dict[str, int] = {}
    for t in tokens:
        freq[t] = freq.get(t, 0) + 1

    vec = [0.0 for _ in range(dim)]
    for tok, c in freq.items():
        h = hashlib.blake2b(tok.encode("utf-8"), digest_size=8).digest()
        hv = int.from_bytes(h, "little", signed=False)
        idx = hv % dim
        sign = 1.0 if (hv >> 8) & 1 else -1.0
        weight = 1.0 + math.log(1.0 + float(c))
        vec[idx] += sign * weight

    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    scaled: List[int] = []
    for v in vec:
        q = int(round((v / norm) * 127.0))
        if q > 127:
            q = 127
        if q < -127:
            q = -127
        scaled.append(q)
    return scaled


class PocketCOOService:
    def __init__(self, db: Session):
        self.db = db

    def get_state(self, user_id: str) -> Dict[str, Any]:
        row = self.db.get(UserState, user_id)
        if not row:
            state = default_user_memory(user_id)
            state = ensure_demo_seeded(state, user_id=user_id)
            state["score"] = calculate_score(state)
            self._save_state(user_id, state)
            return state
        state = json.loads(row.state_json)
        next_state = ensure_demo_seeded(state, user_id=user_id)
        needs_save = next_state is not state
        state = next_state
        next_score = calculate_score(state)
        if int(state.get("score") or 0) != int(next_score):
            state["score"] = next_score
            needs_save = True
        if needs_save:
            self._save_state(user_id, state)
        return state

    def _save_state(self, user_id: str, state: Dict[str, Any]) -> None:
        row = self.db.get(UserState, user_id)
        payload = json.dumps(state, ensure_ascii=False)
        if row:
            row.state_json = payload
            row.updated_at = datetime.utcnow()
        else:
            row = UserState(user_id=user_id, state_json=payload, updated_at=datetime.utcnow())
            self.db.add(row)
        self.db.commit()

    def upsert_state(self, user_id: str, state: Dict[str, Any]) -> Dict[str, Any]:
        state["userId"] = user_id
        state["score"] = calculate_score(state)
        self._save_state(user_id, state)
        return state

    def apply_message(self, user_id: str, message: str) -> Dict[str, Any]:
        return self.apply_turn(
            user_id=user_id,
            user_message=message,
            assistant_message=None,
            memory_used=None,
            memuu_items=None,
        )

    def apply_turn(
        self,
        user_id: str,
        user_message: str,
        assistant_message: Optional[str],
        memory_used: Optional[List[str]],
        memuu_items: Optional[List[Dict[str, Any]]],
    ) -> Dict[str, Any]:
        state = self.get_state(user_id)
        before_score = int(state.get("score") or 0)

        identity = state.setdefault("identity", {})
        identity_style = identity.setdefault("style", {})
        new_memory: Dict[str, Any] = {"identity": {}, "projects": [], "episodes": []}

        memuu_changes = _apply_memuu_items_to_identity(identity, memuu_items)
        for ch in memuu_changes:
            if ch.get("type") == "style":
                new_memory["identity"].setdefault("style", {})[ch.get("key")] = ch.get("value")
            if ch.get("type") == "preference":
                pref = {"key": ch.get("key"), "value": ch.get("value"), "confidence": ch.get("confidence")}
                new_memory["identity"].setdefault("preferences", []).append(pref)

        extracted = extract_memory_from_message(user_message)
        for k, v in extracted.get("identity_style", {}).items():
            if identity_style.get(k) != v:
                identity_style[k] = v
                new_memory["identity"].setdefault("style", {})[k] = v

        for p in extracted.get("new_preferences", []):
            added = _add_preference(identity, p["key"], p["value"], float(p["confidence"]))
            if added:
                new_memory["identity"].setdefault("preferences", []).append(added)

        projects: List[Dict[str, Any]] = state.setdefault("projects", [])
        for proj in extracted.get("new_projects", []):
            exists = any((p.get("name") == proj.get("name") and p.get("status") == "in_progress") for p in projects)
            if not exists:
                projects.append(proj)
                new_memory["projects"].append(proj)

        episodes: List[Dict[str, Any]] = state.setdefault("episodes", [])
        episode_id = f"ep_{uuid.uuid4().hex[:10]}"
        summary_seed = user_message if assistant_message is None else f"{user_message}\n{assistant_message}"
        full_text = "\n".join([user_message or "", assistant_message or "", summary_seed or ""]).strip()
        tokens_for_embed = _tokens_from_text(full_text, include_bigrams=True)
        tokens_for_topics = _tokens_from_text(full_text, include_bigrams=False)
        topics = _keyword_topics(full_text, limit=6)
        if len(topics) < 6:
            rest = _topics_from_tokens(tokens_for_topics, limit=12)
            for t in rest:
                if t not in topics:
                    topics.append(t)
                if len(topics) >= 6:
                    break
        tags = _tags_from_text(full_text, topics)
        embedding_dim = 96
        embedding = _hash_embedding_int8(tokens_for_embed, dim=embedding_dim)
        episode = {
            "id": episode_id,
            "date": _now_iso(),
            "type": "chat_turn",
            "user_message": user_message,
            "assistant_message": assistant_message,
            "memory_used": memory_used or [],
            "summary": (summary_seed[:160] + "…") if len(summary_seed) > 160 else summary_seed,
            "learnings": [],
            "feedback": None,
            "tags": tags,
            "topics": topics,
            "embedding": embedding,
            "embedding_dim": embedding_dim,
            "embedding_model": "hashing_v1_int8",
            "embedding_at": _now_iso(),
        }
        episodes.append(episode)
        new_memory["episodes"].append(episode)

        state["score"] = calculate_score(state)
        score_delta = int(state["score"]) - before_score

        self._save_state(user_id, state)

        return {
            "state": state,
            "before_score": before_score,
            "score_delta": score_delta,
            "new_memory": new_memory,
        }

    def record_feedback(
        self,
        user_id: str,
        episode_id: str,
        rating: str,
        comment: Optional[str] = None,
    ) -> Dict[str, Any]:
        state = self.get_state(user_id)
        episodes: List[Dict[str, Any]] = state.setdefault("episodes", [])
        target = next((e for e in episodes if e.get("id") == episode_id), None)
        if not target:
            raise ValueError("episode not found")

        identity = state.setdefault("identity", {})
        memory_used = target.get("memory_used") or []
        deltas: List[Dict[str, Any]] = []
        if rating == "like":
            if "preferences.format" in memory_used:
                updated = _adjust_preference_confidence(identity, "フォーマット", 0.05)
                if updated:
                    deltas.append({"type": "preference_confidence", **updated})
            if "preferences.detail_level" in memory_used:
                updated = _adjust_preference_confidence(identity, "重視", 0.05)
                if updated:
                    deltas.append({"type": "preference_confidence", **updated})
            if "preferences.communication" in memory_used:
                updated = _adjust_preference_confidence(identity, "文体", 0.05)
                if updated:
                    deltas.append({"type": "preference_confidence", **updated})
        elif rating == "dislike":
            if "preferences.format" in memory_used:
                updated = _adjust_preference_confidence(identity, "フォーマット", -0.1)
                if updated:
                    deltas.append({"type": "preference_confidence", **updated})
            if "preferences.detail_level" in memory_used:
                updated = _adjust_preference_confidence(identity, "重視", -0.1)
                if updated:
                    deltas.append({"type": "preference_confidence", **updated})
            if "preferences.communication" in memory_used:
                updated = _adjust_preference_confidence(identity, "文体", -0.1)
                if updated:
                    deltas.append({"type": "preference_confidence", **updated})

        deltas.extend(_apply_feedback_comment_to_identity(identity, comment))

        target["feedback"] = {
            "rating": rating,
            "comment": comment,
            "updated_at": _now_iso(),
            "identity_updates": deltas,
        }
        state["score"] = calculate_score(state)
        self._save_state(user_id, state)
        return target
