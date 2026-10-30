import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useMediaQuery } from './useMediaQuery'

type Listener = () => void

function mockMatchMedia(initial: boolean) {
  let matches = initial
  const listeners = new Set<Listener>()
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return matches
    },
    media: query,
    addEventListener: (_: string, l: Listener) => listeners.add(l),
    removeEventListener: (_: string, l: Listener) => listeners.delete(l),
  }))
  return {
    set(value: boolean) {
      matches = value
      listeners.forEach((l) => l())
    },
    count: () => listeners.size,
  }
}

describe('useMediaQuery', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns the current match and reacts to change events', () => {
    const mq = mockMatchMedia(false)
    const { result, unmount } = renderHook(() => useMediaQuery('(min-width: 720px)'))
    expect(result.current).toBe(false)
    act(() => mq.set(true))
    expect(result.current).toBe(true)
    unmount()
    expect(mq.count()).toBe(0)
  })

  it('falls back to false without matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined)
    const { result } = renderHook(() => useMediaQuery('(min-width: 720px)'))
    expect(result.current).toBe(false)
  })
})
