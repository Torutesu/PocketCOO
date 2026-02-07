# PersonalOS - 実装計画書

## 🎯 実装戦略

### 全体方針
1. **MVP優先** - 最小限の機能で動くプロダクトを素早く構築
2. **memU中心** - memUの機能を最大限活用
3. **段階的実装** - 小さく作って、テストして、改善
4. **ドキュメント重視** - コードと同時にドキュメント更新

---

## 📦 技術スタック

### バックエンド
- **Python 3.11+** - メイン言語
- **FastAPI** - Web フレームワーク
- **MemU（https://memu.bot/） + mem0ai** - 長期記憶（記憶化・検索）
- **Qdrant** - ベクトルデータベース
- **SQLAlchemy + Alembic** - DB
- **SQLite（デフォルト）** - 永続化（`DATABASE_URL`で切替可）
- **Redis（任意）** - キャッシング
- **Pydantic** - データバリデーション

### フロントエンド
- **Next.js 14** - React フレームワーク
- **TypeScript** - 型安全性
- **TailwindCSS** - スタイリング
- **D3.js** - グラフ可視化
- **TanStack Query** - データフェッチング
- **Axios** - APIクライアント
- **Remotion** - デモ動画

### AI/ML
- **OpenAI GPT-4o-mini** - LLM
- **text-embedding-3-small** - テキスト埋め込み

### インフラ
- **Docker & Docker Compose** - コンテナ化

---

## 📁 プロジェクト構造

```
personalos/
├── backend/                          # FastAPI バックエンド
│   ├── main.py                      # エントリーポイント
│   ├── requirements.txt             # Python依存関係
│   │
│   ├── api/                         # APIエンドポイント
│   │   ├── __init__.py
│   │   ├── health.py               # ヘルスチェック
│   │   ├── auth.py                 # 認証
│   │   ├── chat.py                 # チャットAPI
│   │   ├── memory.py               # メモリ管理API
│   │   └── export.py               # エクスポートAPI
│   │
│   ├── services/                    # ビジネスロジック
│   │   ├── __init__.py
│   │   ├── memu_service.py         # memU統合サービス
│   │   ├── memory_manager.py       # メモリマネージャー
│   │   ├── ai_assistant.py         # AIアシスタント
│   │   ├── search_service.py       # 検索サービス
│   │   └── lifecycle_manager.py    # ライフサイクル管理
│   │
│   ├── models/                      # データモデル
│   │   ├── __init__.py
│   │   ├── user.py                 # ユーザーモデル
│   │   ├── memory.py               # メモリモデル
│   │   ├── chat.py                 # チャットモデル
│   │   └── persona.py              # AIペルソナモデル
│   │
│   ├── core/                        # コア設定
│   │   ├── __init__.py
│   │   ├── config.py               # 設定管理
│   │   ├── security.py             # セキュリティ
│   │   └── dependencies.py         # 依存性注入
│   │
│   ├── db/                          # データベース
│   │   ├── __init__.py
│   │   ├── session.py              # DBセッション
│   │   └── migrations/             # マイグレーション
│   │
│   └── tests/                       # テスト
│       ├── test_memory.py
│       ├── test_chat.py
│       └── test_api.py
│
├── frontend/                         # Next.js フロントエンド
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   │
│   ├── app/                         # App Router
│   │   ├── layout.tsx              # ルートレイアウト
│   │   ├── page.tsx                # ホームページ
│   │   ├── chat/
│   │   │   └── page.tsx            # チャットページ
│   │   ├── memories/
│   │   │   └── page.tsx            # メモリ一覧ページ
│   │   └── dashboard/
│   │       └── page.tsx            # ダッシュボード
│   │
│   ├── components/                  # Reactコンポーネント
│   │   ├── ui/                     # 基本UIコンポーネント
│   │   ├── ChatInterface.tsx       # チャットUI
│   │   ├── MemoryList.tsx          # メモリリスト
│   │   ├── MemoryGraph.tsx         # メモリグラフ
│   │   └── MemoryTimeline.tsx      # タイムライン
│   │
│   ├── lib/                         # ユーティリティ
│   │   ├── api.ts                  # APIクライアント
│   │   ├── utils.ts                # ユーティリティ関数
│   │   └── hooks.ts                # カスタムフック
│   │
│   └── types/                       # TypeScript型定義
│       └── index.ts
│
├── docs/                            # ドキュメント
│   ├── PRODUCT_SPEC_JP.md
│   ├── TECHNICAL_DESIGN.md
│   └── API.md
│
├── scripts/                         # ユーティリティスクリプト
│   ├── setup.sh                    # セットアップスクリプト
│   └── seed_data.py                # テストデータ投入
│
├── docker-compose.yml               # Docker設定
├── .env.example                     # 環境変数サンプル
├── .gitignore
└── README.md
```

