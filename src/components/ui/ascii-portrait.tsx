import { useEffect, useRef, useState } from 'react'

import {
  CHARSETS,
  adjust,
  glyphFor,
  noiseTile,
  sampleGrid,
  shimmer,
  type CharsetName,
} from '@/lib/ascii/engine'
import { cn } from '@/lib/utils'

interface AsciiPortraitProps {
  src: string
  alt: string
  fallbackSrc?: string
  cellSize?: number
  charset?: CharsetName
  contrast?: number
  /** Dark subject on a light backdrop becomes dense glyphs; the backdrop stays empty. */
  invert?: boolean
  animate?: boolean
  className?: string
}

const MOBILE_BREAKPOINT = 640
const MOBILE_CELL_SIZE = 8
const FRAME_MS = 1000 / 30
const BACKDROP_THRESHOLD = 0.13
const GAMMA = 0.5
const ACCENT_MIX = 0.25
const TINT_FROM = 0.8
const SHIMMER_INTENSITY = 0.6
const GRAIN_SIZE = 96
const FALLBACK_FG = '#f2f2f2'
const FALLBACK_ACCENT = '#2b2bff'

function parseHex(hex: string, fallback: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim()) ?? /^#?([0-9a-f]{6})$/i.exec(fallback)
  const n = parseInt(m ? m[1] : '000000', 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function makeGrainUrl(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const canvas = document.createElement('canvas')
  canvas.width = GRAIN_SIZE
  canvas.height = GRAIN_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return undefined
  const pixels = noiseTile(GRAIN_SIZE, 1337)
  ctx.putImageData(new ImageData(pixels, GRAIN_SIZE, GRAIN_SIZE), 0, 0)
  return canvas.toDataURL('image/png')
}

export function AsciiPortrait({
  src,
  alt,
  fallbackSrc,
  cellSize = 10,
  charset = 'standard',
  contrast = 128,
  invert = true,
  animate = true,
  className,
}: AsciiPortraitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [loadId, setLoadId] = useState(0)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [grainUrl] = useState(makeGrainUrl)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!container || !canvas || !img || loadId === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const chars = CHARSETS[charset]
    const still = !animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const styles = getComputedStyle(container)
    const fg = parseHex(styles.getPropertyValue('--foreground'), FALLBACK_FG)
    const accent = parseHex(styles.getPropertyValue('--accent'), FALLBACK_ACCENT)
    const tinted = fg.map((c, i) => Math.round(c * (1 - ACCENT_MIX) + accent[i] * ACCENT_MIX))

    let base = new Float32Array(0)
    let cols = 0
    let rows = 0
    let px = 0
    let atlas: HTMLCanvasElement | null = null
    let raf = 0
    let last = 0
    let onScreen = true
    let resizeTimer = 0
    const t0 = performance.now()

    const buildAtlas = (size: number) => {
      const a = document.createElement('canvas')
      a.width = size * chars.length
      a.height = size * 2
      const actx = a.getContext('2d')
      if (!actx) return null
      actx.font = `500 ${Math.round(size * 1.05)}px "JetBrains Mono Variable", ui-monospace, monospace`
      actx.textAlign = 'center'
      actx.textBaseline = 'middle'
      for (const [row, color] of [fg, tinted].entries()) {
        actx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
        for (let i = 0; i < chars.length; i++) {
          actx.fillText(chars.charAt(i), i * size + size / 2, row * size + size / 2 + size * 0.05)
        }
      }
      return a
    }

    const draw = (t: number) => {
      if (!atlas) return
      const cellW = canvas.width / cols
      const cellH = canvas.height / rows
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const v = base[row * cols + col]
          if (v <= 0) continue
          const m = still ? v : shimmer(v, col, row, t, SHIMMER_INTENSITY)
          const gi = chars.indexOf(glyphFor(m, chars))
          if (gi <= 0) continue
          ctx.drawImage(
            atlas,
            gi * px,
            (v > TINT_FROM ? 1 : 0) * px,
            px,
            px,
            col * cellW,
            row * cellH,
            cellW,
            cellH,
          )
        }
      }
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (now - last < FRAME_MS) return
      last = now
      draw((now - t0) / 1000)
    }

    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
    const syncLoop = () => {
      const shouldRun = !still && onScreen && !document.hidden
      if (shouldRun && !raf) raf = requestAnimationFrame(frame)
      else if (!shouldRun && raf) stop()
    }

    const rebuild = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (w === 0 || h === 0 || !img.naturalWidth) return
      const cs = w < MOBILE_BREAKPOINT ? MOBILE_CELL_SIZE : cellSize
      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const octx = off.getContext('2d', { willReadFrequently: true })
      if (!octx) return
      // object-fit: cover, anchored to the top so the face is never cropped.
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
      const dw = img.naturalWidth * scale
      octx.drawImage(img, (w - dw) / 2, 0, dw, img.naturalHeight * scale)
      const grid = sampleGrid(octx.getImageData(0, 0, w, h).data, w, h, cs)
      cols = grid.cols
      rows = grid.rows

      // Estimate the plain backdrop level from the top corners (the bottom is the jacket).
      const edge = Math.min(3, cols)
      let bg = 0
      for (let i = 0; i < edge; i++) bg += grid.values[i] + grid.values[cols - 1 - i]
      bg /= edge * 2
      base = new Float32Array(grid.values.length)
      for (let i = 0; i < base.length; i++) {
        const l = grid.values[i]
        const d = invert ? Math.min(1, Math.abs(bg - l) / Math.max(0.25, bg)) : l
        // Below the threshold the backdrop stays empty; a gamma lifts the mid-tone skin.
        base[i] = d < BACKDROP_THRESHOLD ? 0 : adjust(Math.pow(d, GAMMA), { contrast })
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      px = Math.max(4, Math.round(cs * dpr))
      atlas = buildAtlas(px)
      draw((performance.now() - t0) / 1000)
      syncLoop()
    }

    rebuild()

    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(rebuild, 150)
    })
    ro.observe(container)
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1]?.isIntersecting ?? true
      syncLoop()
    })
    io.observe(container)
    document.addEventListener('visibilitychange', syncLoop)

    return () => {
      stop()
      window.clearTimeout(resizeTimer)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', syncLoop)
    }
  }, [loadId, cellSize, charset, contrast, invert, animate])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={alt}
      className={cn('relative isolate overflow-hidden bg-background', className)}
    >
      <img
        ref={imgRef}
        src={currentSrc}
        alt=""
        aria-hidden="true"
        onLoad={() => setLoadId((n) => n + 1)}
        onError={() => {
          if (fallbackSrc && currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc)
        }}
        className="absolute inset-0 size-full object-cover object-top opacity-[0.225] blur-[2px] grayscale"
      />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(7, 8, 28, 0.58) 80%, rgba(7, 8, 28, 0.95) 100%)',
        }}
      />
      {grainUrl ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.32] mix-blend-overlay"
          style={{ backgroundImage: `url(${grainUrl})`, backgroundSize: `${GRAIN_SIZE}px` }}
        />
      ) : null}
    </div>
  )
}
