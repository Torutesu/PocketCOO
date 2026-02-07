# PersonalOS - Technical Design Document

## 🏗 System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web App     │  │  Mobile App  │  │  Browser Ext │      │
│  │  (Next.js)   │  │  (React N.)  │  │  (Chrome)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API / GraphQL / WebSocket
┌───────────────────────────▼─────────────────────────────────┐
│                    API Gateway (FastAPI)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Auth      │  │  Rate      │  │  Load      │            │
│  │  Middleware│  │  Limiting  │  │  Balancer  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Application Layer                         │
│  ┌─────────────────────────────────────────────────┐        │
│  │  Core Services                                   │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │        │
│  │  │ Memory   │  │ Search   │  │ AI       │      │        │
│  │  │ Manager  │  │ Engine   │  │ Assistant│      │        │
│  │  └──────────┘  └──────────┘  └──────────┘      │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │        │
│  │  │ Sync     │  │ Analytics│  │ Plugin   │      │        │
│  │  │ Service  │  │ Service  │  │ Manager  │      │        │
│  │  └──────────┘  └──────────┘  └──────────┘      │        │
│  └─────────────────────────────────────────────────┘        │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ memU     │  │ Qdrant   │  │ Postgres │  │ Redis    │   │
│  │ (Memory) │  │ (Vector) │  │ (Meta)   │  │ (Cache)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Data Models

### Memory Model

```python
from enum import Enum
from datetime import datetime
from typing import Optional, List, Dict

class MemoryLayer(Enum):
    ACTIVE = "active"       # Last 7 days
    WORKING = "working"     # Current projects
    REFERENCE = "reference" # Frequently accessed
    ARCHIVE = "archive"     # Cold storage

class MemoryType(Enum):
    CONVERSATION = "conversation"
    ACTION = "action"
    NOTE = "note"
    FILE = "file"
    EVENT = "event"
    EMAIL = "email"

class Memory:
    id: str
    user_id: str
    content: str
    embedding: List[float]  # 1536-dim vector (OpenAI)

    # Metadata
    type: MemoryType
    layer: MemoryLayer
    source: str  # "chat", "email", "calendar", etc.

    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_accessed_at: datetime

    # Relationships
    related_memory_ids: List[str]
    parent_memory_id: Optional[str]
    tags: List[str]

    # Scoring
    importance_score: float  # 0.0 - 1.0
    access_count: int

    # Privacy
    is_encrypted: bool
    is_shared: bool
    shared_with: List[str]

    # Rich content
    metadata: Dict  # Flexible JSON field
    attachments: List[str]  # File URLs
```

### User Model

```python
class User:
    id: str
    email: str
    password_hash: str

    # Profile
    full_name: str
    avatar_url: Optional[str]

    # Settings
    privacy_tier: str  # "cloud", "hybrid", "local"
    ai_persona: AIPersona

    # Integrations
    connected_services: Dict[str, ServiceConfig]

    # Subscription
    plan: str  # "free", "premium"
    subscription_expires_at: Optional[datetime]

    # Stats
    total_memories: int
    created_at: datetime
    last_login_at: datetime
```

### AI Persona Model

```python
class AIPersona:
    name: str  # "Alfred", "Jarvis", etc.

    # Personality traits (0-10 scale)
    formality: int
    verbosity: int
    humor: int
    proactivity: int

    # Communication preferences
    use_emojis: bool
    provide_suggestions: bool
    ask_clarifying_questions: bool

    # Expertise areas
    expertise_areas: List[str]

    # Custom instructions
    system_prompt_additions: str
```

---

## 🔧 Core Services Implementation

## 1. 記憶レイヤー（MemU / MemuU Integration）

### アーキテクチャ概要
PersonalOSは、記憶管理に **MemU**（https://memu.bot/）を採用します。
必要に応じて MemU Cloud API（`https://api.memu.so`）に接続し、記憶化（抽出・構造化）と意味的検索を行います。