---

## 🚀 実装フェーズ

## Phase 0: 環境セットアップ（1日）

### タスク

#### 0.1 プロジェクト構造作成
```bash
# ディレクトリ作成
mkdir -p backend/{api,services,models,core,db,tests}
mkdir -p frontend/{app,components,lib,types}
mkdir -p docs scripts

# 必要なファイル作成
touch backend/{__init__.py,main.py,requirements.txt}
touch frontend/{package.json,tsconfig.json,next.config.js}
```

#### 0.2 依存関係のインストール

**バックエンド (requirements.txt)**
```txt
# FastAPI
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
pydantic-settings==2.1.0

# memU
mem0ai==0.1.0

# Database
qdrant-client==1.7.3
psycopg2-binary==2.9.9
sqlalchemy==2.0.25
alembic==1.13.1

# AI
openai==1.10.0

# Auth & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# Utils
python-dotenv==1.0.0
redis==5.0.1

# Testing
pytest==7.4.4
pytest-asyncio==0.23.3
httpx==0.26.0
```

**フロントエンド (package.json)**
```json
{
  "name": "personalos-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "14.1.0",
    "typescript": "^5.3.3",
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.312.0",
    "@tanstack/react-query": "^5.17.19",
    "axios": "^1.6.5",
    "d3": "^7.8.5",
    "@types/d3": "^7.4.3"
  }
}
```

#### 0.3 Docker設定

**docker-compose.yml は既存のものを使用**

#### 0.4 環境変数設定

**.env（.env.exampleをコピーして編集）**
```bash
cp .env.example .env
# OpenAI APIキーなどを設定
```

---

## Phase 1: バックエンド基礎（2-3日）

### 1.1 FastAPI基礎セットアップ

**backend/main.py**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import health, auth, chat, memory

