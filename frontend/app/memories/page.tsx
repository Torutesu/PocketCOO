'use client'

import { useEffect, useState } from 'react'
import { api, Memory } from '@/lib/api'
import Link from 'next/link'

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <p className="text-lg text-gray-600">記憶を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">記憶一覧</h1>
            <p className="text-sm text-gray-500 mt-1">あなたのすべての記憶</p>
          </div>
          <Link
            href="/chat"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            チャットに戻る
          </Link>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto p-8">
        {/* 統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">総記憶数</div>
            <div className="text-4xl font-bold text-blue-600">{memories.length}</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">会話記憶</div>
            <div className="text-4xl font-bold text-green-600">
              {memories.filter(m => m.metadata?.type === 'conversation').length}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">アクティブ層</div>
            <div className="text-4xl font-bold text-purple-600">
              {memories.filter(m => m.metadata?.layer === 'active').length}
            </div>
          </div>
        </div>

        {/* 記憶リスト */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {memories.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">💭</div>
              <p className="text-xl text-gray-600 mb-2">記憶がまだありません</p>
              <p className="text-sm text-gray-500 mb-6">
                チャットを始めて、最初の記憶を作りましょう
              </p>
              <Link
                href="/chat"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                チャットを始める
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {memories.map((memory) => (
                <div key={memory.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-800 mb-3 leading-relaxed whitespace-pre-wrap">
                        {memory.memory}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="text-gray-500">
                          📅 {new Date(memory.created_at).toLocaleString('ja-JP')}
                        </span>
                        {memory.metadata?.category && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                            {memory.metadata.category}
                          </span>
                        )}
                        {memory.metadata?.layer && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                            {memory.metadata.layer}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(memory.id)}
                      className="ml-6 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