### コンポーネント
- **MemUService**: MemU APIとの通信を担当するサービスクラス。
  - `memorize`: 会話やテキストの記憶化タスクを登録
  - `retrieve`: 意味的検索による記憶の取得
  - `categories`: 記憶カテゴリの取得
  - `delete`: ユーザー単位での記憶削除

### データフロー
1. **記憶の保存**:
   User -> API -> MemUService -> MemU API (Memorize Task)
   ※ MemU側で非同期に処理され、構造化・ベクトル化されます。

2. **記憶の検索**:
   User -> API -> MemUService -> MemU API (Retrieve)
   ※ クエリに基づいて関連する記憶を抽出します。

### 設定
- `MEMUU_API_KEY`（または `MEMU_API_KEY`）: MemU Cloud APIの認証キー
- `MEMUU_BASE_URL`: ベースURL（デフォルト: `https://api.memu.so`）
- `MEMUU_AGENT_ID` / `MEMUU_AGENT_NAME`: エージェント識別子

---

### 2. AI Assistant Service

```python
# backend/services/ai_assistant.py

from typing import List, Dict
from models import Memory, User, AIPersona
from services.memory_manager import MemoryManager
from services.llm_service import LLMService

class AIAssistant:
    def __init__(self):
        self.memory_manager = MemoryManager()
        self.llm = LLMService()

    async def chat(
        self,
        user: User,
        message: str,
        conversation_history: List[Dict]
    ) -> Dict:
        """Process chat message with memory context."""

        # 1. Search relevant memories
        relevant_memories = await self.memory_manager.search_memories(
            user_id=user.id,
            query=message,
            limit=5
        )

        # 2. Build context
        context = self._build_context(relevant_memories)

        # 3. Apply AI persona
        system_prompt = self._build_system_prompt(user.ai_persona, context)

        # 4. Generate response
        response = await self.llm.chat(
            system_prompt=system_prompt,
            messages=conversation_history + [{"role": "user", "content": message}]
        )

        # 5. Save conversation to memory
        await self._save_conversation(user.id, message, response)

        return {
            "response": response,
            "memories_used": [m.id for m in relevant_memories],
            "context_size": len(context)
        }

    async def proactive_suggestions(self, user: User) -> List[str]:
        """Generate proactive suggestions based on user's context."""

        suggestions = []

        # Check for pending tasks
        pending_tasks = await self.memory_manager.search_memories(
            user_id=user.id,
            query="task TODO pending",
            filters={"type": "action", "completed": False}
        )

        if pending_tasks:
            suggestions.append(
                f"You have {len(pending_tasks)} pending tasks. "
                "Would you like to review them?"
            )

        # Check for upcoming events
        # (Would integrate with calendar service)

        # Check for follow-ups
        follow_ups = await self._find_follow_ups(user.id)
        if follow_ups:
            suggestions.append(
                f"Reminder: You mentioned following up on '{follow_ups[0].content}'"
            )

        return suggestions

    def _build_context(self, memories: List[Memory]) -> str:
        """Build context string from memories."""

        context_parts = []
        for memory in memories:
            context_parts.append(
                f"[Memory from {memory.created_at.strftime('%Y-%m-%d')}]\n"
                f"{memory.content}\n"
            )

        return "\n".join(context_parts)

    def _build_system_prompt(self, persona: AIPersona, context: str) -> str:
        """Build system prompt with persona and context."""

        base_prompt = f"""You are {persona.name}, the user's AI assistant.

Your personality:
- Formality level: {persona.formality}/10
- Verbosity: {persona.verbosity}/10
- Humor: {persona.humor}/10
- Proactivity: {persona.proactivity}/10

Your expertise areas: {", ".join(persona.expertise_areas)}

Relevant context from user's memory:
{context}

{persona.system_prompt_additions}

Remember: Use this context to provide personalized, context-aware responses.
"""

        return base_prompt

    async def _save_conversation(
        self,
        user_id: str,
        user_message: str,
        ai_response: str
    ):
        """Save conversation to memory."""

        conversation_text = f"User: {user_message}\nAssistant: {ai_response}"

        await self.memory_manager.create_memory(
            user_id=user_id,
            content=conversation_text,
            type=MemoryType.CONVERSATION,
            source="chat",
            metadata={"type": "conversation"}
        )
```

