from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.dependencies import get_db, require_api_key
from models.user_state import UserState
from services.pocket_coo_service import PocketCOOService


router = APIRouter(dependencies=[Depends(require_api_key)])


@router.get("/{user_id}", response_model=UserState, response_model_by_alias=True)
async def get_user_state(user_id: str, db: Session = Depends(get_db)):
    try:
        service = PocketCOOService(db)
        state = service.get_state(user_id)
        return UserState.model_validate(state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{user_id}", response_model=UserState, response_model_by_alias=True)
async def put_user_state(user_id: str, body: UserState, db: Session = Depends(get_db)):
    try:
        service = PocketCOOService(db)
        payload = body.model_dump(by_alias=True)
        state = service.upsert_state(user_id=user_id, state=payload)
        return UserState.model_validate(state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
