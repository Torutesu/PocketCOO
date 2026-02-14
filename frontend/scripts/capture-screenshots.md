# スクリーンショット撮影ガイド

このガイドに従って、プロダクトデモ動画に使用するスクリーンショットを撮影してください。

## 準備

1. アプリを起動
```bash
cd /Users/torutano/personalos/PocketCOO
./scripts/start_frontend.sh
```

2. ブラウザで http://localhost:3000/space を開く

## 撮影するスクリーンショット

### 1. チャット画面（ユースケースシーン用）

**URL**: http://localhost:3000/space?tab=chat

**撮影手順**:
1. チャットタブを開く
2. 「この新プロダクトのPRDを10分で叩き台にして」と入力して送信
3. AIの返答を待つ
4. ブラウザのデベロッパーツール（F12）を開く
5. デバイスツールバー（Cmd+Shift+M / Ctrl+Shift+M）で解像度を設定：
   - 幅: 1400px
   - 高さ: 900px
6. スクリーンショットを撮影（Cmd+Shift+5 on Mac）
7. 保存先: `frontend/public/screenshots/chat-usecase.png`

### 2. Memory Map（ナレッジグラフシーン用）

**URL**: http://localhost:3000/space?tab=map

**撮影手順**:
1. Mapタブを開く
2. ナレッジグラフが表示されるまで待つ
3. 解像度: 1200x800
4. 保存先: `frontend/public/screenshots/memory-map.png`

### 3. メモリーペイン（成長シーン用）

**URL**: http://localhost:3000/space?tab=memory

**撮影手順**:
1. Memoryタブを開く
2. プロフィールと分身スコアが表示される
3. 解像度: 1000x900
4. 保存先: `frontend/public/screenshots/memory-profile.png`

### 4. 3ペインレイアウト全体（オプション）

**URL**: http://localhost:3000/space

**撮影手順**:
1. デスクトップビュー（幅 > 1024px）
2. 3つのペインすべてが表示される
3. 解像度: 1920x1080
4. 保存先: `frontend/public/screenshots/full-layout.png`

## クイック撮影方法（Chromeの場合）

```bash
# Chrome DevTools でスクリーンショットを撮る
# 1. Cmd+Option+I (Mac) / F12 (Windows) でDevToolsを開く
# 2. Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows) でコマンドパレットを開く
# 3. "screenshot" と入力
# 4. "Capture full size screenshot" を選択
```

## 最終的なファイル構成

```
frontend/public/screenshots/
├── chat-usecase.png       # ユースケースシーン用
├── memory-map.png         # Memory Mapシーン用
├── memory-profile.png     # 成長シーン用
└── full-layout.png        # (オプション) 全体レイアウト
```

## 次のステップ

スクリーンショットを撮影したら、以下のコマンドでプレビューを確認：

```bash
npm run remotion:preview
```

コンポジション `PocketCOOFounderDemoWithUI_JA` または `PocketCOOFounderDemoWithUI_EN` を選択してください。
