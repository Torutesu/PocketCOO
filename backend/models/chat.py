from pydantic import BaseModel
from typing import List, Optional, Dict

class ChatMessage(BaseModel):
    """チャットメッセージモデル"""
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    """チャットリクエストモデル"""
    message: str
    user_id: str
    use_memory: bool = True

class ChatResponse(BaseModel):
    """チャットレスポンスモデル"""
    response: str
    memories_used: List[Dict]
    memory_count: int
