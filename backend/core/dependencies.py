from services.memu_service import memu_service
from db.session import SessionLocal
from services.pocket_coo_service import PocketCOOService
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session
import os

def get_memu_service():
    """memUサービスの依存性注入"""
    return memu_service


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_pocket_coo_service(db: Session = Depends(get_db)):
    return PocketCOOService(db)


def require_api_key(x_api_key: str = Header(default="", alias="x-api-key")):
    expected = os.getenv("API_KEY")
    if not expected:
        return
    if x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid API key")
