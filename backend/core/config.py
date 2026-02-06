from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """アプリケーション設定"""

    # API設定
    API_TITLE: str = "PersonalOS API"
    API_VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"

    # OpenAI設定
    OPENAI_API_KEY: str

    # Qdrant設定
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333

    # CORS設定
    CORS_ORIGINS: list = ["http://localhost:3000"]

    # Database設定
    DATABASE_URL: Optional[str] = "sqlite:///./personalos.db"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
