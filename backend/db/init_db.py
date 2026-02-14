"""
データベース初期化スクリプト

本番環境での初回デプロイ時に実行して、データベーススキーマを作成します。
"""
import sys
import os

# バックエンドディレクトリをPythonパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.session import engine
from db.base import Base


def init_db():
    """データベーステーブルを作成"""
    print("データベース初期化を開始します...")
    print(f"データベースURL: {engine.url}")

    try:
        # すべてのテーブルを作成
        Base.metadata.create_all(bind=engine)
        print("✅ データベーステーブルが正常に作成されました")
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        sys.exit(1)


if __name__ == "__main__":
    init_db()
