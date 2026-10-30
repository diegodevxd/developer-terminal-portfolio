import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LocaleProvider } from '@/app/providers'
import { es } from '@/content/es'

import { Projects } from './Projects'

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

describe('Projects', () => {
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
  })
  afterEach(() => vi.unstubAllGlobals())

  function setup() {
    render(
      <LocaleProvider>
        <Projects />
      </LocaleProvider>,
    )
  }

  it('renders a card list and no carousel below 720px', () => {
    stubMatchMedia(false)
    setup()
    expect(screen.queryByRole('region', { name: es.projects.labels.carouselAria })).toBeNull()
    for (const project of es.projects.projects) {
      expect(screen.getByText(project.title)).not.toBeNull()
    }
  })

  it('renders the carousel from 720px up', () => {
    stubMatchMedia(true)
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    setup()
    expect(screen.getByRole('region', { name: es.projects.labels.carouselAria })).not.toBeNull()
  })
})
