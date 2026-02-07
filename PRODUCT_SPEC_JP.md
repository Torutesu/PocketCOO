# PersonalOS - 製品仕様書

## 🎯 プロダクトビジョン

**PersonalOSは、あなたの全てを記憶し理解するAI駆動の第二の脳です**

デジタルライフ全体を統合し、すべての情報を即座にアクセス可能にする統合記憶システムです。

### ミッション
全てを覚えておく認知的負担を排除し、人間が創造的・戦略的思考に集中できるようにする。

---

## 🔧 MemU統合アーキテクチャ

### MemUとは
[MemU](https://memu.bot/) は、LLM/AI Agent向けの長期記憶レイヤーです。対話などの入力から「記憶」を抽出し、構造化・検索（セマンティック検索）できる形で蓄積します。

本プロジェクトでは、実装として `mem0ai` を利用しつつ、必要に応じて MemU Cloud API（`https://api.memu.so`）に接続して記憶化・検索を行います。

### PersonalOSでのMemU活用

```python
from mem0 import Memory

# memU初期化
config = {
    "vector_store": {
        "provider": "qdrant",
        "config": {
            "host": "localhost",
            "port": 6333,
            "collection_name": "personalos_memories"
        }
    },
    "llm": {
        "provider": "openai",
        "config": {
            "model": "gpt-4o-mini",
            "temperature": 0.7
        }
    },
    "embedder": {
        "provider": "openai",
        "config": {
            "model": "text-embedding-3-small"
        }
    },
    "version": "v1.1"
}

memory = Memory.from_config(config)
```

### memUの階層的ファイルシステムを活用

```
/personalos_memory          # ルートディレクトリ
  /users
    /{user_id}
      /active              # アクティブメモリ（過去7日間）
        /conversations     # 会話履歴
        /actions          # 実行したアクション
        /quick_notes      # クイックメモ

      /working            # ワーキングメモリ（進行中プロジェクト）
        /projects         # プロジェクト情報
          /{project_name}
            /context.md   # プロジェクトコンテキスト
            /tasks.md     # タスク一覧
            /decisions.md # 意思決定記録
        /ongoing_tasks    # 進行中タスク
        /learning_topics  # 学習中のトピック

      /reference          # リファレンスメモリ（頻繁にアクセス）
        /user_preferences # ユーザー設定
          /general.md     # 一般的な好み
          /work.md        # 仕事関連の好み
          /personal.md    # 個人的な好み
        /common_patterns  # よく使うパターン
        /important_facts  # 重要な事実

      /archive            # アーカイブ（コールドストレージ）
        /completed_projects
        /old_conversations
        /historical_data

      /graph              # ナレッジグラフメタデータ
        /relationships.json  # 記憶間の関係性
        /clusters.json       # 記憶のクラスター情報
```

---

## 🆚 競合分析：Pickle OS との比較

| 機能 | PersonalOS | Pickle OS | 優位性 |
|------|-----------|-----------|--------|
| **記憶の深さ** | 無制限 + エクスポート | 6年間 | ✅ 保存期限なし |
| **記憶構造** | 階層 + グラフ | フラットクラスター | ✅ セマンティック関係性 |
| **可視化** | インタラクティブグラフ、タイムライン | 基本的なUI | ✅ より深い洞察 |
| **統合** | カレンダー、メール、ブラウザ、GitHub、Notion等 | アプリ、ファイル、デバイス | ✅ より多くのソース |
| **プロアクティブAI** | 先回り提案 | リアクティブのみ | ✅ ニーズを予測 |
| **プライバシー** | TEE + ローカルLLMオプション | TEE暗号化 | ✅ 完全オフライン可能 |
| **記憶共有** | 選択的共有 | チームのみ | ✅ 柔軟なコラボレーション |
| **カスタマイズ** | AIペルソナカスタマイズ | 固定パーソナリティ | ✅ パーソナライズされたAI |
| **記憶エクスポート** | Markdown、JSON、PDF | 記載なし | ✅ データポータビリティ |
| **プラグインシステム** | オープンアーキテクチャ | クローズド | ✅ コミュニティ拡張性 |
| **価格** | オープンソースコア | プロプライエタリ | ✅ 透明性と無料 |

---

## 🎨 コア機能

### 1. **memUベースの高度な記憶システム**

#### 1.1 階層的メモリアーキテクチャ

memUのファイルシステム型管理を活用：

```python
# 記憶の追加（memU自動処理）
memory.add(
    messages=[
        {"role": "user", "content": "私は哲学と歴史が大好きです"},
        {"role": "assistant", "content": "素晴らしいですね！..."}
    ],
    user_id="user_123",
    metadata={
        "layer": "active",
        "category": "preferences",
        "importance": 0.8
    }
)

# memUが自動的に以下を実行：
# 1. エンティティ抽出（"哲学"、"歴史"）
# 2. 構造化保存（/active/conversations/2024-02-06.md）
# 3. ベクトル埋め込み生成
# 4. 関連する既存記憶との関連付け
```

#### 1.2 記憶のライフサイクル管理

```python
class MemoryLifecycleManager:
    def __init__(self, memory: Memory):
        self.memory = memory

    async def promote_memory(self, memory_id: str):
        """アクセス頻度に基づいて記憶を上位層に昇格"""
        mem = await self.memory.get(memory_id)

        # アクセスカウントをチェック
        if mem.metadata.get("access_count", 0) > 10:
            # active → working へ移動
            if mem.metadata.get("layer") == "active":
                await self._move_to_layer(mem, "working")

        # 重要度スコアをチェック
        if mem.metadata.get("importance", 0) > 0.9:
            # working → reference へ移動
            if mem.metadata.get("layer") == "working":
                await self._move_to_layer(mem, "reference")

    async def demote_memory(self, memory_id: str):
        """長期間アクセスされていない記憶を下位層に降格"""
        mem = await self.memory.get(memory_id)
        days_since_access = (datetime.now() - mem.last_accessed).days

        if days_since_access > 30 and mem.metadata.get("layer") == "working":
            await self._move_to_layer(mem, "archive")

    async def _move_to_layer(self, memory, new_layer: str):
        """記憶を別の層に移動"""
        self.memory.update(
            memory_id=memory.id,
            data={
                "metadata": {
                    **memory.metadata,
                    "layer": new_layer,
                    "moved_at": datetime.now().isoformat()
                }
            }
        )
```

#### 1.3 記憶グラフ構築（memUのGraph機能活用）

```python
# memUのグラフ検索機能を使用
results = memory.search(
    query="哲学に関する私の興味",
    user_id="user_123",
    limit=10
)

# 関連する記憶を自動的に取得
# memUが意味的類似性に基づいて関連記憶を返す
for result in results:
    print(f"記憶: {result['memory']}")
    print(f"関連度: {result['score']}")
```

---

### 2. **マルチソース統合（memUのマルチモーダル対応）**

memUはテキスト、画像、ドキュメントなど複数の形式に対応：

```python
# テキスト記憶
memory.add(
    "今日のミーティングで新機能について議論した",
    user_id="user_123"
)

# 画像記憶（OCR + 画像理解）
memory.add(
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "このホワイトボードの内容を記憶して"},
            {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,..."}}
        ]
    }],
    user_id="user_123"
)

# ドキュメント記憶
with open("project_spec.pdf", "rb") as f:
    memory.add(
        messages=[{
            "role": "user",
            "content": f"このプロジェクト仕様書を記憶: {f.read()}"
        }],
        user_id="user_123",
        metadata={"source": "document", "type": "pdf"}
    )
```

#### 統合ソース一覧

| ソース | 取得データ | ユースケース | memU統合方法 |
|--------|-----------|------------|------------|
| **チャット** | 全会話 | 将来の会話の文脈 | `memory.add(messages=...)` |
| **カレンダー** | イベント、会議 | 「あの会議で何を話した？」 | イベント内容をテキストとして保存 |
| **メール** | 重要なメール | 「あの契約メールどこ？」 | メール本文 + メタデータ保存 |
| **ブラウザ** | 訪問ページ、ブックマーク | 「先月読んだ記事」 | ページタイトル + 要約保存 |
| **ファイル** | ドキュメント、PDF | 「あのリサーチペーパー」 | `memory.add()`でドキュメント全文 |
| **GitHub** | コミット、PR、Issue | 「いつそのバグ修正した？」 | コミットメッセージ + diff要約 |
| **Notion** | ノート、データベース | 「Q1のプロジェクトノート」 | ページ内容をMarkdownで保存 |
| **Slack** | 仕事の会話 | 「チームの決定事項」 | スレッド単位で保存 |
| **Twitter** | 保存ツイート、スレッド | 「あのAIのスレッド」 | ツイート内容 + メタデータ |
| **写真** | 画像メタデータ、OCR | 「あの旅行の写真」 | 画像 + OCRテキスト |

---

### 3. **プロアクティブAIアシスタント**

memUの検索機能を活用して先回り提案：

```python
class ProactiveAssistant:
    def __init__(self, memory: Memory):
        self.memory = memory

    async def morning_briefing(self, user_id: str) -> str:
        """朝のブリーフィングを生成"""

        # 今日の予定を検索
        today_events = self.memory.search(
            query="今日の予定 カレンダー",
            user_id=user_id,
            filters={"source": "calendar", "date": "today"}
        )

        # 未完了タスクを検索
        pending_tasks = self.memory.search(
            query="TODO 未完了 タスク",
            user_id=user_id,
            filters={"status": "pending"}
        )

        # フォローアップが必要な項目を検索
        follow_ups = self.memory.search(
            query="フォローアップ リマインダー",
            user_id=user_id,
            filters={"requires_followup": True}
        )

        # LLMでブリーフィング生成
        briefing = f"""
おはようございます！今日の情報です：

📅 本日の予定：
{self._format_events(today_events)}

📝 フォローアップ：
{self._format_tasks(pending_tasks)}

💡 提案：
{self._generate_suggestions(today_events, pending_tasks)}
"""
        return briefing

    async def context_aware_suggestions(
        self,
        user_id: str,
        current_context: str
    ) -> List[str]:
        """現在のコンテキストに基づいた提案"""

        # 現在のコンテキストに関連する記憶を検索
        related_memories = self.memory.search(
            query=current_context,
            user_id=user_id,
            limit=5
        )

        suggestions = []

        # 関連タスクを提案
        for mem in related_memories:
            if "task" in mem.get("metadata", {}).get("type", ""):
                suggestions.append(
                    f"関連タスク: {mem['memory']}"
                )

        return suggestions
```

---

### 4. **記憶の可視化**

#### 4.1 記憶グラフビュー

memUのデータを使ってインタラクティブなグラフを生成：

```python
async def build_memory_graph(user_id: str) -> Dict:
    """記憶グラフデータを構築"""

    # 全記憶を取得
    all_memories = memory.get_all(user_id=user_id)

    nodes = []
    edges = []

    for mem in all_memories:
        # ノード作成
        nodes.append({
            "id": mem["id"],
            "label": mem["memory"][:50],
            "category": mem["metadata"].get("category", "other"),
            "layer": mem["metadata"].get("layer", "active"),
            "importance": mem["metadata"].get("importance", 0.5)
        })

        # エッジ作成（関連記憶）
        related = memory.search(
            query=mem["memory"],
            user_id=user_id,
            limit=3
        )

        for rel in related:
            if rel["id"] != mem["id"]:
                edges.append({
                    "source": mem["id"],
                    "target": rel["id"],
                    "weight": rel["score"]  # 類似度スコア
                })

    return {"nodes": nodes, "edges": edges}
```

#### 4.2 タイムラインビュー

```python
async def build_timeline(user_id: str, start_date: str, end_date: str):
    """記憶のタイムラインを構築"""

    # 期間内の記憶を取得
    memories = memory.get_all(user_id=user_id)

    # 日付でグループ化
    timeline = defaultdict(list)

    for mem in memories:
        created = mem["created_at"]
        if start_date <= created <= end_date:
            date_key = created.split("T")[0]  # YYYY-MM-DD
            timeline[date_key].append({
                "time": created.split("T")[1],
                "content": mem["memory"],
                "category": mem["metadata"].get("category")
            })

    return dict(timeline)
```

#### 4.3 記憶ヒートマップ

```python
async def build_heatmap(user_id: str):
    """カテゴリ別記憶分布"""

    all_memories = memory.get_all(user_id=user_id)

    categories = defaultdict(int)
    for mem in all_memories:
        cat = mem["metadata"].get("category", "その他")
        categories[cat] += 1

    return dict(categories)
```

---

### 5. **高度な検索（memU検索エンジン活用）**

#### 5.1 自然言語検索

```python
# memUのセマンティック検索
results = memory.search(
    query="API設計について議論したミーティング",
    user_id="user_123",
    limit=10
)

# memUが自動的に：
# 1. クエリをベクトル化
# 2. 意味的に類似した記憶を検索
# 3. 関連度スコア付きで返却
```

#### 5.2 フィルタ付き検索

```python
# 特定の期間、ソース、カテゴリでフィルタ
results = memory.search(
    query="プロジェクト進捗",
    user_id="user_123",
    filters={
        "date_range": {
            "start": "2024-01-01",
            "end": "2024-03-31"
        },
        "source": "slack",
        "category": "work"
    },
    limit=20
)
```

#### 5.3 マルチホップ推論

```python
async def multi_hop_search(query: str, user_id: str, depth: int = 2):
    """複数段階の推論検索"""

    visited = set()
    current_queries = [query]
    all_results = []

    for _ in range(depth):
        next_queries = []

        for q in current_queries:
            results = memory.search(
                query=q,
                user_id=user_id,
                limit=5
            )

            for result in results:
                if result["id"] not in visited:
                    visited.add(result["id"])
                    all_results.append(result)

                    # 次の検索クエリとして使用
                    next_queries.append(result["memory"])

        current_queries = next_queries

    return all_results

# 例：「哲学」→「ニーチェ」→「ツァラトゥストラ」と辿る
```

---

### 6. **プライバシーとセキュリティ**

#### 6.1 3層セキュリティ

**Tier 1: フルクラウド**
```python
config = {
    "vector_store": {
        "provider": "qdrant_cloud",  # クラウドホスト
        "config": {
            "url": "https://xyz.qdrant.io",
            "api_key": os.getenv("QDRANT_API_KEY")
        }
    }
}
```

**Tier 2: ハイブリッド**
```python
# 機密データはローカル、その他はクラウド
if is_sensitive(data):
    # ローカルストレージ
    local_memory.add(data)
else:
    # クラウドストレージ
    cloud_memory.add(data)
```

**Tier 3: 完全ローカル**
```python
config = {
    "vector_store": {
        "provider": "qdrant",
        "config": {
            "host": "localhost",  # ローカルホスト
            "port": 6333
        }
    },
    "llm": {
        "provider": "ollama",  # ローカルLLM
        "config": {
            "model": "llama3",
            "api_base": "http://localhost:11434"
        }
    }
}

# 完全オフライン動作可能
```

#### 6.2 暗号化

```python
from cryptography.fernet import Fernet

class EncryptedMemoryWrapper:
    def __init__(self, memory: Memory, encryption_key: str):
        self.memory = memory
        self.cipher = Fernet(encryption_key.encode())

    def add_encrypted(self, content: str, user_id: str, **kwargs):
        """暗号化して保存"""
        encrypted_content = self.cipher.encrypt(content.encode()).decode()

        return self.memory.add(
            encrypted_content,
            user_id=user_id,
            metadata={**kwargs.get("metadata", {}), "encrypted": True}
        )

    def search_encrypted(self, query: str, user_id: str):
        """復号化して検索"""
        # クエリを暗号化
        encrypted_query = self.cipher.encrypt(query.encode()).decode()

        results = self.memory.search(
            query=encrypted_query,
            user_id=user_id
        )

        # 結果を復号化
        for result in results:
            if result.get("metadata", {}).get("encrypted"):
                result["memory"] = self.cipher.decrypt(
                    result["memory"].encode()
                ).decode()

        return results
```

---

### 7. **記憶の共有とコラボレーション**

```python
# 記憶を選択的に共有
memory.add(
    "プロジェクトXの設計議論",
    user_id="user_123",
    metadata={
        "shared_with": ["user_456", "user_789"],
        "permissions": {
            "user_456": "edit",
            "user_789": "view"
        }
    }
)

# 共有記憶を検索
shared_memories = memory.search(
    query="プロジェクト設計",
    user_id="user_123",
    filters={"shared": True}
)
```

---

### 8. **AIペルソナカスタマイズ**

```python
class AIPersona:
    def __init__(self, name: str, traits: Dict):
        self.name = name
        self.formality = traits.get("formality", 5)      # 1-10
        self.verbosity = traits.get("verbosity", 5)      # 1-10
        self.humor = traits.get("humor", 5)              # 1-10
        self.proactivity = traits.get("proactivity", 5)  # 1-10

    def build_system_prompt(self, context: str) -> str:
        """ペルソナに基づいたシステムプロンプト"""

        formality_text = {
            range(1, 4): "カジュアルでフレンドリーに話してください",
            range(4, 7): "バランスの取れた話し方をしてください",
            range(7, 11): "フォーマルでプロフェッショナルに話してください"
        }

        verbosity_text = {
            range(1, 4): "簡潔に、要点のみ",
            range(4, 7): "適度な詳しさで",
            range(7, 11): "詳細な説明を含めて"
        }

        humor_level = "時々ユーモアを交えて" if self.humor > 5 else ""

        prompt = f"""あなたは{self.name}です。

話し方：
- {self._get_range_value(formality_text, self.formality)}
- {self._get_range_value(verbosity_text, self.verbosity)}
- {humor_level}

関連する記憶：
{context}

ユーザーのことを深く理解し、個別化された応答を提供してください。
"""
        return prompt

    def _get_range_value(self, mapping: Dict, value: int) -> str:
        for range_obj, text in mapping.items():
            if value in range_obj:
                return text
        return ""

# 使用例
alfred = AIPersona("Alfred", {
    "formality": 8,
    "verbosity": 3,
    "humor": 6,
    "proactivity": 9
})
```

---

### 9. **記憶のエクスポート**

```python
class MemoryExporter:
    def __init__(self, memory: Memory):
        self.memory = memory

    async def export_markdown(self, user_id: str, output_path: str):
        """Markdown形式でエクスポート"""
        memories = self.memory.get_all(user_id=user_id)

        md_content = "# PersonalOS 記憶エクスポート\n\n"

        # 層ごとにグループ化
        by_layer = defaultdict(list)
        for mem in memories:
            layer = mem["metadata"].get("layer", "その他")
            by_layer[layer].append(mem)

        for layer, mems in by_layer.items():
            md_content += f"## {layer.capitalize()}\n\n"

            for mem in mems:
                md_content += f"### {mem['created_at']}\n"
                md_content += f"{mem['memory']}\n\n"
                md_content += f"**カテゴリ**: {mem['metadata'].get('category', 'なし')}\n"
                md_content += f"**ソース**: {mem['metadata'].get('source', 'なし')}\n\n"
                md_content += "---\n\n"

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(md_content)

    async def export_json(self, user_id: str, output_path: str):
        """JSON形式でエクスポート"""
        memories = self.memory.get_all(user_id=user_id)

        export_data = {
            "export_date": datetime.now().isoformat(),
            "user_id": user_id,
            "total_memories": len(memories),
            "memories": memories
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)
```

---

### 10. **プラグインシステム**

```python
from abc import ABC, abstractmethod

class PersonalOSPlugin(ABC):
    """PersonalOSプラグインベースクラス"""

    name: str
    version: str
    description: str

    def __init__(self, memory: Memory):
        self.memory = memory

    @abstractmethod
    async def on_memory_created(self, memory_data: Dict):
        """新しい記憶が作成されたときに呼ばれる"""
        pass

    @abstractmethod
    async def on_query(self, query: str, user_id: str) -> Optional[str]:
        """ユーザークエリ時に呼ばれる。処理した場合は応答を返す"""
        pass


# プラグイン例：天気トラッカー
class WeatherTrackerPlugin(PersonalOSPlugin):
    name = "Weather Tracker"
    version = "1.0.0"
    description = "各場所の天気を自動記録"

    async def on_memory_created(self, memory_data: Dict):
        """記憶に場所が含まれていたら天気を取得"""
        content = memory_data["memory"]

        # 場所を抽出（簡易版）
        location = self._extract_location(content)
        if location:
            weather = await self._fetch_weather(location)

            # 天気記憶を追加
            self.memory.add(
                f"{location}の天気: {weather}",
                user_id=memory_data["user_id"],
                metadata={
                    "category": "weather",
                    "location": location,
                    "plugin": "weather_tracker"
                }
            )

    async def on_query(self, query: str, user_id: str) -> Optional[str]:
        """天気関連のクエリに応答"""
        if "天気" in query:
            # 天気記憶を検索
            weather_memories = self.memory.search(
                query=query,
                user_id=user_id,
                filters={"category": "weather"}
            )

            if weather_memories:
                latest = weather_memories[0]
                return f"最新の天気情報: {latest['memory']}"

        return None

    def _extract_location(self, text: str) -> Optional[str]:
        # NLPで場所を抽出（実装省略）
        pass

    async def _fetch_weather(self, location: str) -> str:
        # 天気APIを呼び出し（実装省略）
        pass
```

---

## 📊 成功指標

### ユーザーエンゲージメント
- **DAU（デイリーアクティブユーザー）**: 登録ユーザーの70%+
- **ユーザーあたり記憶クエリ数**: 1日10回以上
- **セッション時間**: 平均15分以上

### 記憶品質
- **検索成功率**: 90%以上のユーザーが求める情報を見つける
- **記憶精度**: 95%以上の正確なコンテキスト取得
- **ユーザー修正**: 手動修正が必要な記憶は5%未満

### ビジネス指標
- **ユーザー定着率**: 30日後80%以上
- **紹介率**: 30%以上のユーザーが他者を招待
- **プレミアム転換率**: 10%以上が有料プランに転換（該当する場合）

---

## 🗺 開発ロードマップ

### Phase 1: MVP（4週間）
- [ ] memU統合（基本的な記憶保存・検索）
- [ ] シンプルなチャットインターフェース
- [ ] 記憶の手動入力
- [ ] リストビューの可視化

### Phase 2: 統合機能（4週間）
- [ ] カレンダー統合
- [ ] メール統合
- [ ] ブラウザ拡張機能
- [ ] ファイルアップロード

### Phase 3: インテリジェンス（4週間）
- [ ] プロアクティブ提案
- [ ] 記憶グラフ可視化
- [ ] 高度な検索
- [ ] AIペルソナカスタマイズ

### Phase 4: コラボレーション（4週間）
- [ ] 記憶共有機能
- [ ] チームスペース
- [ ] コメント＆アノテーション

### Phase 5: プラットフォーム化（8週間）
- [ ] プラグインシステム
- [ ] プラグインマーケットプレイス
- [ ] モバイルアプリ（iOS/Android）
- [ ] 開発者向けAPI

---

## 💰 収益化戦略

### オープンソースコア
- 基本的な記憶システム
- セルフホストオプション
- コミュニティプラグイン

### プレミアム機能（オプション）
- 無制限記憶ストレージ
- 優先AI処理
- チームコラボレーション（5人以上）
- 高度な分析
- プレミアム統合（Salesforce等）
- ホワイトラベルオプション

**価格**: 月額1,000円 または 年額10,000円

---

**最終更新**: 2026-02-06
**ステータス**: 仕様完成 → 実装準備完了
