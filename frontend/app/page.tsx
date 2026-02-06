import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          PersonalOS
        </h1>
        <p className="text-2xl text-gray-600 mb-12">
          あなたのすべてを記憶するAI
        </p>

        <div className="flex gap-6 justify-center">
          <Link
            href="/chat"
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            チャットを始める
          </Link>

          <Link
            href="/memories"
            className="px-8 py-4 bg-white text-gray-800 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl border-2 border-gray-200"
          >
            記憶を見る
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-3">🧠</div>
            <h3 className="text-lg font-semibold mb-2">階層的記憶</h3>
            <p className="text-sm text-gray-600">
              active/working/reference/archiveの4層で記憶を管理
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold mb-2">セマンティック検索</h3>
            <p className="text-sm text-gray-600">
              意味的に関連する記憶を即座に検索
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold mb-2">プライバシー保護</h3>
            <p className="text-sm text-gray-600">
              すべてのデータを暗号化して保護
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
