from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import health, chat, memory, feedback, user, memuu
from db.base import Base
from db.session import engine
import db.models
import os
from pathlib import Path
from dotenv import dotenv_values


def _load_project_env() -> None:
    backend_dir = Path(__file__).resolve().parent
    project_root = backend_dir.parent

    base_env_path = project_root / ".env"
    local_env_path = project_root / ".env.local"

    loaded_from_base = set()

    if base_env_path.exists():
        base_values = dotenv_values(base_env_path)
        for k, v in base_values.items():
            if not k or v is None:
                continue
            if k not in os.environ:
                os.environ[k] = str(v)
                loaded_from_base.add(k)

    if local_env_path.exists():
        local_values = dotenv_values(local_env_path)
        for k, v in local_values.items():
            if not k or v is None:
                continue
            if k not in os.environ or k in loaded_from_base:
                os.environ[k] = str(v)


_load_project_env()

app = FastAPI(
    title="PersonalOS API",
    description="AI Memory Companion Backend",
    version="0.1.0"
)

Base.metadata.create_all(bind=engine)

# CORS設定
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")
allow_origins = [o.strip() for o in cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(memory.router, prefix="/api/memory", tags=["memory"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])
app.include_router(user.router, prefix="/api/user", tags=["user"])
app.include_router(memuu.router, prefix="/api/memuu", tags=["memuu"])

@app.get("/")
async def root():
    return {
        "message": "PersonalOS API",
        "version": "0.1.0",
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
