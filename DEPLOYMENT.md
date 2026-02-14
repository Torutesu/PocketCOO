# Pocket COO 完全無料デプロイガイド 🆓

このガイドでは、**完全無料**で本番環境にデプロイする方法を説明します。

## 💰 完全無料構成

- ✅ **Vercel** (フロントエンド) - Hobby plan: 無料
- ✅ **Render** (バックエンド) - Free plan: 無料
- ✅ **Qdrant Cloud** (ベクトルDB) - Free tier: 1GB無料
- ✅ **SQLite** (データベース) - Renderの永続ディスク使用

**総コスト: $0/月** 🎉

### ⚠️ 無料プランの制限事項

1. **Render Free Tier**:
   - 15分間非アクティブだとサービスがスリープ
   - スリープから復帰時は最初のリクエストが遅い（30秒〜1分）
   - 月750時間まで無料（実質無制限）

2. **Qdrant Cloud Free**:
   - 1GBのストレージ
   - 小〜中規模のプロジェクトには十分

3. **Vercel Hobby**:
   - 商用利用不可（個人プロジェクトのみ）
   - 帯域幅: 100GB/月

---

## 📋 前提条件

- [ ] GitHubアカウント
- [ ] Vercelアカウント（https://vercel.com）
- [ ] Renderアカウント（https://render.com）
- [ ] Qdrant Cloudアカウント（https://cloud.qdrant.io）
- [ ] OpenAI API キー
- [ ] Anthropic API キー（オプション）
- [ ] MemU API キー

---

## 🔑 セキュリティキーの生成

デプロイ前に、以下のコマンドで安全なキーを生成してください：

```bash
# API_KEY / SECRET_KEY の生成
openssl rand -hex 32

# ENCRYPTION_KEY の生成（32バイト）
openssl rand -hex 32
```

生成したキーは安全な場所（パスワードマネージャーなど）に保存してください。

---

## 🚀 デプロイ手順

### ステップ 1: GitHubリポジトリの準備

1. プロジェクトをGitHubにプッシュ

```bash
# まだリポジトリを作成していない場合
git init
git add .
git commit -m "Initial commit"

# GitHubでリポジトリを作成後
git remote add origin https://github.com/YOUR_USERNAME/PocketCOO.git
git branch -M main
git push -u origin main
```

---

### ステップ 2: Qdrant Cloud のセットアップ（無料）

#### 2.1 Qdrant Cloudアカウント作成

1. https://cloud.qdrant.io にアクセス
2. **"Sign Up"** で無料アカウントを作成

#### 2.2 無料クラスターの作成

1. ダッシュボードで **"Create Cluster"** をクリック
2. **プラン**: "Free" を選択
3. **リージョン**: 最も近いリージョンを選択（例: us-east4）
4. **クラスター名**: `pocket-coo-cluster`
5. **"Create"** をクリック

#### 2.3 認証情報の取得

クラスターが作成されたら：

1. クラスターの詳細ページで **"API Key"** タブをクリック
2. **APIキー**をコピー（後で使用）
3. **クラスターURL**をコピー（例: `https://xxxxxxxx.gcp.cloud.qdrant.io`）

---

### ステップ 3: Render でバックエンドをデプロイ（無料）

#### 3.1 Renderにログイン

1. https://render.com にアクセス
2. GitHubアカウントでログイン

#### 3.2 Blueprint からデプロイ

1. ダッシュボードで **"New +"** → **"Blueprint"** をクリック
2. GitHubリポジトリを接続
3. リポジトリから `PocketCOO` を選択
4. `render.yaml` が自動的に検出されます
5. **プラン**: "Free" が選択されていることを確認
6. **"Apply"** をクリック

以下のサービスが自動的に作成されます：
- ✅ FastAPI バックエンド (`pocket-coo-backend`) - Free plan

#### 3.3 環境変数の設定

Blueprint デプロイ後、以下の環境変数を手動で設定する必要があります：

1. Renderダッシュボードで `pocket-coo-backend` サービスを選択
2. **"Environment"** タブをクリック
3. 以下の環境変数を追加：

