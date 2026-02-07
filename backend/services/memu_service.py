from mem0 import Memory
from typing import List, Dict, Optional
import os
from datetime import datetime
import uuid
import httpx


def _env_api_key(name: str) -> Optional[str]:
    value = os.getenv(name)
    if not value:
        return None
    stripped = value.strip()
    lowered = stripped.lower()
    if (
        lowered.startswith("your_")
        or "your_" in lowered
        or "placeholder" in lowered
        or "replace" in lowered
        or "example" in lowered
    ):
        return None
    return stripped

class MemUService:
    """memU統合サービス
    
    memU (mem0) を使用してユーザーの記憶を管理します。
    - 記憶の追加、検索、更新、削除
    - ベクトル検索による意味的類似性検索
    - 階層的なファイルシステム管理
    """

    def __init__(self):
        """memUを初期化"""
        self._fallback_enabled = False
        self._fallback_store: Dict[str, List[Dict]] = {}
        self._conversation_buffer: Dict[str, List[Dict]] = {}

        self._memuu_api_key = None
        self._memuu_base_url = "https://api.memu.so"
        self._memuu_agent_id = "personalos"
        self._memuu_agent_name = "PersonalOS"

        openai_api_key = _env_api_key("OPENAI_API_KEY") or _env_api_key("OPENAI_API_KEY_BACKUP")

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
                    "api_key": openai_api_key,
                }
            },
            "embedder": {
                "provider": "openai",
                "config": {
                    "model": "text-embedding-3-small",
                    "api_key": openai_api_key,
                }
            },
            "version": "v1.1"
        }

        try:
            self.memory = Memory.from_config(self.config)
        except Exception:
            self._fallback_enabled = True
            self.memory = None

    def _current_memuu_api_key(self) -> Optional[str]:
        return os.getenv("MEMUU_API_KEY") or os.getenv("MEMU_API_KEY") or self._memuu_api_key

    def _current_memuu_base_url(self) -> str:
        return os.getenv("MEMUU_BASE_URL", self._memuu_base_url)

    def _current_memuu_agent_id(self) -> str:
        return os.getenv("MEMUU_AGENT_ID", self._memuu_agent_id)

    def _current_memuu_agent_name(self) -> str:
        return os.getenv("MEMUU_AGENT_NAME", self._memuu_agent_name)

    def _memuu_headers(self) -> Dict[str, str]:
        api_key = self._current_memuu_api_key()
        if not api_key:
            return {}
        return {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    def _memuu_enabled(self) -> bool:
        return bool(self._current_memuu_api_key())

    def _memuu_post(self, path: str, payload: Dict) -> Dict:
        url = f"{self._current_memuu_base_url()}{path}"
        with httpx.Client(timeout=10.0) as client:
            res = client.post(url, headers=self._memuu_headers(), json=payload)
            res.raise_for_status()
            return res.json()

    def _memuu_get(self, path: str) -> Dict:
        url = f"{self._current_memuu_base_url()}{path}"
        with httpx.Client(timeout=10.0) as client:
            res = client.get(url, headers=self._memuu_headers())
            res.raise_for_status()
            return res.json()

    def memorize_conversation(
        self,
        conversation: List[Dict],
        user_id: str,
        user_name: Optional[str] = None,
    ) -> Optional[str]:
        if not self._memuu_enabled():
            return None
        if len(conversation) < 3:
            return None
        payload: Dict = {
            "conversation": conversation,
            "user_id": user_id,
            "agent_id": self._current_memuu_agent_id(),
            "session_date": datetime.utcnow().isoformat() + "Z",
        }
        if user_name:
            payload["user_name"] = user_name
        agent_name = self._current_memuu_agent_name()
        if agent_name:
            payload["agent_name"] = agent_name
        result = self._memuu_post("/api/v3/memory/memorize", payload)
        return result.get("task_id")

    def retrieve_memories(self, query: str, user_id: str) -> Optional[List[Dict]]:
        if not self._memuu_enabled():
            return None
        payload = {"user_id": user_id, "agent_id": self._current_memuu_agent_id(), "query": query}
        result = self._memuu_post("/api/v3/memory/retrieve", payload)
        items = result.get("items") or []
        now = datetime.utcnow().isoformat() + "Z"
        mapped: List[Dict] = []
        for it in items:
            mapped.append(
                {
                    "id": f"memuu_{uuid.uuid4().hex[:12]}",
                    "memory": it.get("content") or "",
                    "user_id": user_id,
                    "created_at": now,
                    "metadata": {"provider": "memuu", "memory_type": it.get("memory_type")},
                    "score": 1.0,
                }
            )
        return mapped

    def list_categories(self, user_id: str) -> Optional[List[Dict]]:
        if not self._memuu_enabled():
            return None
        payload = {"user_id": user_id, "agent_id": self._current_memuu_agent_id()}
        result = self._memuu_post("/api/v3/memory/categories", payload)
        return result.get("categories") or []

    def record_chat_turn_for_memuu(
        self,
        user_id: str,
        user_message: str,
        assistant_message: str,
        user_name: Optional[str] = None,
    ) -> Optional[str]:
        if not self._memuu_enabled():
            return None
        buf = self._conversation_buffer.setdefault(user_id, [])
        now = datetime.utcnow().isoformat() + "Z"
        buf.append({"role": "user", "content": user_message, "created_at": now, "name": user_name})
        buf.append({"role": "assistant", "content": assistant_message, "created_at": now, "name": self._current_memuu_agent_name()})
        buf[:] = buf[-12:]
        conversation = [m for m in buf if m.get("content")]
        if len(conversation) < 3:
            return None
        try:
            return self.memorize_conversation(conversation=conversation, user_id=user_id, user_name=user_name)
        except Exception:
            return None

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
            if self._fallback_enabled:
                memory_id = str(uuid.uuid4())
                item = {
                    "id": memory_id,
                    "memory": content,
                    "user_id": user_id,
                    "created_at": datetime.utcnow().isoformat() + "Z",
                    "metadata": metadata or {}
                }
                self._fallback_store.setdefault(user_id, []).append(item)
                return item

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
            if self._fallback_enabled:
                results: List[Dict] = []
                for item in self._fallback_store.get(user_id, []):
                    text = (item.get("memory") or "")
                    if query.lower() in text.lower():
                        results.append({**item, "score": 1.0})
                try:
                    memuu_results = self.retrieve_memories(query=query, user_id=user_id) or []
                except Exception:
                    memuu_results = []
                combined = memuu_results + results
                return combined[:limit]

            results: List[Dict] = []
            try:
                results = self.memory.search(
                    query=query,
                    user_id=user_id,
                    limit=limit,
                    filters=filters
                )
            except Exception:
                results = []

            try:
                memuu_results = self.retrieve_memories(query=query, user_id=user_id) or []
            except Exception:
                memuu_results = []

            combined = memuu_results + results
            return combined[:limit]
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
            if self._fallback_enabled:
                return list(self._fallback_store.get(user_id, []))

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
            if self._fallback_enabled:
                for user_id, items in self._fallback_store.items():
                    new_items = [m for m in items if m.get("id") != memory_id]
                    if len(new_items) != len(items):
                        self._fallback_store[user_id] = new_items
                        return True
                return False

            self.memory.delete(memory_id=memory_id)
            return True
        except Exception as e:
            raise Exception(f"Failed to delete memory: {str(e)}")

memu_service = MemUService()
