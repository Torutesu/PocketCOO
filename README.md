# PocketCOO

<div align="center">

**AIワークスペース（`/space`）と長期記憶で、あなた専用に育つ相棒**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-ff4d4f.svg)](https://qdrant.tech/)
[![MemU](https://img.shields.io/badge/MemU-Agentic_Memory-2ea44f.svg)](https://memu.bot/)

[📖 Product Spec](./PRODUCT_SPEC.md) | [📖 製品仕様(JP)](./PRODUCT_SPEC_JP.md) | [🏗 Technical Design](./TECHNICAL_DESIGN.md)

</div>

---

## これは何？

PocketCOOは、**長期記憶によるパーソナライズ**に力を入れたAIワークスペースのプロトタイプです。
会話・メモなどを「記憶」として蓄積し、必要なタイミングで検索して提示することで、使うほど「いつもの自分」に寄っていく体験を目指します。

このプロジェクトは特に **MemU**（https://memu.bot/）をベースに、記憶の抽出・保存・検索（セマンティック検索）を組み込み、長期記憶をプロダクト体験の中心に据えています。

---

## できること（現状）

- `/space` に集約されたUI（デスクトップは3ペイン、モバイルは下部タブ）
- Chat（会話）
- Memories（記憶の一覧・検索）
- Memory Map（D3によるナレッジグラフ可視化のプロトタイプ）
- Remotionによるデモ動画レンダリング（`frontend/remotion/`）

---

## 使っているもの

### Backend

- FastAPI + Uvicorn
- MemU連携（MemU API: `https://api.memu.so` / サイト: https://memu.bot/）
- `mem0ai`（メモリ管理の基盤）
- Qdrant（ベクトルDB）
- SQLAlchemy + Alembic（DB）
- SQLite（デフォルト。`DATABASE_URL`で切替可）

### Frontend

- Next.js 14 / React 18
- Tailwind CSS
- TanStack Query（`@tanstack/react-query`）
- Axios
- D3（Memory Map）
- Remotion（動画）

---

## クイックスタート（Docker）

```bash
cp .env.example .env
docker-compose up -d
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000/api/health`
- Qdrant: `http://localhost:6333`

---

## ローカル開発

```bash
cp .env.example .env

./scripts/start_backend.sh
./scripts/start_frontend.sh
```

`API_KEY` を設定した場合、バックエンドは `x-api-key` ヘッダーを要求します。

---

## MemU（長期記憶）について

このプロジェクトは、長期記憶を「単なるログ保存」ではなく **パーソナライズの源泉**として扱います。

- 会話をMemUに送って記憶化（抽出・要約・整理）
- ユーザーの文脈に合わせて記憶を検索し、応答や画面体験に反映

設定は `.env` の `MEMUU_API_KEY`（または `MEMU_API_KEY`）で有効化します（例は [.env.example](./.env.example) 参照）。

---

## 構成

```
.
├── backend/               # FastAPI
├── frontend/              # Next.js
├── scripts/               # 起動スクリプト
├── docker-compose.yml     # backend + frontend + qdrant
├── .env.example
└── docs (md)
```
