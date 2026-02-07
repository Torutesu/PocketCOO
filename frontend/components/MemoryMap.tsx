'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { LocateFixed, Minus, Plus, RotateCcw, RotateCw } from 'lucide-react'

type Node = {
  id: string
  r: number
  t: number
  x?: number
  y?: number
  vx?: number
  vy?: number
}

type Link = {
  source: string | Node
  target: string | Node
  w: number
}

function tokenize(text: string) {
  const s = (text || '').toLowerCase()
  const tokens = new Set<string>()

  const latin = s.match(/[a-z0-9]{2,}/g) || []
  for (const w of latin) tokens.add(w)

  const jp = s.match(/[一-龥ぁ-んァ-ン]{2,}/g) || []
  for (const seq of jp) {
    tokens.add(seq)
    for (let i = 0; i < seq.length - 1; i++) tokens.add(seq.slice(i, i + 2))
  }

  const spaced = s.split(/[\s/_,.()【】「」『』:;!?]+/g).filter(Boolean)
  for (const w of spaced) if (w.length >= 2) tokens.add(w)

  return tokens
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const t of a) if (b.has(t)) inter++
  const union = a.size + b.size - inter
  return union === 0 ? 0 : inter / union
}

export function MemoryMap({
  nodes,
  selectedId,
  onSelect,
  className,
}: {
  nodes: Array<{ id: string; date: string; label?: string }>
  selectedId?: string | null
  onSelect: (id: string) => void
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const zoomRef = useRef<d3.ZoomBehavior<HTMLCanvasElement, unknown> | null>(null)
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity)
  const rotationRef = useRef(0)
  const hoveredIdRef = useRef<string | null>(null)
  const redrawRef = useRef<(() => void) | null>(null)
  const [tooltip, setTooltip] = useState<{ id: string; x: number; y: number; text: string } | null>(null)

  const viewNodes = useMemo(() => nodes.slice(0, 180), [nodes])

  const simNodes: Node[] = useMemo(() => {
    const now = Date.now()
    return viewNodes.map((n) => {
      const t = new Date(n.date).getTime() || now
      const age = Math.max(0, now - t)
      const days = age / (1000 * 60 * 60 * 24)
      const r = Math.max(4, 14 - Math.min(10, days / 7))
      return { id: n.id, r, t }
    })
  }, [viewNodes])

  const graphLinks: Link[] = useMemo(() => {
    const metas = viewNodes.map((n) => {
      const text = `${n.label || ''} ${n.date || ''}`.trim()
      return { id: n.id, tokens: tokenize(text) }
    })

    const scores: Array<{ i: number; j: number; w: number }> = []
    for (let i = 0; i < metas.length; i++) {
      for (let j = i + 1; j < metas.length; j++) {
        const w = jaccard(metas[i].tokens, metas[j].tokens)
        if (w > 0.09) scores.push({ i, j, w })
      }
    }

    const topK = 3
    const perNode = new Map<number, Array<{ j: number; w: number }>>()
    for (const s of scores) {
      if (!perNode.has(s.i)) perNode.set(s.i, [])
      if (!perNode.has(s.j)) perNode.set(s.j, [])
      perNode.get(s.i)!.push({ j: s.j, w: s.w })
      perNode.get(s.j)!.push({ j: s.i, w: s.w })
    }
    for (const [i, list] of perNode) {
      list.sort((a, b) => b.w - a.w)
      perNode.set(i, list.slice(0, topK))
    }

    const edgeMap = new Map<string, Link>()
    for (const [i, list] of perNode) {
      for (const { j, w } of list) {
        const a = metas[i].id
        const b = metas[j].id
        const key = a < b ? `${a}::${b}` : `${b}::${a}`
        const existing = edgeMap.get(key)
        if (!existing || existing.w < w) edgeMap.set(key, { source: a, target: b, w })
      }
    }
    return Array.from(edgeMap.values()).sort((a, b) => b.w - a.w).slice(0, 220)
  }, [viewNodes])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return
    const canvasEl = canvas
    const wrapperEl = wrapper

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    const ctx = canvasEl.getContext('2d')
    if (!ctx) return
    const ctxEl = ctx

    let w = 0
    let h = 0
    let raf = 0
    let lastPointer: { x: number; y: number } | null = null
    let simulation: d3.Simulation<Node, undefined> | null = null

    function resize() {
      const rect = wrapperEl.getBoundingClientRect()
      w = Math.max(1, Math.floor(rect.width))
      h = Math.max(1, Math.floor(rect.height))
      canvasEl.width = Math.floor(w * dpr)
      canvasEl.height = Math.floor(h * dpr)
      canvasEl.style.width = `${w}px`
      canvasEl.style.height = `${h}px`
      ctxEl.setTransform(dpr, 0, 0, dpr, 0, 0)
      const center = d3.forceCenter(w / 2, h / 2)
      if (simulation) simulation.force('center', center as any)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(wrapperEl)

    const linksForSim: Link[] = graphLinks.map((l) => ({ ...l }))

    simulation = d3
      .forceSimulation<Node>(simNodes as any)
      .alpha(1)
      .alphaDecay(0.04)
      .velocityDecay(0.26)
      .force('charge', d3.forceManyBody().strength(-14))
      .force(
        'link',
        d3
          .forceLink<Node, any>(linksForSim as any)
          .id((d: any) => d.id)
          .distance((l: any) => 90 + 120 * (1 - (l.w ?? 0)))
          .strength((l: any) => Math.min(0.55, 0.12 + (l.w ?? 0) * 0.7))
      )
      .force(
        'collide',
        d3.forceCollide<Node>().radius((d) => d.r + 2).iterations(2)
      )
      .on('tick', draw)

    resize()

    const zoomBehavior = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.55, 5])
      .on('zoom', (ev) => {
        transformRef.current = ev.transform
        draw()
      })
    zoomRef.current = zoomBehavior
    d3.select(canvasEl).call(zoomBehavior as any)

    function screenToWorld(x: number, y: number) {
      const t = transformRef.current
      const a = rotationRef.current
      const cx = w / 2
      const cy = h / 2
      const dx = x - cx
      const dy = y - cy
      const cos = Math.cos(-a)
      const sin = Math.sin(-a)
      const ux = dx * cos - dy * sin + cx
      const uy = dx * sin + dy * cos + cy
      return { x: (ux - t.x) / t.k, y: (uy - t.y) / t.k }
    }

    function worldToScreen(x: number, y: number) {
      const t = transformRef.current
      const a = rotationRef.current
      const cx = w / 2
      const cy = h / 2
      const sx = x * t.k + t.x
      const sy = y * t.k + t.y
      const dx = sx - cx
      const dy = sy - cy
      const cos = Math.cos(a)
      const sin = Math.sin(a)
      return { x: dx * cos - dy * sin + cx, y: dx * sin + dy * cos + cy }
    }

    function pickNode(px: number, py: number) {
      const p = screenToWorld(px, py)
      let best: { id: string; d2: number } | null = null
      for (const n of simNodes) {
        const nx = n.x ?? 0
        const ny = n.y ?? 0
        const dx = nx - p.x
        const dy = ny - p.y
        const d2 = dx * dx + dy * dy
        const rr = (n.r + 8 / Math.max(1, transformRef.current.k)) ** 2
        if (d2 <= rr) {
          if (!best || d2 < best.d2) best = { id: n.id, d2 }
        }
      }
      return best?.id ?? null
    }

    function updateTooltip(px: number, py: number, id: string | null) {
      if (!id) {
        setTooltip(null)
        return
      }
      const meta = viewNodes.find((n) => n.id === id)
      const text = meta?.label || (meta?.date ? new Date(meta.date).toLocaleString('ja-JP') : id)
      const n = simNodes.find((sn) => sn.id === id)
      if (n && n.x != null && n.y != null) {
        const s = worldToScreen(n.x, n.y)
        setTooltip({ id, x: s.x, y: s.y, text })
      } else {
        setTooltip({ id, x: px, y: py, text })
      }
    }

    function draw() {
      raf = window.requestAnimationFrame(() => {
        ctxEl.clearRect(0, 0, w, h)

        const gradient = ctxEl.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.1)
        gradient.addColorStop(0, 'rgba(0,0,0,0.02)')
        gradient.addColorStop(1, 'rgba(0,0,0,0)')
        ctxEl.fillStyle = gradient
        ctxEl.fillRect(0, 0, w, h)

        const t = transformRef.current
        const a = rotationRef.current
        const cx = w / 2
        const cy = h / 2
        const cos = Math.cos(a)
        const sin = Math.sin(a)
        const hoveredId = hoveredIdRef.current
        const selected = selectedId || null

        const neighbors = new Set<string>()
        const focus = hoveredId || selected
        if (focus) {
          for (const l of linksForSim as any) {
            const s = typeof l.source === 'string' ? l.source : l.source?.id
            const t0 = typeof l.target === 'string' ? l.target : l.target?.id
            if (s === focus) neighbors.add(t0)
            if (t0 === focus) neighbors.add(s)
          }
        }

        if (linksForSim.length > 0) {
          ctxEl.beginPath()
          for (const l of linksForSim as any) {
            const s = typeof l.source === 'string' ? simNodes.find((n) => n.id === l.source) : l.source
            const t0 = typeof l.target === 'string' ? simNodes.find((n) => n.id === l.target) : l.target
            if (!s || !t0) continue
            const sx = s.x ?? 0
            const sy = s.y ?? 0
            const tx = t0.x ?? 0
            const ty = t0.y ?? 0
            const ss = worldToScreen(sx, sy)
            const tt = worldToScreen(tx, ty)
            const w0 = Number(l.w ?? 0)
            const isFocus =
              focus &&
              ((typeof l.source === 'string' ? l.source : l.source?.id) === focus ||
                (typeof l.target === 'string' ? l.target : l.target?.id) === focus)

            ctxEl.strokeStyle = isFocus ? `rgba(0,0,0,${0.18 + 0.28 * w0})` : `rgba(0,0,0,${0.06 + 0.14 * w0})`
            ctxEl.lineWidth = Math.max(0.8, Math.min(3.2, 0.9 + 2.2 * w0))
            ctxEl.beginPath()
            ctxEl.moveTo(ss.x, ss.y)
            ctxEl.lineTo(tt.x, tt.y)
            ctxEl.stroke()
          }
        }

        for (const n of simNodes) {
          const wx = n.x ?? 0
          const wy = n.y ?? 0
          const sxy = worldToScreen(wx, wy)
          const x = sxy.x
          const y = sxy.y

          const isSelected = selectedId && n.id === selectedId
          const isHovered = hoveredId && n.id === hoveredId
          const isNeighbor = focus ? neighbors.has(n.id) : false
          const base = isSelected ? 0.22 : isHovered ? 0.18 : isNeighbor ? 0.16 : 0.12
          const r = Math.max(3.2, Math.min(40, n.r * t.k))

          const g = ctxEl.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r * 1.6)
          g.addColorStop(0, `rgba(255,255,255,${0.9})`)
          g.addColorStop(1, `rgba(0,0,0,${base})`)

          ctxEl.beginPath()
          ctxEl.arc(x, y, r, 0, Math.PI * 2)
          ctxEl.fillStyle = 'rgba(255,255,255,0.75)'
          ctxEl.fill()
          ctxEl.fillStyle = g
          ctxEl.globalCompositeOperation = 'multiply'
          ctxEl.fill()
          ctxEl.globalCompositeOperation = 'source-over'
          ctxEl.strokeStyle = isSelected ? 'rgba(0,0,0,0.35)' : isHovered ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.08)'
          ctxEl.lineWidth = isSelected ? 1.8 : isHovered ? 1.4 : 1
          ctxEl.stroke()
        }

        if (lastPointer) {
          const id = pickNode(lastPointer.x, lastPointer.y)
          if (id !== hoveredIdRef.current) {
            hoveredIdRef.current = id
          }
        }
      })
    }
    redrawRef.current = draw

    function handleClick(ev: MouseEvent) {
      const rect = canvasEl.getBoundingClientRect()
      const x = ev.clientX - rect.left
      const y = ev.clientY - rect.top
      const id = pickNode(x, y)
      if (id) onSelect(id)
    }

    function handleMove(ev: MouseEvent) {
      const rect = canvasEl.getBoundingClientRect()
      const x = ev.clientX - rect.left
      const y = ev.clientY - rect.top
      lastPointer = { x, y }
      const id = pickNode(x, y)
      if (id !== hoveredIdRef.current) hoveredIdRef.current = id
      updateTooltip(x, y, id)
      draw()
    }

    function handleLeave() {
      lastPointer = null
      hoveredIdRef.current = null
      setTooltip(null)
      draw()
    }

    canvasEl.addEventListener('click', handleClick)
    canvasEl.addEventListener('mousemove', handleMove)
    canvasEl.addEventListener('mouseleave', handleLeave)

    return () => {
      canvasEl.removeEventListener('click', handleClick)
      canvasEl.removeEventListener('mousemove', handleMove)
      canvasEl.removeEventListener('mouseleave', handleLeave)
      ro.disconnect()
      if (simulation) simulation.stop()
      redrawRef.current = null
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [graphLinks, onSelect, selectedId, simNodes, viewNodes])

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden rounded-3xl bg-white/70 ring-1 ring-black/5 ${className ?? ''}`}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/70" />

      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-black/70 ring-1 ring-black/10 backdrop-blur active:bg-white"
          onClick={() => {
            const el = canvasRef.current
            const zb = zoomRef.current
            if (!el || !zb) return
            d3.select(el).call(zb.scaleBy as any, 1.16)
          }}
          aria-label="zoom-in"
        >
          <Plus className="h-5 w-5" />
        </button>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-black/70 ring-1 ring-black/10 backdrop-blur active:bg-white"
          onClick={() => {
            const el = canvasRef.current
            const zb = zoomRef.current
            if (!el || !zb) return
            d3.select(el).call(zb.scaleBy as any, 0.86)
          }}
          aria-label="zoom-out"
        >
          <Minus className="h-5 w-5" />
        </button>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-black/70 ring-1 ring-black/10 backdrop-blur active:bg-white"
          onClick={() => {
            rotationRef.current = rotationRef.current - Math.PI / 12
            redrawRef.current?.()
          }}
          aria-label="rotate-left"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-black/70 ring-1 ring-black/10 backdrop-blur active:bg-white"
          onClick={() => {
            rotationRef.current = rotationRef.current + Math.PI / 12
            redrawRef.current?.()
          }}
          aria-label="rotate-right"
        >
          <RotateCw className="h-5 w-5" />
        </button>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-black/70 ring-1 ring-black/10 backdrop-blur active:bg-white"
          onClick={() => {
            const el = canvasRef.current
            const zb = zoomRef.current
            if (!el || !zb) return
            rotationRef.current = 0
            d3.select(el).call(zb.transform as any, d3.zoomIdentity)
          }}
          aria-label="reset"
        >
          <LocateFixed className="h-5 w-5" />
        </button>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 max-w-[240px] -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-2xl bg-white/90 px-3 py-2 text-xs text-black/75 shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/10 backdrop-blur"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
