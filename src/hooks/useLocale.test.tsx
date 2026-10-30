import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/app/providers'

import { LOCALE_STORAGE_KEY, useLocale } from './useLocale'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LocaleProvider>{children}</LocaleProvider>
)

describe('useLocale', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('defaults to es and sets the document language', () => {
    const { result } = renderHook(() => useLocale(), { wrapper })
    expect(result.current.locale).toBe('es')
    expect(document.documentElement.lang).toBe('es')
  })

  it('persists the chosen locale and restores it on mount', () => {
    const first = renderHook(() => useLocale(), { wrapper })
    act(() => first.result.current.setLocale('en'))
    expect(first.result.current.locale).toBe('en')
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    first.unmount()

    const second = renderHook(() => useLocale(), { wrapper })
    expect(second.result.current.locale).toBe('en')
  })

  it('ignores invalid stored values', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'fr')
    const { result } = renderHook(() => useLocale(), { wrapper })
    expect(result.current.locale).toBe('es')
  })

  it('falls back to es and keeps working when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    const { result } = renderHook(() => useLocale(), { wrapper })
    expect(result.current.locale).toBe('es')
    act(() => result.current.setLocale('en'))
    expect(result.current.locale).toBe('en')
  })
})
