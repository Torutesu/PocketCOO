from pydantic import BaseModel, Field
from pydantic.config import ConfigDict
from typing import List, Optional, Dict, Any

class ChatMessage(BaseModel):
    """チャットメッセージモデル"""
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    """チャットリクエストモデル"""
    model_config = ConfigDict(populate_by_name=True)
    message: str
    user_id: str = Field(validation_alias="userId")
    use_memory: bool = True

class ChatResponse(BaseModel):
    """チャットレスポンスモデル"""
    response: str
    memories_used: List[Dict]
    memory_count: int


class PocketChatRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    message: str
    user_id: str = Field(validation_alias="userId")


class PocketChatResponse(BaseModel):
    response: str
    memoryUsed: List[str]
    newMemory: Dict[str, Any]
    score: int
    scoreDelta: int
