import { useEffect, useRef, useState } from 'react'

import {
  CHARSETS,
  noiseTile,
  sampleGrid,
  applyWave,
  waveAt,
  subjectDensity,
  type CharsetName,
} from '@/lib/ascii/engine'
import { cn } from '@/lib/utils'

interface AsciiPortraitProps {
  src: string
  alt: string
  fallbackSrc?: string
  /** Grayscale subject mask, same framing as `src` (white = subject). */
  maskSrc: string
  cellSize?: number
  charset?: CharsetName
  contrast?: number
  animate?: boolean
  className?: string
}

const MOBILE_BREAKPOINT = 640
const MOBILE_CELL_SIZE = 6
const FRAME_MS = 1000 / 30
const DENSITY_FLOOR = 0.18
// Photo-specific window: skin sits around 0.5-0.65, eyes/brows/hair far below, shirt above.
const LUMA_LOW = 0.1
const LUMA_HIGH = 0.68
const DENSITY_GAMMA = 1.3
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
  maskSrc,
  cellSize = 8,
  charset = 'standard',
  contrast = 128,
  animate = true,
  className,
}: AsciiPortraitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [loadId, setLoadId] = useState(0)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null)
  const [grainUrl] = useState(makeGrainUrl)

  useEffect(() => {
    const m = new Image()
    m.onload = () => setMaskImg(m)
    m.src = maskSrc
    return () => {
      m.onload = null
    }
  }, [maskSrc])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!container || !canvas || !img || !maskImg || loadId === 0) return
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
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const waves = new Float32Array(cols + rows)
      for (let d = 0; d < waves.length; d++) waves[d] = waveAt(t, d)
      const last = chars.length - 1
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const v = base[row * cols + col]
          if (v <= 0) continue
          const m = still ? v : applyWave(v, waves[col + row], SHIMMER_INTENSITY)
          const gi = Math.round(m * last)
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
      const draw2d = (source: HTMLImageElement) => {
        const off = document.createElement('canvas')
        off.width = w
        off.height = h
        const octx = off.getContext('2d', { willReadFrequently: true })
        if (!octx) return null
        // object-fit: cover, anchored to the top so the face is never cropped.
        const scale = Math.max(w / source.naturalWidth, h / source.naturalHeight)
        const dw = source.naturalWidth * scale
        octx.drawImage(source, (w - dw) / 2, 0, dw, source.naturalHeight * scale)
        return octx.getImageData(0, 0, w, h).data
      }
      const photo = draw2d(img)
      const maskPixels = draw2d(maskImg)
      if (!photo || !maskPixels) return
      const grid = sampleGrid(photo, w, h, cs, maskPixels)
      cols = grid.cols
      rows = grid.rows
      const mask = grid.mask ?? new Float32Array(grid.values.length)
      base = new Float32Array(grid.values.length)
      for (let i = 0; i < base.length; i++) {
        base[i] = subjectDensity(grid.values[i], mask[i], {
          low: LUMA_LOW,
          high: LUMA_HIGH,
          floor: DENSITY_FLOOR,
          gamma: DENSITY_GAMMA,
          contrast,
        })
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
  }, [loadId, maskImg, cellSize, charset, contrast, animate])

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
        width={900}
        height={1125}
        fetchPriority="high"
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
