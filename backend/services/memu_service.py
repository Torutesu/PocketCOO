from mem0 import Memory
from typing import List, Dict, Optional
import os

class MemUService:
    """memU統合サービス
    
    memUを使用してユーザーの記憶を管理します。
    - 記憶の追加、検索、更新、削除
    - ベクトル検索による意味的類似性検索
    - 階層的なファイルシステム管理
    """

    def __init__(self):
        """memUを初期化"""
        self.config = {
            "vector_store": {
                "provider": "qdrant",
                "config": {
                    "host": os.getenv("QDRANT_HOST", "localhost"),
                    "port": int(os.getenv("QDRANT_PORT", 6333)),
                    "collection_name": "personalos_memories"
                }
            },
            "llm": {
                "provider": "openai",
                "config": {
                    "model": "gpt-4o-mini",
                    "temperature": 0.7,
                    "api_key": os.getenv("OPENAI_API_KEY")
                }
            },
            "embedder": {
                "provider": "openai",
                "config": {
                    "model": "text-embedding-3-small",
                    "api_key": os.getenv("OPENAI_API_KEY")
                }
            },
            "version": "v1.1"
        }

        self.memory = Memory.from_config(self.config)

    def add_memory(
        self,
        content: str,
        user_id: str,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """記憶を追加
        
        Args:
            content: 記憶の内容
            user_id: ユーザーID
            metadata: メタデータ（カテゴリ、レイヤー等）
            
        Returns:
            追加された記憶の情報
        """
        try:
            result = self.memory.add(
                content,
                user_id=user_id,
                metadata=metadata or {}
            )
            return result
        except Exception as e:
            raise Exception(f"Failed to add memory: {str(e)}")

    def search_memories(
        self,
        query: str,
        user_id: str,
        limit: int = 10,
        filters: Optional[Dict] = None
    ) -> List[Dict]:
        """記憶を検索
        
        Args:
            query: 検索クエリ
            user_id: ユーザーID
            limit: 最大返却数
            filters: フィルタ条件
            
        Returns:
            検索結果のリスト
        """
        try:
            results = self.memory.search(
                query=query,
                user_id=user_id,
                limit=limit,
                filters=filters
            )
            return results
        except Exception as e:
            raise Exception(f"Failed to search memories: {str(e)}")

    def get_all_memories(self, user_id: str) -> List[Dict]:
        """全記憶を取得
        
        Args:
            user_id: ユーザーID
            
        Returns:
            全記憶のリスト
        """
        try:
            memories = self.memory.get_all(user_id=user_id)
            return memories
        except Exception as e:
            raise Exception(f"Failed to get memories: {str(e)}")

    def update_memory(
        self,
        memory_id: str,
        content: str,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """記憶を更新
        
        Args:
            memory_id: 記憶ID
            content: 新しい内容
            metadata: 新しいメタデータ
            
        Returns:
            更新された記憶の情報
        """
        try:
            result = self.memory.update(
                memory_id=memory_id,
                data=content,
                metadata=metadata
            )
            return result
        except Exception as e:
            raise Exception(f"Failed to update memory: {str(e)}")

    def delete_memory(self, memory_id: str) -> bool:
        """記憶を削除
        
        Args:
            memory_id: 記憶ID
            
        Returns:
            削除成功したかどうか
        """
        try:
            self.memory.delete(memory_id=memory_id)
            return True
        except Exception as e:
            raise Exception(f"Failed to delete memory: {str(e)}")

# シングルトンインスタンス
memu_service = MemUService()
