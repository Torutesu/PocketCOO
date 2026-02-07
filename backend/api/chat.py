from fastapi import APIRouter, Depends, HTTPException
from models.chat import ChatRequest, ChatResponse, PocketChatRequest, PocketChatResponse
from services.memu_service import MemUService
from core.dependencies import get_memu_service, get_db, require_api_key
from services.pocket_coo_service import PocketCOOService, build_prompt_memories
from sqlalchemy.orm import Session
import openai
import os
from typing import Any, Dict, List, Optional
import httpx


def _env_api_key(name: str) -> Optional[str]:
    value = os.getenv(name)
    if not value:
        return None
    stripped = value.strip()
    lowered = stripped.lower()
    if (
        lowered.startswith("your_")
        or "your_" in lowered
        or "placeholder" in lowered
        or "replace" in lowered
        or "example" in lowered
    ):
        return None
    return stripped


def _openai_chat_completion_with_fallback(
    *,
    messages: List[Dict[str, Any]],
    temperature: float,
) -> str:
    primary_api_key = _env_api_key("OPENAI_API_KEY")
    primary_base_url = os.getenv("OPENAI_BASE_URL")
    primary_model = os.getenv("OPENAI_MODEL") or "gpt-4o-mini"

    backup_api_key = _env_api_key("OPENAI_API_KEY_BACKUP")
    backup_base_url = os.getenv("OPENAI_BASE_URL_BACKUP")
    backup_model = os.getenv("OPENAI_MODEL_BACKUP") or primary_model

    last_error: Optional[Exception] = None
    for api_key, base_url, model in [
        (primary_api_key, primary_base_url, primary_model),
        (backup_api_key, backup_base_url, backup_model),
    ]:
        if not api_key:
            continue
        try:
            client_kwargs: Dict[str, Any] = {"api_key": api_key}
            if base_url:
                client_kwargs["base_url"] = base_url
            client = openai.OpenAI(**client_kwargs)
            completion = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
            )
            return completion.choices[0].message.content
        except Exception as e:
            last_error = e
            continue

    if last_error:
        raise last_error
    raise RuntimeError("OPENAI_API_KEY is not set")


def _anthropic_message_with_fallback(
    *,
    system: str,
    user_message: str,
    temperature: float,
) -> str:
    primary_api_key = _env_api_key("ANTHROPIC_API_KEY")
    primary_base_url = os.getenv("ANTHROPIC_BASE_URL") or "https://api.anthropic.com"
    primary_model = os.getenv("ANTHROPIC_MODEL") or "claude-3-5-sonnet-latest"

    backup_api_key = _env_api_key("ANTHROPIC_API_KEY_BACKUP")
    backup_base_url = os.getenv("ANTHROPIC_BASE_URL_BACKUP") or primary_base_url
    backup_model = os.getenv("ANTHROPIC_MODEL_BACKUP") or primary_model

    anthropic_version = os.getenv("ANTHROPIC_VERSION") or "2023-06-01"
    max_tokens = int(os.getenv("ANTHROPIC_MAX_TOKENS") or "1024")

    last_error: Optional[Exception] = None
    for api_key, base_url, model in [
        (primary_api_key, primary_base_url, primary_model),
        (backup_api_key, backup_base_url, backup_model),
    ]:
        if not api_key:
            continue
        try:
            url = f"{base_url.rstrip('/')}/v1/messages"
            headers = {
                "x-api-key": api_key,
                "anthropic-version": anthropic_version,
                "content-type": "application/json",
            }
            payload = {
                "model": model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "system": system,
                "messages": [{"role": "user", "content": user_message}],
            }
            with httpx.Client(timeout=30.0) as client:
                res = client.post(url, headers=headers, json=payload)
                res.raise_for_status()
                data = res.json()
            parts = data.get("content") or []
            texts: List[str] = []
            for part in parts:
                if isinstance(part, dict) and part.get("type") == "text":
                    texts.append(part.get("text") or "")
            return "".join(texts).strip() or ""
        except Exception as e:
            last_error = e
            continue

    if last_error:
        raise last_error
    raise RuntimeError("ANTHROPIC_API_KEY is not set")


def _chat_response_text(
    *,
    system_prompt: str,
    user_message: str,
    temperature: float,
) -> str:
    provider = (os.getenv("CHAT_LLM_PROVIDER") or "").strip().lower()
    if not provider:
        if _env_api_key("ANTHROPIC_API_KEY") or _env_api_key("ANTHROPIC_API_KEY_BACKUP"):
            provider = "anthropic"
        elif _env_api_key("OPENAI_API_KEY") or _env_api_key("OPENAI_API_KEY_BACKUP"):
            provider = "openai"
        else:
            provider = "none"

    if provider == "anthropic":
        try:
            return _anthropic_message_with_fallback(
                system=system_prompt,
                user_message=user_message,
                temperature=temperature,
            )
        except Exception:
            if _env_api_key("OPENAI_API_KEY") or _env_api_key("OPENAI_API_KEY_BACKUP"):
                return _openai_chat_completion_with_fallback(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    temperature=temperature,
                )
            raise

    if provider == "openai":
        return _openai_chat_completion_with_fallback(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=temperature,
        )

    raise RuntimeError("No LLM provider configured")

