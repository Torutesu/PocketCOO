'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CalendarDays,
  ChevronRight,
  Clock,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { useTheme } from '@/context/ThemeContext'

type EpisodeLite = { id: string; date: string; summary?: string }

function formatDateLabel(date: string) {
  const d = new Date(date)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfToday - startOfThat) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMonthTitle(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function ChatHistoryPanel({
  open,
  onClose,
  episodes = [],
  onSelectEpisode,
}: {
  open: boolean
  onClose: () => void
  episodes?: EpisodeLite[]
  onSelectEpisode: (id: string) => void
}) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, open])

  const groups = useMemo(() => {
    const map = new Map<string, EpisodeLite[]>()
    for (const e of episodes.slice(0, 60)) {
      const key = formatDateLabel(e.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    return Array.from(map.entries())
  }, [episodes])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[55]">
      <button className="absolute inset-0 bg-black/10" onClick={onClose} aria-label="close" />
      <div className="absolute inset-x-0 top-[64px] flex justify-center px-4">
        <div className="w-full max-w-[420px] overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] ring-1 ring-black/10">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-black/80">
              <Clock className="h-4 w-4 text-black/55" />
              Chat history
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-black/5 text-black/70 active:bg-black/10"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[62vh] overflow-y-auto px-5 pb-4">
            {groups.map(([label, items]) => (
              <div key={label} className="pb-4">
                <div className="py-2 text-xs font-semibold text-black/45">{label}</div>
                <div className="space-y-2">
                  {items.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => {
                        onSelectEpisode(e.id)
                        onClose()
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-black/5"
                    >
                      <Avatar size={34} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-black/80">{e.summary || '（要約なし）'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {episodes.length === 0 && <div className="py-8 text-center text-sm text-black/45">No chats yet.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

function TrashPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[55]">
      <button className="absolute inset-0 bg-black/10" onClick={onClose} aria-label="close" />
      <div className="absolute left-6 top-[64px] w-[520px] max-w-[calc(100vw-48px)] overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] ring-1 ring-black/10">
        <div className="px-6 py-5">
          <div className="text-lg font-semibold">Trash</div>
        </div>
        <div className="border-t border-black/5 px-6 py-10 text-center">
          <Trash2 className="mx-auto h-10 w-10 text-black/25" />
          <div className="mt-4 text-base font-semibold text-black/55">No memories</div>
        </div>
        <div className="border-t border-black/5 px-6 py-4 text-center text-sm text-black/35">
          Memories kept for 30 days will be deleted.
        </div>
      </div>
    </div>
  )
}

function MemoryActivityPanel({
  open,
  onClose,
  episodes = [],
}: {
  open: boolean
  onClose: () => void
  episodes?: EpisodeLite[]
}) {
  const [sourceTab, setSourceTab] = useState<'All' | 'Apps' | 'Chat' | 'Cloud Reply'>('All')
  const [range, setRange] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Week')

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, open])

  const filteredEpisodes = useMemo(() => {
    if (sourceTab === 'All' || sourceTab === 'Chat') return episodes
    if (sourceTab === 'Cloud Reply') return episodes.filter((_, i) => i % 3 === 0)
    return episodes.filter((_, i) => i % 7 === 0)
  }, [episodes, sourceTab])

  const buckets = useMemo(() => {
    const now = new Date()
    const out: Array<{ key: string; label: string; count: number }> = []

    function isoKey(d: Date) {
      return d.toISOString().slice(0, 10)
    }

    function clampInt(n: number, min: number, max: number) {
      return Math.max(min, Math.min(max, Math.floor(n)))
    }

    function seedFromString(s: string) {
      let h = 0
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
      return h
    }

    function fillDummyIfEmpty(items: Array<{ key: string; label: string; count: number }>) {
      const total = items.reduce((acc, b) => acc + b.count, 0)
      if (total > 0) return items
      return items.map((b) => {
        const seed = seedFromString(`${range}:${sourceTab}:${b.key}`)
        const base = range === 'Year' ? 18 : range === 'Month' ? 10 : range === 'Week' ? 6 : 4
        const spread = range === 'Year' ? 26 : range === 'Month' ? 14 : range === 'Week' ? 10 : 8
        return { ...b, count: clampInt(base + (seed % spread), 0, 99) }
      })
    }

    if (range === 'Day') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
        out.push({ key: isoKey(d), label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: 0 })
      }
      const map = new Map(out.map((b) => [b.key, b]))
      for (const e of filteredEpisodes) {
        const k = (e.date || '').slice(0, 10)
        const b = map.get(k)
        if (b) b.count += 1
      }
      return fillDummyIfEmpty(out)
    }

    if (range === 'Week') {
      const anchor = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const day = anchor.getDay()
      const mondayOffset = (day + 6) % 7
      const monday = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - mondayOffset)
      for (let i = 7; i >= 0; i--) {
        const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() - i * 7)
        const key = isoKey(start)
        out.push({ key, label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: 0 })
      }
      const map = new Map(out.map((b) => [b.key, b]))
      for (const e of filteredEpisodes) {
        const d = new Date(e.date)
        if (Number.isNaN(d.getTime())) continue
        const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        const wday = dd.getDay()
        const off = (wday + 6) % 7
        const wkStart = new Date(dd.getFullYear(), dd.getMonth(), dd.getDate() - off)
        const k = isoKey(wkStart)
        const b = map.get(k)
        if (b) b.count += 1
      }
      return fillDummyIfEmpty(out)
    }

    if (range === 'Month') {
      const current = new Date(now.getFullYear(), now.getMonth(), 1)
      for (let i = 11; i >= 0; i--) {
        const d = new Date(current.getFullYear(), current.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        out.push({ key, label: d.toLocaleDateString('en-US', { month: 'short' }), count: 0 })
      }
      const map = new Map(out.map((b) => [b.key, b]))
      for (const e of filteredEpisodes) {
        const d = new Date(e.date)
        if (Number.isNaN(d.getTime())) continue
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const b = map.get(k)
        if (b) b.count += 1
      }
      return fillDummyIfEmpty(out)
    }

    const yearNow = now.getFullYear()
    for (let i = 4; i >= 0; i--) {
      const y = yearNow - i
      out.push({ key: String(y), label: String(y), count: 0 })
    }
    const map = new Map(out.map((b) => [b.key, b]))
    for (const e of filteredEpisodes) {
      const d = new Date(e.date)
      if (Number.isNaN(d.getTime())) continue
      const b = map.get(String(d.getFullYear()))
      if (b) b.count += 1
    }
    return fillDummyIfEmpty(out)
  }, [filteredEpisodes, range, sourceTab])

  const max = Math.max(1, ...buckets.map((d) => d.count))

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[55]">
      <button className="absolute inset-0 bg-black/10" onClick={onClose} aria-label="close" />
      <div className="absolute inset-x-0 top-[64px] flex justify-center px-4">
        <div className="w-full max-w-[980px] overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] ring-1 ring-black/10">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
            <div className="text-base font-semibold">Memory Activity</div>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-black/5 text-black/70 active:bg-black/10"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-black/5 p-1 text-xs font-semibold text-black/70">
                {(['All', 'Apps', 'Chat', 'Cloud Reply'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSourceTab(t)}
                    className={
                      sourceTab === t
                        ? 'rounded-2xl bg-white px-3 py-2 ring-1 ring-black/10'
                        : 'px-3 py-2 text-black/45'
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-black/5 p-1 text-xs font-semibold text-black/70">
                {(['Day', 'Week', 'Month', 'Year'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setRange(t)}
                    className={
                      range === t ? 'rounded-2xl bg-white px-3 py-2 ring-1 ring-black/10' : 'px-3 py-2 text-black/45'
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-3xl bg-black/[0.02] p-5 ring-1 ring-black/5">
              <div className="text-xs font-semibold text-black/55">Generated bubbles and clouds by origin</div>
              <div className="mt-4 flex items-end gap-4 overflow-x-auto pb-1">
                {buckets.map((d) => (
                  <div key={d.key} className="flex w-10 shrink-0 flex-col items-center gap-2">
                    <div className="h-28 w-6 rounded-full bg-black/5">
                      <div
                        className="w-6 rounded-full bg-black/35"
                        style={{ height: `${Math.max(6, Math.round((d.count / max) * 112))}px`, marginTop: 'auto' }}
                      />
                    </div>
                    <div className="text-[11px] text-black/35">{d.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold text-black/55">Bubbles</div>
              <div className="mt-3 rounded-3xl bg-white ring-1 ring-black/10">
                <div className="grid grid-cols-[1fr_120px_160px] gap-3 border-b border-black/5 px-5 py-3 text-[11px] font-semibold text-black/35">
                  <div>Name</div>
                  <div>Source</div>
                  <div>Date</div>
                </div>
                <div className="max-h-[34vh] overflow-y-auto">
                  {filteredEpisodes.slice(0, 24).map((e) => (
                    <div key={e.id} className="grid grid-cols-[1fr_120px_160px] items-center gap-3 px-5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar size={28} />
                        <div className="truncate text-sm font-semibold text-black/75">{e.summary || '（要約なし）'}</div>
                      </div>
                      <div className="text-xs text-black/45">{sourceTab === 'All' ? 'Chat' : sourceTab}</div>
                      <div className="text-xs text-black/45">{new Date(e.date).toLocaleString('en-US')}</div>
                    </div>
                  ))}
                  {filteredEpisodes.length === 0 && (
                    <div className="px-5 py-8 text-center text-sm text-black/45">No activity.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CalendarPanel({
  open,
  onClose,
  episodes,
}: {
  open: boolean
  onClose: () => void
  episodes: EpisodeLite[]
}) {
  const [view, setView] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month')

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, open])

  const today = useMemo(() => new Date(), [])
  const monthStart = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today])
  const monthEnd = useMemo(() => new Date(today.getFullYear(), today.getMonth() + 1, 0), [today])
  const startWeekday = monthStart.getDay()
  const daysInMonth = monthEnd.getDate()

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of episodes) {
      const key = (e.date || '').slice(0, 10)
      m.set(key, (m.get(key) || 0) + 1)
    }
    return m
  }, [episodes])

  const cells = useMemo(() => {
    const out: Array<{ date: Date | null; key: string; count: number }> = []
    const total = Math.ceil((startWeekday + daysInMonth) / 7) * 7
    for (let i = 0; i < total; i++) {
      const dayNum = i - startWeekday + 1
      if (dayNum < 1 || dayNum > daysInMonth) {
        out.push({ date: null, key: `blank_${i}`, count: 0 })
      } else {
        const d = new Date(today.getFullYear(), today.getMonth(), dayNum)
        const key = d.toISOString().slice(0, 10)
        out.push({ date: d, key, count: counts.get(key) || 0 })
      }
    }
    return out
  }, [counts, daysInMonth, startWeekday, today])

  const series = useMemo(() => {
    function seedFromString(s: string) {
      let h = 0
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
      return h
    }
    function dummyCount(key: string, base: number, spread: number) {
      const seed = seedFromString(`${view}:${key}`)
      return base + (seed % spread)
    }

    if (view === 'Day') {
      const keyToday = today.toISOString().slice(0, 10)
      const arr = Array.from({ length: 24 }, (_, h) => ({ key: String(h).padStart(2, '0'), label: `${h}`, count: 0 }))
      for (const e of episodes) {
        const d = new Date(e.date)
        if (Number.isNaN(d.getTime())) continue
        if (d.toISOString().slice(0, 10) !== keyToday) continue
        arr[d.getHours()].count += 1
      }
      const total = arr.reduce((acc, x) => acc + x.count, 0)
      if (total === 0) {
        return arr.map((x) => ({ ...x, count: dummyCount(`h${x.key}`, 0, 4) }))
      }
      return arr
    }

    if (view === 'Week') {
      const now = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
      const arr = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
        const k = d.toISOString().slice(0, 10)
        return { key: k, label: d.toLocaleDateString('en-US', { weekday: 'short' }), count: counts.get(k) || 0 }
      })
      const total = arr.reduce((acc, x) => acc + x.count, 0)
      if (total === 0) {
        return arr.map((x) => ({ ...x, count: dummyCount(x.key, 1, 6) }))
      }
      return arr
    }

    if (view === 'Year') {
      const y = today.getFullYear()
      const arr = Array.from({ length: 12 }, (_, m) => {
        const key = `${y}-${String(m + 1).padStart(2, '0')}`
        let c = 0
        for (const e of episodes) {
          const d = new Date(e.date)
          if (Number.isNaN(d.getTime())) continue
          if (d.getFullYear() !== y) continue
          if (d.getMonth() === m) c += 1
        }
        return { key, label: new Date(y, m, 1).toLocaleDateString('en-US', { month: 'short' }), count: c }
      })
      const total = arr.reduce((acc, x) => acc + x.count, 0)
      if (total === 0) {
        return arr.map((x) => ({ ...x, count: dummyCount(x.key, 2, 10) }))
      }
      return arr
    }

    return []
  }, [counts, episodes, today, view])

  const seriesMax = Math.max(1, ...series.map((s) => s.count))

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[55]">
      <button className="absolute inset-0 bg-black/10" onClick={onClose} aria-label="close" />
      <div className="absolute inset-x-0 top-[64px] flex justify-center px-4">
        <div className="w-full max-w-[980px] overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] ring-1 ring-black/10">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
            <div className="text-base font-semibold">{formatMonthTitle(today)}</div>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-2xl bg-black/5 p-1 text-xs font-semibold text-black/70">
                {(['Day', 'Week', 'Month', 'Year'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setView(t)}
                    className={
                      view === t ? 'rounded-2xl bg-white px-3 py-2 ring-1 ring-black/10' : 'px-3 py-2 text-black/45'
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button className="h-10 rounded-2xl bg-black/5 px-4 text-xs font-semibold text-black/70 active:bg-black/10">
                Today
              </button>
              <button
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-black/70 active:bg-black/10"
                aria-label="close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            {view !== 'Month' ? (
              <div className="rounded-3xl bg-black/[0.02] p-6 ring-1 ring-black/5">
                <div className="text-sm font-semibold text-black/70">{view} overview</div>
                <div className="mt-4 flex items-end gap-3 overflow-x-auto pb-1">
                  {series.map((s) => (
                    <div key={s.key} className="flex w-10 shrink-0 flex-col items-center gap-2">
                      <div className="h-28 w-6 rounded-full bg-black/5">
                        <div
                          className="w-6 rounded-full bg-black/35"
                          style={{
                            height: `${Math.max(6, Math.round((s.count / seriesMax) * 112))}px`,
                            marginTop: 'auto',
                          }}
                        />
                      </div>
                      <div className="text-[11px] text-black/35">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 text-[11px] font-semibold text-black/35">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="pb-2">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 overflow-hidden rounded-3xl ring-1 ring-black/10">
                  {cells.map((c) => (
                    <div key={c.key} className="h-24 border-b border-r border-black/5 p-2 last:border-r-0">
                      {c.date && (
                        <div className="flex items-start justify-between">
                          <div className="text-xs font-semibold text-black/60">{c.date.getDate()}</div>
                          {c.count > 0 && (
                            <div className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white">
                              {c.count}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsModal({
  open,
  onClose,
  userId,
  onChangeUserId,
}: {
  open: boolean
  onClose: () => void
  userId: string
  onChangeUserId: (next: string) => void
}) {
  const [name, setName] = useState('Tano Toru')
  const email = useMemo(() => `${userId}@example.com`, [userId])
  const [bubbleQuality, setBubbleQuality] = useState<'Low' | 'Middle' | 'High'>('Middle')
  const [bubbleDetail, setBubbleDetail] = useState<'Low' | 'Balanced' | 'High'>('High')
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <button className="absolute inset-0 bg-black/20" onClick={onClose} aria-label="close" />
      <div className="absolute inset-x-0 top-0 flex justify-center p-4">
        <div className="w-full max-w-[520px] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
            <div className="text-base font-semibold">Settings</div>
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-black/70 active:bg-black/10"
              aria-label="close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[78vh] overflow-y-auto px-5 py-5">
            <div className="flex items-center gap-4">
              <Avatar size={52} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{name}</div>
                <div className="truncate text-xs text-black/50">{email}</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold text-black/45">General</div>
              <div className="mt-3 rounded-2xl border border-black/10 bg-white">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="text-sm text-black/70">Name</div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold">{name}</div>
                    <button
                      onClick={() => {
                        const next = window.prompt('Name', name)
                        if (next) setName(next)
                      }}
                      className="h-9 rounded-2xl bg-black/5 px-3 text-xs font-semibold text-black/70 active:bg-black/10"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <div className="border-t border-black/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-black/70">User ID</div>
                    <div className="flex items-center gap-3">
                      <div className="max-w-[22ch] truncate text-sm font-semibold">{userId}</div>
                      <button
                        onClick={() => {
                          const next = window.prompt('User ID', userId)
                          if (next) onChangeUserId(next)
                        }}
                        className="h-9 rounded-2xl bg-black/5 px-3 text-xs font-semibold text-black/70 active:bg-black/10"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold text-black/45">Appearance</div>
              <div className="mt-3 rounded-2xl border border-black/10 bg-white">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="text-sm text-black/70">Base Theme</div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDark ? 'bg-black' : 'bg-black/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDark ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="border-t border-black/5 px-4 py-3">
                  <div className="text-xs text-black/45">{isDark ? 'Black base' : 'White base'}</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold text-black/45">Subscription</div>
              <div className="mt-3 rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Free</div>
                    <div className="mt-0.5 text-xs text-black/45">Upgrade for extra usage</div>
                  </div>
                  <button className="h-10 rounded-2xl bg-black px-4 text-xs font-semibold text-white active:bg-black/90">
                    View plan
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-black/45">
                    <span>Weekly chat usage</span>
                    <span className="font-semibold text-black/70">5%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-black/5">
                    <div className="h-2 w-[5%] rounded-full bg-emerald-500" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-black/35">
                    <button className="underline decoration-black/15 underline-offset-2">Plans & pricing</button>
                    <button className="underline decoration-black/15 underline-offset-2">Use activation code</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold text-black/45">Bubble & Cloud</div>
              <div className="mt-3 rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Quality</div>
                  <div className="inline-flex rounded-2xl bg-black/5 p-1">
                    {(['Low', 'Middle', 'High'] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => setBubbleQuality(k)}
                        className={`h-9 rounded-2xl px-3 text-xs font-semibold ${
                          bubbleQuality === k ? 'bg-white text-black shadow ring-1 ring-black/10' : 'text-black/55'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm font-semibold">Detail</div>
                  <div className="inline-flex rounded-2xl bg-black/5 p-1">
                    {(['Low', 'Balanced', 'High'] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => setBubbleDetail(k)}
                        className={`h-9 rounded-2xl px-3 text-xs font-semibold ${
                          bubbleDetail === k ? 'bg-white text-black shadow ring-1 ring-black/10' : 'text-black/55'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold text-black/45">Data & Security</div>
              <div className="mt-3 rounded-2xl border border-black/10 bg-white">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck className="h-4 w-4 text-black/60" />
                    Multi-factor authentication
                  </div>
                  <button className="h-9 rounded-2xl bg-black/5 px-3 text-xs font-semibold text-black/70 active:bg-black/10">
                    Manage
                  </button>
                </div>
                <div className="border-t border-black/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Sign out in this device</div>
                    <button className="h-9 rounded-2xl bg-black/5 px-3 text-xs font-semibold text-black/70 active:bg-black/10">
                      Sign out
                    </button>
                  </div>
                </div>
                <div className="border-t border-black/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Password</div>
                    <button className="h-9 rounded-2xl bg-black/5 px-3 text-xs font-semibold text-black/70 active:bg-black/10">
                      Change
                    </button>
                  </div>
                </div>
                <div className="border-t border-black/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Reset Memory</div>
                    <button className="h-9 rounded-2xl bg-black/5 px-3 text-xs font-semibold text-black/70 active:bg-black/10">
                      Reset Memory
                    </button>
                  </div>
                </div>
                <div className="border-t border-black/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Delete account</div>
                    <button className="h-9 rounded-2xl bg-rose-600 px-3 text-xs font-semibold text-white active:bg-rose-700">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-6" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TopBar({
  userId,
  onChangeUserId,
  spaceName,
  episodes = [],
  onNewChat,
  onHome,
  onSelectEpisode,
}: {
  userId: string
  onChangeUserId: (next: string) => void
  spaceName: string
  episodes?: EpisodeLite[]
  onNewChat: () => void
  onHome: () => void
  onSelectEpisode: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [trashOpen, setTrashOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!menuOpen) return
      const el = menuRef.current
      if (!el) return
      if (e.target instanceof Node && el.contains(e.target)) return
      setMenuOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [menuOpen])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <button
            onClick={() => {
              setHistoryOpen(false)
              setActivityOpen(false)
              setCalendarOpen(false)
              setTrashOpen(false)
              onHome()
            }}
            className="flex min-w-0 items-center gap-3 rounded-2xl px-2 py-1 active:bg-black/5"
            aria-label="home"
          >
            <img
              src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Letter%20P%20logo%2C%20bold%20sans-serif%2C%20gradient%20blue%20to%20purple%2C%20centered%20on%20pure%20white%20background%2C%20vector%20flat%20design%2C%20no%20borders%2C%20no%20frames%2C%20no%20black%20shapes&image_size=square"
              alt="Pocket COO Logo"
              className="h-9 w-9 rounded-2xl object-cover"
            />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold tracking-[-0.01em]">{spaceName}</div>
            </div>
          </button>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 px-4 lg:flex">
            <button
              onClick={() => {
                setHistoryOpen(true)
                setActivityOpen(false)
                setCalendarOpen(false)
                setTrashOpen(false)
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/60 active:bg-black/10"
              aria-label="clock"
            >
              <Clock className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setHistoryOpen(false)
                setActivityOpen(true)
                setCalendarOpen(false)
                setTrashOpen(false)
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/60 active:bg-black/10"
              aria-label="grid"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setHistoryOpen(false)
                setActivityOpen(false)
                setCalendarOpen(true)
                setTrashOpen(false)
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/60 active:bg-black/10"
              aria-label="calendar"
            >
              <CalendarDays className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setHistoryOpen(false)
                setActivityOpen(false)
                setCalendarOpen(false)
                setTrashOpen(true)
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/60 active:bg-black/10"
              aria-label="trash"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <div className="relative w-full max-w-[520px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="h-10 w-full rounded-2xl border border-black/10 bg-white/80 pl-9 pr-3 text-sm outline-none focus:border-black/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setHistoryOpen(false)
                setActivityOpen(false)
                setCalendarOpen(false)
                setTrashOpen(false)
                onNewChat()
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/70 active:bg-black/10"
              aria-label="add"
            >
              <Plus className="h-5 w-5" />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-2xl"
                aria-label="user"
              >
                <Avatar size={40} alt="user" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[52px] w-[260px] overflow-hidden rounded-2xl bg-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] ring-1 ring-black/10">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      setSettingsOpen(true)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-black/80 hover:bg-black/5"
                  >
                    <Settings className="h-4 w-4 text-black/55" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      alert('Logged out (demo)')
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-black/80 hover:bg-black/5"
                  >
                    <LogOut className="h-4 w-4 text-black/55" />
                    Log out
                  </button>
                  <div className="h-px bg-black/10" />
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      alert('Help (demo)')
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-black/80 hover:bg-black/5"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="h-4 w-4 text-black/55" />
                      Help
                    </span>
                    <ChevronRight className="h-4 w-4 text-black/35" />
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      window.open('https://x.com', '_blank', 'noopener,noreferrer')
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-black/80 hover:bg-black/5"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center text-black/55">X</span>
                    Follow Us
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      alert('Join Community (demo)')
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-black/80 hover:bg-black/5"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center text-black/55">⌂</span>
                    Join Community
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userId={userId}
        onChangeUserId={onChangeUserId}
      />
      <ChatHistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        episodes={episodes}
        onSelectEpisode={onSelectEpisode}
      />
      <MemoryActivityPanel open={activityOpen} onClose={() => setActivityOpen(false)} episodes={episodes} />
      <CalendarPanel open={calendarOpen} onClose={() => setCalendarOpen(false)} episodes={episodes} />
      <TrashPanel open={trashOpen} onClose={() => setTrashOpen(false)} />
    </>
  )
}