| 変数名 | 値 | 備考 |
|--------|-----|------|
| `OPENAI_API_KEY` | あなたのOpenAI APIキー | 必須 |
| `ANTHROPIC_API_KEY` | あなたのAnthropic APIキー | オプション |
| `MEMUU_API_KEY` | あなたのMemU APIキー | 必須 |
| `API_KEY` | 生成したAPIキー | セキュアなランダム文字列 |
| `SECRET_KEY` | 生成したシークレットキー | セキュアなランダム文字列 |
| `ENCRYPTION_KEY` | 生成した暗号化キー | セキュアなランダム文字列 |
| `QDRANT_URL` | Qdrant CloudのクラスターURL | 例: `https://xxx.gcp.cloud.qdrant.io` |
| `QDRANT_API_KEY` | Qdrant CloudのAPIキー | ステップ2で取得 |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | 後で更新（ステップ4の後） |

4. **"Save Changes"** をクリック

#### 3.4 バックエンドURLの確認

デプロイが完了したら（5〜10分かかります）、バックエンドのURLを確認します：

```
https://pocket-coo-backend.onrender.com
```

このURLを後でVercelの環境変数に設定します。

⚠️ **注意**: 無料プランでは、最初のデプロイに時間がかかる場合があります。

---

### ステップ 4: Vercel でフロントエンドをデプロイ（無料）

#### 4.1 Vercelにログイン

1. https://vercel.com にアクセス
2. GitHubアカウントでログイン

#### 4.2 新規プロジェクトの作成

1. **"Add New..."** → **"Project"** をクリック
2. GitHubリポジトリから `PocketCOO` を選択
3. **"Import"** をクリック

#### 4.3 ビルド設定

以下のように設定します：

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `.next`（デフォルト）
- **Install Command**: `npm install`（デフォルト）

#### 4.4 環境変数の設定

以下の環境変数を追加：

| 変数名 | 値 |
|--------|-----|
| `NEXT_PUBLIC_API_URL` | RenderのバックエンドURL（例: `https://pocket-coo-backend.onrender.com`） |
| `NEXT_PUBLIC_API_KEY` | Renderで設定した `API_KEY` と同じ値 |

#### 4.5 デプロイ

**"Deploy"** ボタンをクリックしてデプロイを開始します。

数分後、デプロイが完了すると、フロントエンドのURLが表示されます：

```
https://your-app.vercel.app
```

---

### ステップ 5: CORS設定の更新

フロントエンドのデプロイが完了したら、バックエンドのCORS設定を更新します：

1. Renderダッシュボードで `pocket-coo-backend` サービスを選択
2. **"Environment"** タブをクリック
3. `CORS_ORIGINS` 環境変数を更新：

```
https://your-app.vercel.app
```

4. **"Save Changes"** をクリック
5. サービスが自動的に再デプロイされます（数分かかります）

---

### ステップ 6: 動作確認

1. フロントエンドURL（`https://your-app.vercel.app`）にアクセス

⚠️ **重要**: 初回アクセス時、バックエンドがスリープから復帰するため、30秒〜1分ほど待つ必要があります。

2. チャット機能が正常に動作するか確認
3. メモリ機能が正常に動作するか確認

#### ヘルスチェック

バックエンドのヘルスチェックエンドポイント：

```
https://pocket-coo-backend.onrender.com/api/health
```

ブラウザまたは `curl` でアクセスして、以下のレスポンスが返ることを確認：

```json
{
  "status": "healthy"
}
```

---

## 🔧 トラブルシューティング

### バックエンドが起動しない

1. Renderのログを確認：
   - ダッシュボード → `pocket-coo-backend` → **"Logs"** タブ

2. 環境変数が正しく設定されているか確認

3. Qdrant Cloud接続を確認：
   ```bash
   # Render Shell で実行
   echo $QDRANT_URL
   echo $QDRANT_API_KEY
   ```

### フロントエンドからバックエンドに接続できない

1. `NEXT_PUBLIC_API_URL` が正しく設定されているか確認
2. CORS設定が正しいか確認（フロントエンドのURLと一致しているか）
3. バックエンドのAPIキーが一致しているか確認

### バックエンドの応答が遅い

