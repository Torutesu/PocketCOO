from fastapi import APIRouter, Depends, HTTPException
from models.memory import MemoryCreate
from services.memu_service import MemUService
from core.dependencies import get_memu_service, get_db, require_api_key
from typing import Dict
from sqlalchemy.orm import Session
from services.pocket_coo_service import PocketCOOService

router = APIRouter(dependencies=[Depends(require_api_key)])


@router.get("")
async def get_pocket_memory(userId: str, db: Session = Depends(get_db)):
    try:
        service = PocketCOOService(db)
        return service.get_state(userId)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_memory(
    memory: MemoryCreate,
    memu: MemUService = Depends(get_memu_service)
):
    """記憶を作成
    
    Args:
        memory: 記憶作成リクエスト
        memu: memUサービス
        
    Returns:
        作成された記憶の情報
    """
    try:
        result = memu.add_memory(
            content=memory.content,
            user_id=memory.user_id,
            metadata=memory.metadata
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all/{user_id}")
async def get_all_memories(
    user_id: str,
    memu: MemUService = Depends(get_memu_service)
):
    """全記憶を取得
    
    Args:
        user_id: ユーザーID
        memu: memUサービス
        
    Returns:
        全記憶のリスト
    """
    try:
        memories = memu.get_all_memories(user_id=user_id)
        return {
            "memories": memories,
            "count": len(memories)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_memories(
    query: str,
    user_id: str,
    limit: int = 10,
    memu: MemUService = Depends(get_memu_service)
):
    """記憶を検索
    
    Args:
        query: 検索クエリ
        user_id: ユーザーID
        limit: 最大返却数
        memu: memUサービス
        
    Returns:
        検索結果のリスト
    """
    try:
        results = memu.search_memories(
            query=query,
            user_id=user_id,
            limit=limit
        )
        return {
            "memories": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{memory_id}")
async def delete_memory(
    memory_id: str,
    memu: MemUService = Depends(get_memu_service)
):
    """記憶を削除
    
    Args:
        memory_id: 記憶ID
        memu: memUサービス
        
    Returns:
        削除成功したかどうか
    """
    try:
        success = memu.delete_memory(memory_id=memory_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
