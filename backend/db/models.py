from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from .base import Base


class UserState(Base):
    __tablename__ = "user_states"

    user_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    state_json: Mapped[str] = mapped_column(Text(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(), nullable=False, default=datetime.utcnow)
