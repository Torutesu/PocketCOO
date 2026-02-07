from pydantic import BaseModel, Field
from pydantic.config import ConfigDict
from typing import Optional


class FeedbackRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: str = Field(validation_alias="userId")
    episode_id: str = Field(validation_alias="episodeId")
    rating: str
    comment: Optional[str] = None


class FeedbackResponse(BaseModel):
    episode: dict
