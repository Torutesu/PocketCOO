from fastapi import APIRouter, Depends, HTTPException

from core.dependencies import require_api_key, get_memu_service
from services.memu_service import MemUService


router = APIRouter(dependencies=[Depends(require_api_key)])


@router.get("/categories")
async def get_memuu_categories(userId: str, memu: MemUService = Depends(get_memu_service)):
    try:
        categories = memu.list_categories(userId)
        if categories is None:
            raise HTTPException(status_code=503, detail="MemuU is not configured")
        return {"categories": categories}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
