import { describe, expect, it } from 'vitest'

import { CHARSETS, adjust, glyphFor, luminance, noiseTile, sampleGrid, shimmer } from './engine'

describe('luminance', () => {
  it('returns the extremes', () => {
    expect(luminance(0, 0, 0)).toBe(0)
    expect(luminance(255, 255, 255)).toBeCloseTo(1, 5)
  })
  it('weights green more than blue', () => {
    expect(luminance(0, 255, 0)).toBeGreaterThan(luminance(0, 0, 255))
  })
})

describe('adjust', () => {
  it('is identity at neutral contrast', () => {
    for (const v of [0, 0.2, 0.5, 0.9, 1]) expect(adjust(v, { contrast: 128 })).toBeCloseTo(v, 6)
  })
  it('clamps to 0..1', () => {
    expect(adjust(1, { brightness: 1 })).toBe(1)
    expect(adjust(0, { brightness: -1 })).toBe(0)
    expect(adjust(0.9, { contrast: 255 })).toBeLessThanOrEqual(1)
  })
  it('higher contrast pushes values apart', () => {
    expect(adjust(0.7, { contrast: 200 })).toBeGreaterThan(0.7)
  })
})

describe('sampleGrid', () => {
  it('averages cells of a synthetic 4x4 image', () => {
    const data = new Uint8ClampedArray(4 * 4 * 4)
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const i = (y * 4 + x) * 4
        const v = x < 2 ? 0 : 255
        data[i] = v
        data[i + 1] = v
        data[i + 2] = v
        data[i + 3] = 255
      }
    }
    const grid = sampleGrid(data, 4, 4, 2)
    expect(grid.cols).toBe(2)
    expect(grid.rows).toBe(2)
    expect(Array.from(grid.values)).toEqual([0, 1, 0, 1].map((n) => expect.closeTo(n, 4)))
  })
})

describe('glyphFor', () => {
  const set = CHARSETS.standard
  it('maps extremes', () => {
    expect(glyphFor(0, set)).toBe(' ')
    expect(glyphFor(1, set)).toBe('@')
  })
  it('inverts', () => {
    expect(glyphFor(0, set, true)).toBe('@')
    expect(glyphFor(1, set, true)).toBe(' ')
  })
})

describe('shimmer', () => {
  it('stays within 0..1', () => {
    for (let t = 0; t < 20; t += 0.7) {
      for (const v of [0, 0.4, 1]) {
        const s = shimmer(v, 3, 5, t, 0.6)
        expect(s).toBeGreaterThanOrEqual(0)
        expect(s).toBeLessThanOrEqual(1)
      }
    }
  })
})

describe('noiseTile', () => {
  it('is deterministic per seed', () => {
    expect(noiseTile(8, 42)).toEqual(noiseTile(8, 42))
    expect(noiseTile(8, 42)).not.toEqual(noiseTile(8, 43))
  })
  it('has the right length', () => {
    expect(noiseTile(8, 1)).toHaveLength(8 * 8 * 4)
  })
})