---

### 3. Sync Service (Multi-Source Integration)

```python
# backend/services/sync_service.py

from abc import ABC, abstractmethod
from typing import List, Dict
from models import Memory, User
from services.memory_manager import MemoryManager

class DataSource(ABC):
    """Abstract base class for data sources."""

    @abstractmethod
    async def fetch_new_data(self, user: User, since: datetime) -> List[Dict]:
        """Fetch new data since last sync."""
        pass

    @abstractmethod
    def transform_to_memory(self, raw_data: Dict, user: User) -> Memory:
        """Transform raw data to Memory object."""
        pass

class CalendarSource(DataSource):
    async def fetch_new_data(self, user: User, since: datetime) -> List[Dict]:
        """Fetch calendar events."""

        # Integration with Google Calendar API
        calendar_config = user.connected_services.get("google_calendar")
        if not calendar_config:
            return []

        # Fetch events (pseudo-code)
        events = await google_calendar_api.get_events(
            credentials=calendar_config["credentials"],
            since=since
        )

        return events

    def transform_to_memory(self, event: Dict, user: User) -> Memory:
        """Transform calendar event to memory."""

        content = f"""Event: {event['title']}
Time: {event['start']} - {event['end']}
Attendees: {', '.join(event.get('attendees', []))}
Description: {event.get('description', 'No description')}
"""

        return Memory(
            user_id=user.id,
            content=content,
            type=MemoryType.EVENT,
            source="google_calendar",
            metadata={
                "event_id": event["id"],
                "start_time": event["start"],
                "end_time": event["end"]
            }
        )

class EmailSource(DataSource):
    async def fetch_new_data(self, user: User, since: datetime) -> List[Dict]:
        """Fetch important emails."""

        gmail_config = user.connected_services.get("gmail")
        if not gmail_config:
            return []

        # Fetch emails (only important/starred)
        emails = await gmail_api.get_emails(
            credentials=gmail_config["credentials"],
            since=since,
            query="is:important OR is:starred"
        )

        return emails

    def transform_to_memory(self, email: Dict, user: User) -> Memory:
        """Transform email to memory."""

        content = f"""Email from: {email['from']}
Subject: {email['subject']}
Date: {email['date']}

{email['body'][:500]}...  # Truncate long emails
"""

        return Memory(
            user_id=user.id,
            content=content,
            type=MemoryType.EMAIL,
            source="gmail",
            metadata={
                "email_id": email["id"],
                "sender": email["from"],
                "subject": email["subject"]
            }
        )

class SyncService:
    def __init__(self):
        self.memory_manager = MemoryManager()
        self.sources = {
            "calendar": CalendarSource(),
            "email": EmailSource(),
            # Add more sources...
        }

    async def sync_user_data(self, user: User):
        """Sync data from all connected sources."""

        for source_name, source in self.sources.items():
            if source_name in user.connected_services:

                # Get last sync time
                last_sync = await self._get_last_sync_time(user.id, source_name)

                # Fetch new data
                raw_data = await source.fetch_new_data(user, last_sync)

                # Transform and save
                for data in raw_data:
                    memory = source.transform_to_memory(data, user)
                    await self.memory_manager.create_memory(
                        user_id=user.id,
                        content=memory.content,
                        type=memory.type,
                        source=memory.source,
                        metadata=memory.metadata
                    )

                # Update last sync time
                await self._update_last_sync_time(user.id, source_name)

    async def _get_last_sync_time(self, user_id: str, source: str) -> datetime:
        """Get last sync timestamp for source."""
        # Query from database
        pass

    async def _update_last_sync_time(self, user_id: str, source: str):
        """Update last sync timestamp."""
        # Update database
        pass
```

---

### 4. Plugin System

