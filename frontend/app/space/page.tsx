'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { api, ChatMessage, PocketMemoryState } from '@/lib/api'
import { BottomTabs } from '@/components/BottomTabs'
import { TopBar } from '@/components/TopBar'
import { useUserId } from '@/components/useUserId'
import { MemoryMap } from '@/components/MemoryMap'
import { Avatar } from '@/components/Avatar'
import { ChevronRight, Send, ThumbsDown, ThumbsUp } from 'lucide-react'

type TabKey = 'chat' | 'map' | 'memory'

function useInitialTab(): TabKey {
  const params = useSearchParams()
  const t = params.get('tab')
  if (t === 'map' || t === 'memory' || t === 'chat') return t
  return 'chat'
}

function formatJP(date: string) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function toSpaceName(userId: string) {
  if (!userId || userId === 'default_user') return 'Pocket COO'
  const cleaned = userId
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const titled = cleaned
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  return `${titled}'s space`
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function SpaceInner() {
  const initialTab = useInitialTab()
  const [tab, setTab] = useState<TabKey>(initialTab)
  const { userId, ready, set: setUserId } = useUserId()

  const handleTabChange = (next: TabKey) => {
    setTab(next)
    // Next.jsのルーターを使わずにURLを更新してRSCリクエストを防ぐ
    const url = new URL(window.location.href)
    url.searchParams.set('tab', next)
    window.history.replaceState(null, '', url.toString())
  }

  const [state, setState] = useState<PocketMemoryState | null>(null)
  const [loadingMemory, setLoadingMemory] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [scoreDelta, setScoreDelta] = useState<number | null>(null)
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null)
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false)

  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const episodes = useMemo(() => {
    const eps = (state?.episodes || []) as any[]
    return [...eps].slice(-180).reverse()
  }, [state])

  const selectedEpisode = useMemo(() => {
    if (!selectedEpisodeId) return null
    return (state?.episodes || []).find((e: any) => e.id === selectedEpisodeId) || null
  }, [selectedEpisodeId, state])

  useEffect(() => {
    if (!ready) return
    setLoadingMemory(true)
    api
      .getPocketMemory(userId)
      .then((data) => {
        setState(data)
        setScore(data.score)
      })
      .catch(() => {})
      .finally(() => setLoadingMemory(false))
  }, [ready, userId])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length, sending])

  const sendFeedback = (episodeId: string, rating: 'like' | 'dislike', messageIndex: number) => {
    setMessages((prev) => prev.map((m, i) => (i === messageIndex ? { ...m, feedback: rating } : m)))
    void api.postFeedback(userId, episodeId, rating, undefined).catch(() => {})
  }

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || sending) return
    const userMessage: ChatMessage = { role: 'user', content }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setSending(true)
    setScoreDelta(null)

    try {
      const response = await api.chatPocketCOO(content, userId)
      const episodeId = response?.newMemory?.episodes?.[0]?.id as string | undefined
      const assistantMessage: ChatMessage = { role: 'assistant', content: response.response, episodeId }
      setMessages((prev) => [...prev, assistantMessage])
      setScore(response.score)
      setScoreDelta(response.scoreDelta)
      const data = await api.getPocketMemory(userId)
      setState(data)
    } catch {
      alert('メッセージ送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  const loadEpisodeToChat = (id: string, opts?: { switchToChatOnMobile?: boolean }) => {
    const ep = (state?.episodes || []).find((e: any) => e.id === id) as any
    setSelectedEpisodeId(id)
    setMobileDetailsOpen(false)
    setScoreDelta(null)
    setInput('')
    setSending(false)

    if (ep) {
      const assistantText =
        ep.assistant_message ||
        '（この履歴は要約ベースです。必要なら続きを再現できるように、次は会話の全量も保存します）'
      const feedback = ep.feedback?.rating as 'like' | 'dislike' | undefined
      const next: ChatMessage[] = []
      if (ep.user_message) next.push({ role: 'user', content: ep.user_message })
      if (assistantText) next.push({ role: 'assistant', content: assistantText, episodeId: ep.id, feedback })
      setMessages(next.length > 0 ? next : [{ role: 'assistant', content: '（履歴を読み込めませんでした）', episodeId: id }])
    } else {
      setMessages([
        { role: 'user', content: '（過去チャット）' },
        { role: 'assistant', content: '（ダミーのチャット内容）', episodeId: id },
      ])
    }

    if (opts?.switchToChatOnMobile !== false && window.innerWidth < 1024) {
      handleTabChange('chat')
    }
  }

  const identity = state?.identity || { style: {}, preferences: [], updated_at: '' }
  const style = identity?.style || {}
  const preferences = identity?.preferences || []
  const spaceName = toSpaceName(userId)
  const identityUpdatedAt = identity?.updated_at || ''
  const profile = (identity as any)?.profile || {}
  const displayName = String(profile?.displayName || profile?.name || 'あなた')
  const personas: string[] = Array.isArray(profile?.personas) ? profile.personas.filter(Boolean).slice(0, 6) : []
  const focus: string[] = Array.isArray(profile?.focus) ? profile.focus.filter(Boolean).slice(0, 6) : []
  const northStar = String(profile?.northStar || '')
  const productLine = String(profile?.product || '')
  const base = String(profile?.base || '')

  const effectiveStyle = useMemo(() => {
    const hasAny = Object.entries(style).some(([, v]) => Boolean(v))
    if (hasAny) return style
    return {
      tone: '結論→理由→次アクション',
      language: '日本語',
      format: '箇条書き＋必要なら表',
      depth: 'まず全体像→深掘り',
      product: '北極星指標から逆算',
      engineering: 'リスク/依存/計測を明示',
    }
  }, [style])

  const effectivePreferences = useMemo(() => {
    if (preferences.length > 0) return preferences
    return [
      { key: '回答の粒度', value: 'まず短く、必要なら深掘り' },
      { key: '言い回し', value: '断定しすぎず、前提を明記' },
      { key: '意思決定', value: '選択肢→比較→推奨案→根拠' },
      { key: 'PM支援', value: 'PRD/ロードマップ/スプリント' },
      { key: 'エンジニア支援', value: '設計/実装方針/テスト観点' },
      { key: '危うい点', value: 'リスクと回避策を先に出す' },
    ]
  }, [preferences])

  const topTopics = useMemo(() => {
    const eps = (state?.episodes || []) as any[]
    const counts = new Map<string, number>()
    for (const e of eps.slice(-120)) {
      const topics = (e?.topics || []) as any[]
      for (const t of topics) {
        const key = String(t || '').trim()
        if (!key) continue
        counts.set(key, (counts.get(key) || 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k)
  }, [state])

  const shownScore = score ?? state?.score ?? 0
  const shownScorePct = clamp(Number(shownScore) || 0, 0, 100)

  const quickPrompts = [
    'この新プロダクトのPRDを10分で叩き台にして（前提/成功指標/非ゴール/リスク）',
    '今週のスプリント計画を作って（優先度/依存関係/担当/見積もり）',
    '技術負債と障害リスクを棚卸しして、次の1週間の対策案を出して',
  ]

  const chatPane = (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-white/70 ring-1 ring-black/5">
      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="mt-10">
            <div className="text-[28px] font-semibold tracking-[-0.02em] text-black">こんにちは、{displayName}</div>
            <div className="mt-1 text-sm text-black/55">
              {northStar ? `北極星指標: ${northStar}。` : ''}
              {topTopics.length > 0 ? `最近のテーマ: ${topTopics.join(' / ')}` : '最近の意思決定ポイント、まだ覚えてる？'}
            </div>
            {(personas.length > 0 || base) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {base && (
                  <div className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-black/70 ring-1 ring-black/10">
                    {base}
                  </div>
                )}
                {personas.map((p) => (
                  <div key={p} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-black/70 ring-1 ring-black/10">
                    {p}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 space-y-2">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    sendMessage(p)
                  }}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm text-black/70 shadow-[0_1px_0_rgba(0,0,0,0.04)] active:bg-black/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 truncate">{p}</div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-black/35" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[92%] sm:max-w-[80%] items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'user' ? (
                    <Avatar size={28} />
                  ) : (
                    <img
                      src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Futuristic%20friendly%20AI%20assistant%20avatar%2C%20smooth%20gradient%2C%20blue%20and%20purple%20tones%2C%20minimalist%20style%2C%20floating%20on%20white%20background%2C%20no%20border%2C%20no%20frame%2C%20no%20black%20background%2C%20high%20key&image_size=square"
                      alt="Pocket COO"
                      className="h-7 w-7 rounded-2xl object-cover"
                    />
                  )}
                  <div className="flex flex-col">
                    <div
                      className={`rounded-3xl px-4 py-3 text-[15px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-black text-white'
                          : 'bg-white text-black shadow-[0_1px_0_rgba(0,0,0,0.06)] ring-1 ring-black/5'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>

                    {msg.role === 'assistant' && msg.episodeId && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => sendFeedback(msg.episodeId!, 'like', idx)}
                          disabled={msg.feedback === 'like'}
                          className={`inline-flex h-10 items-center gap-2 rounded-2xl px-3 text-xs font-semibold ring-1 ${
                            msg.feedback === 'like'
                              ? 'bg-emerald-500/10 text-emerald-800 ring-emerald-500/20'
                              : 'bg-white text-black/70 ring-black/10 active:bg-black/5'
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          いいね
                        </button>
                        <button
                          onClick={() => sendFeedback(msg.episodeId!, 'dislike', idx)}
                          disabled={msg.feedback === 'dislike'}
                          className={`inline-flex h-10 items-center gap-2 rounded-2xl px-3 text-xs font-semibold ring-1 ${
                            msg.feedback === 'dislike'
                              ? 'bg-rose-500/10 text-rose-800 ring-rose-500/20'
                              : 'bg-white text-black/70 ring-black/10 active:bg-black/5'
                          }`}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          違う
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="rounded-3xl bg-white px-4 py-3 text-sm text-black/60 ring-1 ring-black/5">
                  考え中…
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-black/5 px-3 pb-[calc(max(env(safe-area-inset-bottom),0px)+76px)] pt-3 lg:pb-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            placeholder="話しかける…"
            className="max-h-32 flex-1 resize-none rounded-3xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[15px] leading-relaxed outline-none focus:border-black/20"
            disabled={sending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={sending || !input.trim()}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white disabled:opacity-40"
            aria-label="send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )

  const mapPane = (
    <div className="relative h-full">
      <MemoryMap
        nodes={episodes.map((e: any) => ({ id: e.id, date: e.date, label: e.summary }))}
        selectedId={selectedEpisodeId}
        onSelect={(id) => {
          setSelectedEpisodeId(id)
          loadEpisodeToChat(id, { switchToChatOnMobile: false })
          if (window.innerWidth < 1024) setMobileDetailsOpen(true)
        }}
        className="h-full"
      />
      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl bg-white/70 px-3 py-2 text-xs text-black/55 ring-1 ring-black/5">
        Memory Map
        {loadingMemory && <span className="ml-2">同期中…</span>}
      </div>
    </div>
  )

  const memoryPane = (
    <div className="h-full overflow-hidden rounded-3xl bg-white/70 ring-1 ring-black/5">
      <div className="border-b border-black/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar size={34} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{displayName}</div>
            <div className="mt-0.5 truncate text-xs text-black/55">
              {productLine || 'あなたの書き方・判断基準・関心領域は学習済み'}
              {identityUpdatedAt ? `（更新: ${formatJP(identityUpdatedAt)}）` : ''}
            </div>
          </div>
          <div className="ml-auto inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-black/70 ring-1 ring-black/10">
            <span className="text-black/45">Personalization</span>
            <span>{shownScorePct}%</span>
          </div>
        </div>
      </div>
      <div className="h-full overflow-y-auto px-4 py-4 pb-36 lg:pb-28">
        {(personas.length > 0 || focus.length > 0 || northStar || productLine) && (
          <div className="rounded-3xl bg-gradient-to-br from-black/[0.03] to-white p-4 ring-1 ring-black/10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-black/55">あなたの前提</div>
                <div className="mt-1 truncate text-sm font-semibold">
                  {personas.length > 0 ? personas.join(' / ') : 'ソロプレナー / エンジニア / グローバルプロダクト'}
                </div>
                {productLine && <div className="mt-2 text-xs text-black/55">{productLine}</div>}
              </div>
              <div
                className="relative h-14 w-14 shrink-0 rounded-full p-[2px]"
                style={{
                  background: `conic-gradient(#111 ${shownScorePct * 3.6}deg, rgba(0,0,0,0.08) 0deg)`,
                }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-sm font-semibold">
                  {shownScorePct}%
                </div>
              </div>
            </div>
            {(northStar || focus.length > 0) && (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {northStar && (
                  <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/10">
                    <div className="text-[11px] font-semibold text-black/45">North Star</div>
                    <div className="mt-1 text-sm font-semibold">{northStar}</div>
                  </div>
                )}
                {focus.length > 0 && (
                  <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/10">
                    <div className="text-[11px] font-semibold text-black/45">Focus</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {focus.slice(0, 4).map((f) => (
                        <div key={f} className="rounded-full bg-black/5 px-2 py-1 text-[11px] font-semibold text-black/70">
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedEpisode && (
          <div className="rounded-3xl bg-white p-4 ring-1 ring-black/10">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-black/55">{formatJP((selectedEpisode as any).date)}</div>
                <div className="mt-1 truncate text-sm font-semibold">{(selectedEpisode as any).summary || '（要約なし）'}</div>
              </div>
              <button
                onClick={() => setSelectedEpisodeId(null)}
                className="h-10 rounded-2xl bg-black/5 px-3 text-xs font-semibold text-black/70 active:bg-black/10"
              >
                解除
              </button>
            </div>
            {((selectedEpisode as any).assistant_message || (selectedEpisode as any).user_message) && (
              <div className="mt-3 space-y-2">
                {(selectedEpisode as any).user_message && (
                  <div className="rounded-2xl bg-black/5 px-3 py-2 text-sm text-black/75">
                    {(selectedEpisode as any).user_message}
                  </div>
                )}
                {(selectedEpisode as any).assistant_message && (
                  <div className="rounded-2xl bg-white px-3 py-2 text-sm ring-1 ring-black/10">
                    {(selectedEpisode as any).assistant_message}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/5 p-4">
            <div className="text-xs text-black/55">分身スコア</div>
            <div className="mt-1 text-2xl font-semibold">{shownScorePct}%</div>
            {typeof scoreDelta === 'number' && scoreDelta !== 0 && (
              <div className="mt-1 text-xs font-semibold text-black/55">
                {scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`}
              </div>
            )}
          </div>
          <div className="rounded-2xl bg-black/5 p-4">
            <div className="text-xs text-black/55">ログ</div>
            <div className="mt-1 text-2xl font-semibold">{(state?.episodes?.length ?? 0).toLocaleString('ja-JP')}件</div>
          </div>
        </div>

        {Array.isArray((state as any)?.projects) && ((state as any).projects?.length ?? 0) > 0 && (
          <div className="mt-6">
            <div className="text-xs font-semibold text-black/70">進行中プロジェクト</div>
            <div className="mt-3 space-y-2">
              {(((state as any).projects || []) as any[]).slice(0, 4).map((p) => (
                <div key={p.id || p.name} className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{p.name || 'Project'}</div>
                      {p.goal && <div className="mt-1 truncate text-xs text-black/55">{p.goal}</div>}
                    </div>
                    {p.status && (
                      <div className="shrink-0 rounded-full bg-black/5 px-3 py-1 text-[11px] font-semibold text-black/70">
                        {String(p.status)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="text-xs font-semibold text-black/70">スタイル</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(effectiveStyle)
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="rounded-full bg-white px-3 py-2 text-xs ring-1 ring-black/10">
                  <span className="text-black/55">{k}</span>
                  <span className="mx-2 text-black/25">/</span>
                  <span className="font-semibold">{String(v)}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs font-semibold text-black/70">好み</div>
          <div className="mt-3 space-y-2">
            {effectivePreferences.slice(0, 12).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-black/10">
                <div className="text-sm font-semibold">{p.key}</div>
                <div className="text-sm text-black/60">{p.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs font-semibold text-black/70">最近</div>
          <div className="mt-3 space-y-2">
            {episodes.slice(0, 12).map((e: any) => (
              <button
                key={e.id}
                className="w-full rounded-2xl bg-white px-4 py-3 text-left ring-1 ring-black/10 active:bg-black/5"
                onClick={() => {
                  loadEpisodeToChat(e.id)
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar size={28} />
                    <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{e.summary || '（要約なし）'}</div>
                    <div className="mt-1 text-xs text-black/50">{formatJP(e.date)}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-black/35" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh">
      <TopBar
        spaceName={spaceName}
        userId={userId}
        onChangeUserId={setUserId}
        episodes={episodes.map((e: any) => ({ id: e.id, date: e.date, summary: e.summary }))}
        onNewChat={() => {
          setMessages([])
          setInput('')
          setScoreDelta(null)
          setSelectedEpisodeId(null)
          setMobileDetailsOpen(false)
          handleTabChange('chat')
        }}
        onHome={() => {
          setSelectedEpisodeId(null)
          setMobileDetailsOpen(false)
          handleTabChange('chat')
        }}
        onSelectEpisode={(id) => {
          loadEpisodeToChat(id)
        }}
      />

      <main className="mx-auto grid h-[calc(100dvh-56px)] max-w-7xl gap-3 p-3 pb-24 lg:grid-cols-[360px_1fr_360px] lg:p-4">
        <section className={`h-full ${tab === 'chat' ? '' : 'hidden'} lg:block`}>{chatPane}</section>
        <section className={`h-full ${tab === 'map' ? '' : 'hidden'} lg:block`}>{mapPane}</section>
        <section className={`h-full ${tab === 'memory' ? '' : 'hidden'} lg:block`}>{memoryPane}</section>
      </main>

      <BottomTabs currentTab={tab} onTabChange={handleTabChange} />

      {mobileDetailsOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/15" onClick={() => setMobileDetailsOpen(false)} aria-label="close" />
          <div className="absolute inset-x-0 bottom-0 max-h-[72vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/10">
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
              <div className="text-sm font-semibold">Details</div>
              <button
                onClick={() => setMobileDetailsOpen(false)}
                className="h-10 rounded-xl bg-black/5 px-3 text-xs font-semibold text-black/70"
              >
                閉じる
              </button>
            </div>
            <div className="max-h-[calc(72vh-52px)] overflow-y-auto px-4 py-4 pb-[max(env(safe-area-inset-bottom),12px)]">
              {selectedEpisode ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-black/55">{formatJP((selectedEpisode as any).date)}</div>
                    <div className="mt-1 text-base font-semibold">{(selectedEpisode as any).summary || '（要約なし）'}</div>
                  </div>
                  {((selectedEpisode as any).user_message || (selectedEpisode as any).assistant_message) && (
                    <div className="space-y-2">
                      {(selectedEpisode as any).user_message && (
                        <div className="rounded-2xl bg-black/5 px-4 py-3 text-sm">
                          {(selectedEpisode as any).user_message}
                        </div>
                      )}
                      {(selectedEpisode as any).assistant_message && (
                        <div className="rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-black/10">
                          {(selectedEpisode as any).assistant_message}
                        </div>
                      )}
                    </div>
                  )}
                  {(selectedEpisode as any).feedback?.rating && (
                    <div className="rounded-2xl bg-black/5 px-4 py-3 text-sm">
                      feedback: <span className="font-semibold">{(selectedEpisode as any).feedback.rating}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-black/55">エピソードを選択してください</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SpacePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#f6f7f9]" />}>
      <SpaceInner />
    </Suspense>
  )
}
