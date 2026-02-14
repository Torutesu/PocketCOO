# Pocket COO

<div align="center">

**Your “growing digital twin AI” powered by long-term memory**

_JP:_ **memUの長期記憶で“育つ分身AI”をつくる**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-ff4d4f.svg)](https://qdrant.tech/)
[![MemU](https://img.shields.io/badge/MemU-Agentic_Memory-2ea44f.svg)](https://memu.bot/)

[📖 Product Spec](./PRODUCT_SPEC.md) | [📖 製品仕様(JP)](./PRODUCT_SPEC_JP.md) | [🏗 Technical Design](./TECHNICAL_DESIGN.md)

</div>

---

## Demo Video (挙動デモ)

[![Pocket COO Demo Video](./docs/assets/pocket-coo-demo-video.svg)](https://drive.google.com/file/d/1f1PaQnXfY-4sWWEhExa4mODIpIGbSlKK/view?usp=sharing)

- Google Drive: https://drive.google.com/file/d/1f1PaQnXfY-4sWWEhExa4mODIpIGbSlKK/view?usp=sharing
- Notes: GitHub上では埋め込み再生できないため、リンク先で再生してください
- Details: [docs/demo-video.md](./docs/demo-video.md)

## Project Title

Pocket COO

_JP:_ Pocket COO

---

## Project Summary

Pocket COO is a “growing digital twin AI.” By leveraging **MemU** (https://memu.bot/) as the foundation for long-term memory, Pocket COO remembers user conversations in a 3-layer memory model (**Identity / Project / Episode**). As you use it, it learns your style, preferences, and ongoing work—ultimately enabling a dedicated AI assistant that understands everything with a single phrase like “do it the usual way.”

Pocket COO also aims to let a solo founder orchestrate an “AI squad,” building a high-output, lean team that can compete at unicorn scale.

_JP:_ Pocket COOは「育つ分身AI」です。memU（https://memu.bot/）の記憶機能を活用し、ユーザーとの会話を3層構造（Identity/Project/Episode）で記憶。使うほどユーザーのスタイル・好み・進行中の仕事を学習し、最終的には「いつもの感じで」の一言で全てを理解する、あなた専属のAIアシスタントを実現します。一人でAI軍団を指揮し、少数精鋭でユニコーンを築くことができます。

---

## Problem Being Solved

AI is incredibly useful today, but it still hasn’t achieved true mass adoption. What’s missing is a killer use case and a UI that feels effortless. Concretely:

### Re-explaining cost every time

Each time you delegate work to an AI, you must restate your background, goals, and preferences from scratch. “Continuing what we discussed last week” doesn’t work, so you repeat the same preface again and again—until it feels faster to just do it yourself.

### Context fragmentation

You ask on Monday: “Write a proposal for Client A.” You ask on Wednesday: “How’s that proposal going?” The AI can’t track continuity, so you can only delegate fragmented, one-off tasks.

### Lack of personalization

“Use bullet points.” “Start with the conclusion.” “Use a casual tone.” You keep repeating the same instructions. The AI doesn’t learn. Even after 100 uses, it responds like the first time—generic and impersonal.

### Can’t do deep work

AI excels at single-shot tasks (summarization, translation, search) but struggles with sustained work (business planning, long-running project management). It can’t reason with “company policy,” “project history,” or “past decisions.”

### No relationship / trust

Humans build mutual understanding over time. With most AIs, the relationship never deepens—useful as a tool, but never a true partner.

### What this causes

- AI usage stays limited to one-off tasks
- The complex work you actually want to delegate remains on you
- People conclude “AI is not useful”
- Significant productivity gains are left on the table

### Root cause

All of these problems share the same root cause: **AI has no durable long-term memory.**

_JP:_ 現状AIは非常に便利だが本当の意味でマスアダプションしていない。キラーユースケースや、非常に簡単なUIが必要である。
毎回ゼロからの説明コスト / 文脈の断絶 / パーソナライズの欠如 / 深い仕事ができない / 信頼関係が築けない。
結果としてAIの利用が単発タスクに限定され、本当に任せたい複雑な仕事は結局自分でやる、「AIは使えない」という諦め、生産性向上の機会損失が起きている。根本原因は一つ：AIに「記憶・長期記憶」がないこと。

---

## Key Idea: 3-Layer Memory

- **Identity**: stable user traits (tone, format preference, decision principles)
- **Project**: ongoing goals, constraints, stakeholders, artifacts
- **Episode**: specific events and short-lived details

Pocket COO uses MemU (https://memu.bot/) to turn conversations into durable memory and retrieve the right context at the right time.

_JP:_ Identity/Project/Episode の3層で記憶し、必要な文脈を呼び出す。

---

## What’s in this repo (current)

- A unified UI centered on `/space` (desktop: 3 panes, mobile: bottom tabs)
- Chat
- Memories (list + semantic search)
- Memory Map (knowledge graph prototype using D3)
- Remotion demo video rendering (`frontend/remotion/`)

_JP:_ `/space` 集約のUI、チャット、記憶一覧・検索、D3のナレッジグラフ、Remotionデモ動画。

---

## Tech Stack

### Backend

- FastAPI + Uvicorn
- MemU integration (MemU API: `https://api.memu.so` / website: https://memu.bot/)
- `mem0ai`
- Qdrant
- SQLAlchemy + Alembic
- SQLite (default, configurable via `DATABASE_URL`)

### Frontend

- Next.js 14 / React 18
- Tailwind CSS
- TanStack Query (`@tanstack/react-query`)
- Axios
- D3
- Remotion

---

## Quick Start (Docker)

```bash
cp .env.example .env
docker-compose up -d
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000/api/health`
- Qdrant: `http://localhost:6333`

_JP:_ Docker起動は上記2コマンドでOK。

---

## Local Development

```bash
cp .env.example .env

./scripts/start_backend.sh
./scripts/start_frontend.sh
```

If you set `API_KEY`, the backend requires the `x-api-key` header.

_JP:_ `API_KEY` を設定した場合、バックエンドは `x-api-key` ヘッダーを要求します。

---

## Production Deployment

🆓 **完全無料で本番環境にデプロイ可能！**

📘 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 完全無料デプロイガイド

無料構成：
- **Frontend**: Vercel Hobby（無料）
- **Backend**: Render Free（無料）
- **Vector DB**: Qdrant Cloud Free 1GB（無料）
- **Database**: SQLite（無料）
- **Total Cost**: **$0/月** 🎉

⚠️ 制限事項：
- バックエンドは15分間非アクティブでスリープ（最初のリクエストが遅い）
- 個人プロジェクト向け

_JP:_ 詳細なデプロイ手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

---

## Repository Structure

```
.
├── backend/               # FastAPI
├── frontend/              # Next.js
├── scripts/               # local run scripts
├── docker-compose.yml     # backend + frontend + qdrant
├── render.yaml            # Render deployment config
├── vercel.json            # Vercel deployment config
├── .env.example
├── .env.production.example
├── DEPLOYMENT.md          # Production deployment guide
└── docs (md)
```