```python
# backend/services/plugin_manager.py

from typing import List, Dict, Callable
from abc import ABC, abstractmethod

class Plugin(ABC):
    """Base class for all plugins."""

    name: str
    version: str
    author: str
    description: str

    @abstractmethod
    async def on_memory_created(self, memory: Memory):
        """Called when a new memory is created."""
        pass

    @abstractmethod
    async def on_query(self, query: str) -> Optional[str]:
        """Called when user makes a query. Return response if handled."""
        pass

    async def on_memory_accessed(self, memory: Memory):
        """Called when a memory is accessed."""
        pass

    async def on_user_action(self, action: str, data: Dict):
        """Called when user performs an action."""
        pass

class WeatherPlugin(Plugin):
    name = "Weather Tracker"
    version = "1.0.0"
    author = "PersonalOS Team"
    description = "Automatically log weather at each location"

    async def on_memory_created(self, memory: Memory):
        """Check if memory contains location, fetch weather."""

        # Extract location from memory
        location = self._extract_location(memory.content)
        if location:
            weather = await self._fetch_weather(location)

            # Create weather memory
            await self.create_memory(
                content=f"Weather at {location}: {weather}",
                type=MemoryType.NOTE,
                source="weather_plugin",
                tags=["weather", location]
            )

    async def on_query(self, query: str) -> Optional[str]:
        """Handle weather-related queries."""

        if "weather" in query.lower():
            # Search weather memories
            memories = await self.search_memories(tags=["weather"])
            if memories:
                latest = memories[0]
                return f"Latest weather: {latest.content}"

        return None

    def _extract_location(self, text: str) -> Optional[str]:
        # Use NLP to extract location
        pass

    async def _fetch_weather(self, location: str) -> str:
        # Call weather API
        pass

class PluginManager:
    def __init__(self):
        self.plugins: List[Plugin] = []
        self.hooks: Dict[str, List[Callable]] = {
            "on_memory_created": [],
            "on_query": [],
            "on_memory_accessed": [],
            "on_user_action": []
        }

    def register_plugin(self, plugin: Plugin):
        """Register a new plugin."""
        self.plugins.append(plugin)

        # Register hooks
        for hook_name in self.hooks.keys():
            hook_method = getattr(plugin, hook_name, None)
            if hook_method:
                self.hooks[hook_name].append(hook_method)

    async def trigger_hook(self, hook_name: str, *args, **kwargs):
        """Trigger all plugins listening to a hook."""

        for hook in self.hooks.get(hook_name, []):
            try:
                result = await hook(*args, **kwargs)
                if result:  # If plugin handled the event
                    return result
            except Exception as e:
                print(f"Plugin error in {hook_name}: {e}")

        return None
```

---

## 🔐 Security Implementation

### Encryption Service

```python
# backend/services/encryption_service.py

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
import base64

class EncryptionService:
    def __init__(self, master_key: str):
        """Initialize with user's master key."""
        self.cipher = Fernet(self._derive_key(master_key))

    def _derive_key(self, password: str) -> bytes:
        """Derive encryption key from password."""
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b"personalos_salt",  # Should be per-user random salt
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key

    def encrypt(self, data: str) -> str:
        """Encrypt data."""
        encrypted = self.cipher.encrypt(data.encode())
        return base64.urlsafe_b64encode(encrypted).decode()

    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt data."""
        data = base64.urlsafe_b64decode(encrypted_data.encode())
        decrypted = self.cipher.decrypt(data)
        return decrypted.decode()

    def encrypt_memory(self, memory: Memory) -> Memory:
        """Encrypt sensitive fields of memory."""
        if memory.is_encrypted:
            return memory

        memory.content = self.encrypt(memory.content)
        memory.is_encrypted = True
        return memory

    def decrypt_memory(self, memory: Memory) -> Memory:
        """Decrypt memory."""
        if not memory.is_encrypted:
            return memory

        memory.content = self.decrypt(memory.content)
        memory.is_encrypted = False
        return memory
```

---

## 📊 Database Schema

### PostgreSQL (Metadata)

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    privacy_tier VARCHAR(50) DEFAULT 'cloud',
    plan VARCHAR(50) DEFAULT 'free',
    total_memories INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    settings JSONB
);

