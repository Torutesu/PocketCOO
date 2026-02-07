from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.dependencies import get_db, require_api_key
from models.feedback import FeedbackRequest, FeedbackResponse
from services.pocket_coo_service import PocketCOOService


router = APIRouter(dependencies=[Depends(require_api_key)])


@router.post("", response_model=FeedbackResponse)
async def post_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    try:
        if request.rating not in ("like", "dislike"):
            raise HTTPException(status_code=400, detail="rating must be like or dislike")
        service = PocketCOOService(db)
        episode = service.record_feedback(
            user_id=request.user_id,
            episode_id=request.episode_id,
            rating=request.rating,
            comment=request.comment,
        )
        return FeedbackResponse(episode=episode)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
