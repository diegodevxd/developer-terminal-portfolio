import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/app/providers'
import { es } from '@/content/es'

import { Contact } from './Contact'

function setup() {
  render(
    <LocaleProvider>
      <Contact />
    </LocaleProvider>,
  )
  return screen.getByRole('button', { name: new RegExp(es.contact.email) })
}

function mockClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

describe('Contact copy button', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return []
        }
      },
    )
    window.localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('copies the email and shows then hides the feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)
    const button = setup()
    await act(async () => {
      fireEvent.click(button)
    })
    expect(writeText).toHaveBeenCalledWith(es.contact.email)
    expect(screen.getByText(es.ui.copied)).not.toBeNull()
    act(() => {
      vi.advanceTimersByTime(2100)
    })
    expect(screen.queryByText(es.ui.copied)).toBeNull()
  })

  it('does not crash and shows no feedback when the clipboard throws', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    mockClipboard(writeText)
    Object.defineProperty(document, 'execCommand', { value: undefined, configurable: true })
    const button = setup()
    await act(async () => {
      fireEvent.click(button)
    })
    expect(writeText).toHaveBeenCalled()
    expect(screen.queryByText(es.ui.copied)).toBeNull()
  })

  it('uses the legacy copy command as a fallback', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    mockClipboard(writeText)
    const exec = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', { value: exec, configurable: true })
    const button = setup()
    await act(async () => {
      fireEvent.click(button)
    })
    expect(exec).toHaveBeenCalledWith('copy')
    expect(screen.getByText(es.ui.copied)).not.toBeNull()
  })
})
