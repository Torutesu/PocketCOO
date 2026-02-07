from pydantic import BaseModel, Field
from pydantic.config import ConfigDict
from typing import Any, Dict, List, Optional


class UserIdentityPreference(BaseModel):
    key: str
    value: str
    confidence: float = 0.5


class UserIdentity(BaseModel):
    style: Dict[str, Any] = Field(default_factory=dict)
    preferences: List[UserIdentityPreference] = Field(default_factory=list)
    updated_at: Optional[str] = None


class UserProject(BaseModel):
    id: str
    name: str
    status: str = "in_progress"
    context: str = ""
    stakeholders: List[str] = Field(default_factory=list)
    deadline: Optional[str] = None
    decisions: List[Dict[str, Any]] = Field(default_factory=list)


class UserEpisode(BaseModel):
    id: str
    date: str
    type: str = "chat_turn"
    user_message: Optional[str] = None
    assistant_message: Optional[str] = None
    memory_used: List[str] = Field(default_factory=list)
    summary: Optional[str] = None
    learnings: List[Dict[str, Any]] = Field(default_factory=list)
    feedback: Optional[Dict[str, Any]] = None
    tags: List[str] = Field(default_factory=list)
    topics: List[str] = Field(default_factory=list)
    embedding: Optional[List[int]] = None
    embedding_dim: Optional[int] = None
    embedding_model: Optional[str] = None
    embedding_at: Optional[str] = None


class UserState(BaseModel):
    model_config = ConfigDict(populate_by_name=True, ser_json_by_alias=True)

    user_id: str = Field(alias="userId", validation_alias="userId", serialization_alias="userId")
    identity: UserIdentity = Field(default_factory=UserIdentity)
    projects: List[UserProject] = Field(default_factory=list)
    episodes: List[UserEpisode] = Field(default_factory=list)
    score: int = 0