-- Memory metadata table
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,  -- Encrypted if user enabled encryption
    type VARCHAR(50) NOT NULL,
    layer VARCHAR(50) DEFAULT 'active',
    source VARCHAR(100),
    importance_score FLOAT DEFAULT 0.5,
    access_count INT DEFAULT 0,
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_accessed_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB,
    tags TEXT[]
);

CREATE INDEX idx_memories_user_id ON memories(user_id);
CREATE INDEX idx_memories_type ON memories(type);
CREATE INDEX idx_memories_layer ON memories(layer);
CREATE INDEX idx_memories_created_at ON memories(created_at);
CREATE INDEX idx_memories_tags ON memories USING GIN(tags);

-- Memory relationships table
CREATE TABLE memory_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
    related_memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50),  -- 'related', 'parent', 'child'
    strength FLOAT DEFAULT 0.5,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_memory_relationships_memory_id ON memory_relationships(memory_id);

-- Sync tracking table
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL,
    last_sync_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50),
    items_synced INT DEFAULT 0,
    error_message TEXT
);

CREATE INDEX idx_sync_logs_user_id ON sync_logs(user_id);
```

### Qdrant (Vector Database)

```python
# Collection schema for Qdrant

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

client = QdrantClient("localhost", port=6333)

# Create collection
client.create_collection(
    collection_name="memories",
    vectors_config=VectorParams(
        size=1536,  # OpenAI embedding dimension
        distance=Distance.COSINE
    )
)

# Point structure:
{
    "id": "memory_uuid",
    "vector": [0.1, 0.2, ...],  # 1536-dim embedding
    "payload": {
        "user_id": "user_uuid",
        "type": "conversation",
        "layer": "active",
        "source": "chat",
        "created_at": "2024-07-06T10:00:00Z",
        "tags": ["philosophy", "books"]
    }
}
```

---

## 🚀 API Endpoints

### Authentication

```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login
POST   /api/auth/logout          # Logout
POST   /api/auth/refresh         # Refresh token
GET    /api/auth/me              # Get current user
```

### Memory Management

```
POST   /api/memories             # Create memory
GET    /api/memories             # List memories (with filters)
GET    /api/memories/:id         # Get specific memory
PUT    /api/memories/:id         # Update memory
DELETE /api/memories/:id         # Delete memory
GET    /api/memories/search      # Search memories
GET    /api/memories/graph       # Get memory graph
GET    /api/memories/stats       # Get memory statistics
```

### Chat

```
POST   /api/chat/message         # Send chat message
GET    /api/chat/history         # Get conversation history
POST   /api/chat/suggestions     # Get proactive suggestions
```

### Sync

```
POST   /api/sync/start           # Start manual sync
GET    /api/sync/status          # Get sync status
GET    /api/sync/sources         # List connected sources
POST   /api/sync/sources         # Connect new source
DELETE /api/sync/sources/:id     # Disconnect source
```

### Export

```
POST   /api/export/memories      # Export memories
GET    /api/export/status/:id    # Check export status
GET    /api/export/download/:id  # Download export
```

### Plugins

```
GET    /api/plugins              # List installed plugins
GET    /api/plugins/available    # Browse plugin marketplace
POST   /api/plugins/install      # Install plugin
DELETE /api/plugins/:id          # Uninstall plugin
```

---

## 🧪 Testing Strategy

### Unit Tests

```python
# tests/test_memory_manager.py

import pytest
from services.memory_manager import MemoryManager
from models import Memory, MemoryType

@pytest.fixture
async def memory_manager():
    return MemoryManager()

@pytest.mark.asyncio
async def test_create_memory(memory_manager):
    memory = await memory_manager.create_memory(
        user_id="test_user",
        content="Test memory",
        type=MemoryType.NOTE,
        source="test"
    )

    assert memory.id is not None
    assert memory.content == "Test memory"
    assert memory.embedding is not None

