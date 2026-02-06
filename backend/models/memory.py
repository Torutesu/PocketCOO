from pydantic import BaseModel
from typing import Optional, Dict

class MemoryCreate(BaseModel):
    """記憶作成モデル"""
    content: str
    user_id: str
    metadata: Optional[Dict] = None

class MemoryResponse(BaseModel):
    """記憶レスポンスモデル"""
    id: str
    content: str
    user_id: str
    created_at: str
    metadata: Dict