app = FastAPI(
    title="PersonalOS API",
    description="AI Memory Companion Backend",
    version="0.1.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(memory.router, prefix="/api/memory", tags=["memory"])

@app.get("/")
async def root():
    return {"message": "PersonalOS API", "version": "0.1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**backend/api/health.py**
```python
from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def health_check():
    return {
        "status": "healthy",
        "service": "personalos-api"
    }
```

**テスト**
```bash
cd backend
uvicorn main:app --reload

# 別ターミナルで
curl http://localhost:8000/api/health
```

### 1.2 memU統合サービス

**backend/services/memu_service.py**
```python
from mem0 import Memory
from typing import List, Dict, Optional
import os

class MemUService:
    """memU統合サービス"""

    def __init__(self):
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
        """記憶を追加"""
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
        """記憶を検索"""
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
        """全記憶を取得"""
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
        """記憶を更新"""
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
        """記憶を削除"""
        try:
            self.memory.delete(memory_id=memory_id)
            return True
        except Exception as e:
            raise Exception(f"Failed to delete memory: {str(e)}")

# シングルトンインスタンス
memu_service = MemUService()
```

**backend/core/dependencies.py**
```python
from services.memu_service import memu_service

def get_memu_service():
    """memUサービスの依存性注入"""
    return memu_service
```

### 1.3 チャットAPI実装

**backend/models/chat.py**
```python
from pydantic import BaseModel
from typing import List, Optional, Dict

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    user_id: str
    use_memory: bool = True

class ChatResponse(BaseModel):
    response: str
    memories_used: List[Dict]
    memory_count: int
```

**backend/api/chat.py**
```python
from fastapi import APIRouter, Depends, HTTPException
from models.chat import ChatRequest, ChatResponse
from services.memu_service import MemUService
from core.dependencies import get_memu_service
import openai
import os

router = APIRouter()

@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    memu: MemUService = Depends(get_memu_service)
):
    """チャットメッセージを送信"""
    try:
        # 関連する記憶を検索
        memories_used = []
        if request.use_memory:
            memories_used = memu.search_memories(
                query=request.message,
                user_id=request.user_id,
                limit=5
            )

        # コンテキスト構築
        context = ""
        if memories_used:
            context = "関連する記憶:\n"
            for mem in memories_used:
                context += f"- {mem.get('memory', '')}\n"

        # LLMに送信
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": f"""あなたはPersonalOSのAIアシスタントです。
ユーザーの記憶を活用して、個別化された応答を提供してください。

{context}
"""
                },
                {"role": "user", "content": request.message}
            ],
            temperature=0.7
        )

        response_text = completion.choices[0].message.content

        # 会話を記憶に保存
        conversation = f"ユーザー: {request.message}\nアシスタント: {response_text}"
        memu.add_memory(
            content=conversation,
            user_id=request.user_id,
            metadata={
                "type": "conversation",
                "layer": "active"
            }
        )

        return ChatResponse(
            response=response_text,
            memories_used=memories_used,
            memory_count=len(memories_used)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 1.4 メモリ管理API実装

**backend/models/memory.py**
```python
from pydantic import BaseModel
from typing import Optional, Dict, List

class MemoryCreate(BaseModel):
    content: str
    user_id: str
    metadata: Optional[Dict] = None

class MemoryResponse(BaseModel):
    id: str
    content: str
    user_id: str
    created_at: str
    metadata: Dict
```

**backend/api/memory.py**
```python
from fastapi import APIRouter, Depends, HTTPException
from models.memory import MemoryCreate, MemoryResponse
from services.memu_service import MemUService
from core.dependencies import get_memu_service
from typing import List

router = APIRouter()

@router.post("/", response_model=Dict)
async def create_memory(
    memory: MemoryCreate,
    memu: MemUService = Depends(get_memu_service)
):
    """記憶を作成"""
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
    """全記憶を取得"""
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
    """記憶を検索"""
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
    """記憶を削除"""
    try:
        success = memu.delete_memory(memory_id=memory_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**テスト**
```bash
# 記憶追加
curl -X POST http://localhost:8000/api/memory/ \
  -H "Content-Type: application/json" \
  -d '{
    "content": "私は哲学と歴史が好きです",
    "user_id": "test_user",
    "metadata": {"category": "preferences"}
  }'

# チャット
curl -X POST http://localhost:8000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "私に合う本を推薦してください",
    "user_id": "test_user",
    "use_memory": true
  }'
```

---

## Phase 2: フロントエンド基礎（2-3日）

### 2.1 Next.js セットアップ

**frontend/app/layout.tsx**
```tsx
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PersonalOS',
  description: 'Your AI-powered second brain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
```

**frontend/app/page.tsx**
```tsx
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">PersonalOS</h1>
        <p className="text-xl text-gray-600 mb-8">
          あなたのすべてを記憶するAI
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/chat"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            チャットを始める
          </Link>

          <Link
            href="/memories"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            記憶を見る
          </Link>
        </div>
      </div>
    </main>
  )
}
```

**frontend/tailwind.config.ts**
```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
```

### 2.2 APIクライアント

**frontend/lib/api.ts**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Memory {
  id: string
  memory: string
  user_id: string
  created_at: string
  metadata: Record<string, any>
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  response: string
  memories_used: Memory[]
  memory_count: number
}

export const api = {
  // チャット
  async sendMessage(
    message: string,
    userId: string,
    useMemory: boolean = true
  ): Promise<ChatResponse> {
    const response = await fetch(`${API_URL}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, user_id: userId, use_memory: useMemory })
    })

    if (!response.ok) throw new Error('Failed to send message')
    return response.json()
  },

  // 記憶管理
  async getAllMemories(userId: string): Promise<Memory[]> {
    const response = await fetch(`${API_URL}/api/memory/all/${userId}`)
    if (!response.ok) throw new Error('Failed to get memories')

    const data = await response.json()
    return data.memories
  },

  async searchMemories(
    query: string,
    userId: string,
    limit: number = 10
  ): Promise<Memory[]> {
    const response = await fetch(
      `${API_URL}/api/memory/search?query=${encodeURIComponent(query)}&user_id=${userId}&limit=${limit}`
    )

    if (!response.ok) throw new Error('Failed to search memories')

    const data = await response.json()
    return data.memories
  },

  async createMemory(
    content: string,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<any> {
    const response = await fetch(`${API_URL}/api/memory/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, user_id: userId, metadata })
    })

    if (!response.ok) throw new Error('Failed to create memory')
    return response.json()
  },

  async deleteMemory(memoryId: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/api/memory/${memoryId}`, {
      method: 'DELETE'
    })

    if (!response.ok) throw new Error('Failed to delete memory')

    const data = await response.json()
    return data.success
  }
}
```

### 2.3 チャットインターフェース

**frontend/app/chat/page.tsx**
```tsx
'use client'

import { useState } from 'react'
import { api, ChatMessage } from '@/lib/api'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const userId = 'default_user' // 後で認証実装

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await api.sendMessage(input, userId, true)

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      alert('メッセージ送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold">PersonalOS チャット</h1>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2">
              考え中...
            </div>
          </div>
        )}
      </div>

      {/* 入力エリア */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 2.4 記憶一覧ページ

**frontend/app/memories/page.tsx**
```tsx
'use client'

import { useEffect, useState } from 'react'
import { api, Memory } from '@/lib/api'

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const userId = 'default_user'

  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = async () => {
    try {
      const data = await api.getAllMemories(userId)
      setMemories(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (memoryId: string) => {
    if (!confirm('この記憶を削除しますか？')) return

    try {
      await api.deleteMemory(memoryId)
      setMemories(prev => prev.filter(m => m.id !== memoryId))
    } catch (error) {
      console.error('Error:', error)
      alert('削除に失敗しました')
    }
  }

  if (loading) {
    return <div className="p-8">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">記憶一覧</h1>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <p className="text-gray-600">
              総記憶数: <span className="font-bold">{memories.length}</span>
            </p>
          </div>

          <div className="divide-y">
            {memories.map((memory) => (
              <div key={memory.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-800 mb-2">{memory.memory}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{new Date(memory.created_at).toLocaleString('ja-JP')}</span>
                      {memory.metadata?.category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {memory.metadata.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(memory.id)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {memories.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              記憶がまだありません。チャットを始めてみましょう！
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Phase 3: 統合とテスト（1-2日）

### 3.1 Docker起動

```bash
# Qdrantを起動
docker-compose up -d qdrant

# バックエンド起動
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# フロントエンド起動（別ターミナル）
cd frontend
npm install
npm run dev
```

### 3.2 E2Eテスト

**手動テストシナリオ**

1. ブラウザで http://localhost:3000 を開く
2. 「チャットを始める」をクリック
3. 「私は哲学と歴史が好きです」と入力
4. AIの応答を確認
5. 「私に合う本を推薦して」と入力
6. 過去の記憶を活用した応答が返ることを確認
7. 「記憶を見る」ページで記憶が保存されていることを確認

### 3.3 自動テスト

**backend/tests/test_api.py**
```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_create_memory():
    response = client.post(
        "/api/memory/",
        json={
            "content": "テスト記憶",
            "user_id": "test_user",
            "metadata": {"category": "test"}
        }
    )
    assert response.status_code == 200

def test_chat():
    response = client.post(
        "/api/chat/message",
        json={
            "message": "こんにちは",
            "user_id": "test_user",
            "use_memory": True
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
```

**実行**
```bash
cd backend
pytest tests/ -v
```

---

## 📋 実装チェックリスト

### Phase 0: 環境セットアップ ✓
- [ ] プロジェクト構造作成
- [ ] 依存関係インストール（backend）
- [ ] 依存関係インストール（frontend）
- [ ] Docker設定
- [ ] 環境変数設定

### Phase 1: バックエンド基礎 ✓
- [ ] FastAPI基礎セットアップ
- [ ] memU統合サービス実装
- [ ] チャットAPI実装
- [ ] メモリ管理API実装
- [ ] APIテスト

### Phase 2: フロントエンド基礎 ✓
- [ ] Next.jsセットアップ
- [ ] APIクライアント実装
- [ ] チャットインターフェース実装
- [ ] 記憶一覧ページ実装
- [ ] UIテスト

### Phase 3: 統合とテスト ✓
- [ ] Docker統合テスト
- [ ] E2Eテスト（手動）
- [ ] 自動テスト実装
- [ ] バグ修正

---

## 🚀 次のステップ（Phase 4以降）

### Phase 4: 高度な機能
- [ ] 記憶グラフ可視化
- [ ] タイムライン表示
- [ ] プロアクティブ提案
- [ ] 記憶のライフサイクル管理

### Phase 5: プロダクション準備
- [ ] 認証・認可
- [ ] パフォーマンス最適化
- [ ] セキュリティ強化
- [ ] デプロイ設定

---

**最終更新**: 2026-02-06
**ステータス**: 実装準備完了 → Phase 0から開始
