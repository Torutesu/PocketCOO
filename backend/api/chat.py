from fastapi import APIRouter, Depends, HTTPException
from models.chat import ChatRequest, ChatResponse
from services.memu_service import MemUService
from core.dependencies import get_memu_service
import openai
import os

router = APIRouter()

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

        # LLMに送信
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": f"""あなたはPersonalOSのAIアシスタントです。
ユーザーの記憶を活用して、個別化された応答を提供してください。

{context}

ユーザーの過去の記憶を考慮して、文脈に沿った応答をしてください。
"""
                },
                {"role": "user", "content": request.message}
            ],
            temperature=0.7
        )

        response_text = completion.choices[0].message.content

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

        return ChatResponse(
            response=response_text,
            memories_used=memories_used,
            memory_count=len(memories_used)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
