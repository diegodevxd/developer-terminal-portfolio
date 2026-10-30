export const CHARSETS = {
  standard: ' .:-=+*#%@',
} as const

export type CharsetName = keyof typeof CHARSETS

export interface AdjustOptions {
  /** -1..1, 0 = neutral */
  brightness?: number
  /** 0..255, 128 = neutral */
  contrast?: number
}

export interface Grid {
  cols: number
  rows: number
  values: Float32Array
  /** Mean mask value per cell (0..1); only present when a mask buffer is given. */
  mask?: Float32Array
}

export interface SubjectOptions {
  /** Luminance mapped to the lowest density (subject-relative). */
  low?: number
  /** Luminance mapped to the highest density. */
  high?: number
  /** Minimum density of any subject cell, so dark hair and clothes keep a silhouette. */
  floor?: number
  /** < 1 lifts mid-tones. */
  gamma?: number
  /** 0..255, 128 = neutral. */
  contrast?: number
}

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

/** Relative luminance (Rec. 709) of 0..255 channels, returned in 0..1. */
export function luminance(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

/** Applies brightness and contrast to a 0..1 value. Contrast 128 is identity. */
export function adjust(l: number, { brightness = 0, contrast = 128 }: AdjustOptions = {}): number {
  // Map 0..255 (128 neutral) to a gain factor; 0 flattens, 255 is ~ x3.
  const c = Math.max(0, Math.min(255, contrast))
  const gain = c <= 128 ? c / 128 : 1 + ((c - 128) / 127) * 2
  return clamp01((l - 0.5) * gain + 0.5 + brightness)
}

/** Mean luminance per cell of an RGBA buffer. */
export function sampleGrid(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  cellSize: number,
  maskData?: Uint8ClampedArray,
): Grid {
  const cols = Math.max(1, Math.floor(width / cellSize))
  const rows = Math.max(1, Math.floor(height / cellSize))
  const values = new Float32Array(cols * rows)
  const mask = maskData ? new Float32Array(cols * rows) : undefined
  for (let row = 0; row < rows; row++) {
    const y0 = Math.floor((row * height) / rows)
    const y1 = Math.max(y0 + 1, Math.floor(((row + 1) * height) / rows))
    for (let col = 0; col < cols; col++) {
      const x0 = Math.floor((col * width) / cols)
      const x1 = Math.max(x0 + 1, Math.floor(((col + 1) * width) / cols))
      let sum = 0
      let maskSum = 0
      let count = 0
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * width + x) * 4
          sum += luminance(data[i], data[i + 1], data[i + 2])
          if (maskData) maskSum += maskData[i] / 255
          count++
        }
      }
      values[row * cols + col] = count ? sum / count : 0
      if (mask) mask[row * cols + col] = count ? maskSum / count : 0
    }
  }
  return { cols, rows, values, mask }
}

/**
 * Glyph density (0..1) of a cell: 0 outside the subject, otherwise a positive photographic
 * mapping of the subject's own luminance (bright skin -> dense glyph) above a floor.
 */
export function subjectDensity(
  l: number,
  mask: number,
  { low = 0, high = 1, floor = 0.18, gamma = 1, contrast = 128 }: SubjectOptions = {},
): number {
  if (mask < 0.5) return 0
  const norm = clamp01((l - low) / Math.max(1e-6, high - low))
  const curved = adjust(Math.pow(norm, gamma), { contrast })
  return floor + (1 - floor) * curved
}

/** Picks the glyph for a 0..1 value. Dark to light by default. */
export function glyphFor(value: number, charset: string, invert = false): string {
  const v = clamp01(value)
  const index = Math.round((invert ? 1 - v : v) * (charset.length - 1))
  return charset.charAt(index)
}

/** Diagonal travelling wave (0..1) at diagonal index `diag` = col + row. */
export function waveAt(t: number, diag: number, speed = 1, k = 0.35): number {
  return 0.5 + 0.5 * Math.sin(t * speed - diag * k)
}

/** Modulates a 0..1 value with a precomputed wave sample. */
export function applyWave(value: number, wave: number, intensity: number): number {
  // Dips at most 40% * intensity so the wave never hides facial detail.
  return clamp01(value * (1 - intensity * 0.4 * (1 - wave)))
}

/** Diagonal travelling wave that modulates a 0..1 value. */
export function shimmer(
  value: number,
  col: number,
  row: number,
  t: number,
  intensity: number,
  speed = 1,
  k = 0.35,
): number {
  return applyWave(value, waveAt(t, col + row, speed, k), intensity)
}

/** Deterministic grayscale noise (mulberry32 PRNG), size x size pixels as RGBA. */
export function noiseTile(size: number, seed: number): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(size * size * 4)
  let a = seed >>> 0
  for (let i = 0; i < size * size; i++) {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    const v = Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * 256)
    out[i * 4] = v
    out[i * 4 + 1] = v
    out[i * 4 + 2] = v
    out[i * 4 + 3] = 255
  }
  return out
}
