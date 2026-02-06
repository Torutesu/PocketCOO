from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {
        "status": "healthy",
        "service": "personalos-api",
        "version": "0.1.0"
    }
