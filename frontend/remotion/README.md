# Pocket COO プロダクトデモ動画

Remotionを使用したプロダクトデモ動画の完全なコレクション。

## 📹 利用可能な動画バージョン

### 1. **高速版** (18秒) ⚡️
- `PocketCOOFounderDemoFast-JA` - 日本語
- `PocketCOOFounderDemoFast-EN` - 英語
- テンポ良く、アニメーション高速化
- SNS向け

### 2. **実UI統合版** (22秒) ⭐️ おすすめ
- `PocketCOOFounderDemoWithUI-JA` - 日本語
- `PocketCOOFounderDemoWithUI-EN` - 英語
- 実際のアプリUIのスクリーンショット統合
- デモ・営業・投資家向け

### 3. **オリジナル版** (30秒)
- `PocketCOOFounderDemo` - 日本語のみ
- 詳細な説明付き

---

## 🚀 クイックスタート

```bash
cd frontend

# プレビュー
npm run remotion:preview

# レンダリング
npm run remotion:render:fast-ja     # 高速版・日本語
npm run remotion:render:fast-en     # 高速版・英語
npm run remotion:render:ui-ja       # 実UI統合版・日本語
npm run remotion:render:ui-en       # 実UI統合版・英語
```

---

## 🖼️ 実UI統合版を使う場合

### 1. スクリーンショットを撮影

[scripts/capture-screenshots.md](../scripts/capture-screenshots.md) の手順に従ってスクリーンショットを撮影してください。

**必要なファイル**:
```
frontend/public/screenshots/
├── chat-usecase.png       # チャット画面
├── memory-map.png         # Memory Map
└── memory-profile.png     # メモリープロファイル
```

### 2. プレビュー＆レンダリング

```bash
npm run remotion:preview          # http://localhost:3001
npm run remotion:render:ui-ja     # 日本語版
npm run remotion:render:ui-en     # 英語版
```

---

## 📊 バージョン比較

| バージョン | 長さ | 言語 | 実UI | 用途 |
|-----------|------|------|------|------|
| 高速版 | 18秒 | 🇯🇵 🇬🇧 | ❌ | SNS |
| 実UI統合版 | 22秒 | 🇯🇵 🇬🇧 | ✅ | デモ |
| オリジナル | 30秒 | 🇯🇵 | ❌ | 詳細 |

---

## 🎬 シーン構成（実UI統合版）

1. フック (1.7秒) - 問題提起
2. 問題 (1.8秒) - 3つの課題
3. ソリューション (1.7秒) - Pocket COO
4. 3層記憶 (2.3秒) - Identity/Project/Episode
5. **ユースケース (3.7秒)** - 実際のチャットUI 💬
6. **Memory Map (3秒)** - 実際のナレッジグラフ 🗺️
7. **成長 (3秒)** - 実際のプロファイル 📊
8. ビジョン (2.5秒)
9. CTA (2.8秒)

---

**作成日**: 2026-02-08