@pytest.mark.asyncio
async def test_search_memories(memory_manager):
    # Create test memories
    await memory_manager.create_memory(
        user_id="test_user",
        content="I love philosophy",
        type=MemoryType.NOTE,
        source="test"
    )

    # Search
    results = await memory_manager.search_memories(
        user_id="test_user",
        query="philosophy",
        limit=5
    )

    assert len(results) > 0
    assert "philosophy" in results[0].content.lower()
```

### Integration Tests

```python
# tests/test_api.py

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_memory_endpoint():
    response = client.post(
        "/api/memories",
        json={
            "content": "Test memory",
            "type": "note",
            "source": "test"
        },
        headers={"Authorization": "Bearer test_token"}
    )

    assert response.status_code == 201
    assert response.json()["content"] == "Test memory"

def test_search_memories_endpoint():
    response = client.get(
        "/api/memories/search?query=philosophy",
        headers={"Authorization": "Bearer test_token"}
    )

    assert response.status_code == 200
    assert isinstance(response.json()["memories"], list)
```

### Performance Tests

```python
# tests/test_performance.py

import pytest
import asyncio
from services.memory_manager import MemoryManager

@pytest.mark.asyncio
async def test_search_performance():
    memory_manager = MemoryManager()

    # Create 10k memories
    for i in range(10000):
        await memory_manager.create_memory(
            user_id="test_user",
            content=f"Test memory {i}",
            type=MemoryType.NOTE,
            source="test"
        )

    # Measure search time
    import time
    start = time.time()
    results = await memory_manager.search_memories(
        user_id="test_user",
        query="memory 5000",
        limit=10
    )
    duration = time.time() - start

    assert duration < 0.5  # Should be under 500ms
    assert len(results) > 0
```

---

## 📈 Performance Optimization

### Caching Strategy

```python
# backend/services/cache_service.py

import redis
import json
from typing import Optional, Any

class CacheService:
    def __init__(self):
        self.redis = redis.Redis(host='localhost', port=6379, db=0)

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        value = self.redis.get(key)
        if value:
            return json.loads(value)
        return None

    def set(self, key: str, value: Any, ttl: int = 3600):
        """Set value in cache with TTL."""
        self.redis.setex(
            key,
            ttl,
            json.dumps(value)
        )

    def delete(self, key: str):
        """Delete key from cache."""
        self.redis.delete(key)

    def clear_user_cache(self, user_id: str):
        """Clear all cache for a user."""
        pattern = f"user:{user_id}:*"
        keys = self.redis.keys(pattern)
        if keys:
            self.redis.delete(*keys)
```

### Query Optimization

```python
# Use proper indexes
# Add caching for frequent queries
# Implement pagination

async def search_memories_optimized(
    user_id: str,
    query: str,
    limit: int = 10,
    offset: int = 0
) -> Dict:
    """Optimized memory search with caching and pagination."""

    # Check cache first
    cache_key = f"search:{user_id}:{query}:{offset}:{limit}"
    cached = cache_service.get(cache_key)
    if cached:
        return cached

    # Perform search
    results = await memory_manager.search_memories(
        user_id=user_id,
        query=query,
        limit=limit,
        offset=offset
    )

    # Get total count (cached separately)
    total_count = await memory_manager.count_memories(
        user_id=user_id,
        query=query
    )

    response = {
        "memories": results,
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total_count
    }

    # Cache for 5 minutes
    cache_service.set(cache_key, response, ttl=300)

    return response
```

---

## 🐳 Deployment

### Docker Configuration

See `docker-compose.yml` for complete setup.

### Environment Variables

See `.env.example` for all required environment variables.

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml

name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-asyncio

      - name: Run tests
        run: |
          cd backend
          pytest tests/ -v

      - name: Run linting
        run: |
          cd backend
          flake8 .
          black --check .

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build Docker images
        run: docker-compose build

      - name: Push to registry
        if: github.ref == 'refs/heads/main'
        run: |
          docker tag personalos-backend:latest registry/personalos-backend:latest
          docker push registry/personalos-backend:latest
```

---

**Last Updated**: 2026-02-06
**Status**: Technical Design Complete → Ready for Implementation