router = APIRouter(dependencies=[Depends(require_api_key)])


@router.post("", response_model=PocketChatResponse)
async def pocket_chat(
    request: PocketChatRequest,
    db: Session = Depends(get_db),
    memu: MemUService = Depends(get_memu_service),
):
    try:
        service = PocketCOOService(db)
        pre_state = service.get_state(request.user_id)
        identity_memory, project_memory, episode_memory, used = build_prompt_memories(pre_state)

        has_any_llm_key = bool(
            _env_api_key("ANTHROPIC_API_KEY")
            or _env_api_key("ANTHROPIC_API_KEY_BACKUP")
            or _env_api_key("OPENAI_API_KEY")
            or _env_api_key("OPENAI_API_KEY_BACKUP")
        )

        system_prompt = f"""あなたは「Pocket COO」、ユーザー専属の分身AIアシスタントです。

## あなたの役割
- ユーザーの仕事を代行・サポートする
- ユーザーのスタイルを学習し、好みに合わせた応答をする
- 「いつもの感じで」と言われたら、記憶から適切に判断する

## ユーザーの記憶
以下はこれまでの会話から学習したユーザーの情報です：

### アイデンティティ（スタイル・好み）
{identity_memory}

### 進行中のプロジェクト
{project_memory}

### 最近のやり取り
{episode_memory}

## 行動指針
1. 記憶にある情報は積極的に活用する
2. 「覚えていること」を自然に会話に織り込む
3. 新しい好みや情報を発見したら記憶に追加する
4. 分からないことは推測せず確認する

## 応答スタイル
- ユーザーの好みに合わせる（記憶を参照）
- 記憶がない場合は、自然に質問して学習する
"""

        style = (pre_state.get("identity") or {}).get("style") or {}
        if has_any_llm_key:
            response_text = _chat_response_text(
                system_prompt=system_prompt,
                user_message=request.message,
                temperature=0.7,
            )
        else:
            if style.get("format") == "bullet_points":
                response_text = "\n".join(
                    [
                        "了解。いつもの感じで進めます。",
                        "- まず要件を整理します",
                        "- 次にタスクを分解します",
                        "- 最後に進め方と成果物を提示します",
                        "（ANTHROPIC_API_KEY もしくは OPENAI_API_KEY を設定すると、より自然な応答に切り替わります）",
                    ]
                )
            else:
                response_text = "了解。いつもの感じで進めます。（ANTHROPIC_API_KEY もしくは OPENAI_API_KEY を設定すると、より自然な応答に切り替わります）"

        memuu_items = []
        try:
            memuu_items = memu.retrieve_memories(query=request.message, user_id=request.user_id) or []
        except Exception:
            memuu_items = []

        applied = service.apply_turn(
            user_id=request.user_id,
            user_message=request.message,
            assistant_message=response_text,
            memory_used=used,
            memuu_items=memuu_items,
        )
        state = applied["state"]

        return PocketChatResponse(
            response=response_text,
            memoryUsed=used,
            newMemory=applied["new_memory"],
            score=int(state.get("score") or 0),
            scoreDelta=int(applied.get("score_delta") or 0),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    memu: MemUService = Depends(get_memu_service)
):
    """チャットメッセージを送信
    
    Args:
        request: チャットリクエスト
        memu: memUサービス
        
    Returns:
        AIの応答と使用された記憶
    """
    try:
        has_any_llm_key = bool(
            _env_api_key("ANTHROPIC_API_KEY")
            or _env_api_key("ANTHROPIC_API_KEY_BACKUP")
            or _env_api_key("OPENAI_API_KEY")
            or _env_api_key("OPENAI_API_KEY_BACKUP")
        )

        # 関連する記憶を検索
        memories_used = []
        if request.use_memory:
            memories_used = memu.search_memories(
                query=request.message,
                user_id=request.user_id,
                limit=5
            )

        # コンテキスト構築
        context = ""
        if memories_used:
            context = "関連する記憶:\n"
            for mem in memories_used:
                context += f"- {mem.get('memory', '')}\n"

        if has_any_llm_key:
            response_text = _chat_response_text(
                system_prompt=f"""あなたはPersonalOSのAIアシスタントです。
ユーザーの記憶を活用して、個別化された応答を提供してください。

{context}

ユーザーの過去の記憶を考慮して、文脈に沿った応答をしてください。
""",
                user_message=request.message,
                temperature=0.7,
            )
        else:
            response_text = f"（デモ応答）受け取りました: {request.message}\nANTHROPIC_API_KEY もしくは OPENAI_API_KEY を設定すると、より自然な応答を返します。"

        # 会話を記憶に保存
        conversation = f"ユーザー: {request.message}\nアシスタント: {response_text}"
        memu.add_memory(
            content=conversation,
            user_id=request.user_id,
            metadata={
                "type": "conversation",
                "layer": "active",
                "category": "chat"
            }
        )
        memu.record_chat_turn_for_memuu(
            user_id=request.user_id,
            user_message=request.message,
            assistant_message=response_text,
        )

        return ChatResponse(
            response=response_text,
            memories_used=memories_used,
            memory_count=len(memories_used)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