無料プランでは、15分間非アクティブだとサービスがスリープします。スリープから復帰時は30秒〜1分かかります。

**解決策**:
- 定期的にヘルスチェックエンドポイントにアクセスしてスリープを防ぐ
- アップグレードして有料プラン（$7/月）に移行

### Qdrant接続エラー

1. Qdrant Cloudのクラスターが起動しているか確認
2. `QDRANT_URL` と `QDRANT_API_KEY` が正しく設定されているか確認
3. Qdrant Cloudのダッシュボードでクラスターのステータスを確認

---

## 📊 監視とログ

### Renderログの確認

```
Dashboard → pocket-coo-backend → Logs
```

### Vercelログの確認

```
Dashboard → your-project → Deployments → [最新のデプロイ] → Logs
```

### Qdrant Cloudモニタリング

```
Qdrant Cloud Dashboard → Your Cluster → Monitoring
```

---

## 🔄 更新とデプロイ

### 自動デプロイ

- **Vercel**: `main` ブランチへのプッシュで自動デプロイ
- **Render**: `main` ブランチへのプッシュで自動デプロイ

### 手動デプロイ

#### Vercel
```
Dashboard → your-project → Deployments → Redeploy
```

#### Render
```
Dashboard → pocket-coo-backend → Manual Deploy → Deploy latest commit
```

---

## 💡 パフォーマンス最適化のヒント

### バックエンドのスリープを防ぐ

無料プランでは、15分間非アクティブだとスリープします。以下の方法でスリープを防げます：

#### 方法1: Cronジョブサービスを使用（推奨）

無料のCronサービス（例: cron-job.org）で、5分ごとにヘルスチェックエンドポイントにアクセス：

1. https://cron-job.org にアクセス
2. 無料アカウントを作成
3. 新しいCronジョブを作成：
   - **URL**: `https://pocket-coo-backend.onrender.com/api/health`
   - **間隔**: 5分ごと
   - **有効化**

#### 方法2: Vercel Cron（Proプランのみ）

Vercel Proプラン（$20/月）を使用している場合、Vercel Cronを使用できます。

---

## 🚀 有料プランへのアップグレード（オプション）

パフォーマンスや制限が気になる場合、以下のアップグレードを検討してください：

### Render有料プラン

- **Starter**: $7/月
  - スリープなし
  - より高速
  - PostgreSQL利用可能（別途 $7/月）

### Vercel有料プラン

- **Pro**: $20/月
  - 商用利用可能
  - より高い帯域幅
  - Vercel Cron使用可能

---

## 🔐 セキュリティのベストプラクティス

1. ✅ 本番環境では `DEBUG=false` に設定
2. ✅ 強力なランダムキーを使用（`API_KEY`, `SECRET_KEY`, `ENCRYPTION_KEY`）
3. ✅ API キーは環境変数で管理（コードにハードコードしない）
4. ✅ CORS を適切に設定（信頼できるドメインのみ許可）
5. ✅ HTTPS を使用（Vercel, Render, Qdrant Cloud は自動的にHTTPSを提供）
6. ✅ 定期的に依存関係を更新
7. ✅ Qdrant Cloud のAPIキーを安全に管理

---

## 📚 参考資料

- [Vercel Documentation](https://vercel.com/docs)
- [Render Free Plan](https://render.com/docs/free)
- [Qdrant Cloud Documentation](https://qdrant.tech/documentation/cloud/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

## 🆘 サポート

問題が発生した場合は、以下を確認してください：

1. このドキュメントのトラブルシューティングセクション
2. Render/Vercel/Qdrant Cloud のログ
3. 環境変数の設定
4. GitHub Issues で同様の問題を検索

---

## 📈 次のステップ

デプロイが完了したら：

1. ✅ カスタムドメインを設定（オプション）
2. ✅ 定期的なバックアップを設定
3. ✅ モニタリングとアラートを設定
4. ✅ ユーザーフィードバックを収集
5. ✅ 機能を追加・改善

---

**おめでとうございます！🎉**

Pocket COO が**完全無料**で本番環境にデプロイされました！

**総コスト: $0/月** 💰✨
