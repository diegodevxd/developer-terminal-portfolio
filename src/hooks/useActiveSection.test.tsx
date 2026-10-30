import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { pickActiveSection, useActiveSection } from './useActiveSection'

describe('pickActiveSection', () => {
  const tops: Record<string, number> = { a: -900, b: -300, c: 250, d: 900 }
  const getTop = (id: string) => tops[id] ?? null

  it('picks the last section above the 40% line', () => {
    // viewport 1000 -> line at 400: a, b and c crossed it, d did not.
    expect(pickActiveSection(['a', 'b', 'c', 'd'], getTop, 1000)).toBe('c')
  })

  it('falls back to the first id before anything crosses the line', () => {
    expect(pickActiveSection(['c', 'd'], (id) => (id === 'c' ? 700 : 900), 1000)).toBe('c')
  })

  it('ignores ids that are not mounted (yet)', () => {
    expect(pickActiveSection(['a', 'missing', 'b'], getTop, 1000)).toBe('b')
  })
})

describe('useActiveSection', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  function Probe({ ids }: { ids: string[] }) {
    return <output>{useActiveSection(ids)}</output>
  }

  function mountSection(id: string, top: number) {
    const el = document.createElement('section')
    el.id = id
    el.getBoundingClientRect = () => ({ top }) as DOMRect
    document.body.appendChild(el)
  }

  it('activates a section that mounts after the hook (lazy) on the next scroll', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 1
    })
    mountSection('inicio', -800)
    const { container } = render(<Probe ids={['inicio', 'proyectos']} />)
    expect(container.querySelector('output')?.textContent).toBe('inicio')

    mountSection('proyectos', 100)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(container.querySelector('output')?.textContent).toBe('proyectos')
  })
})
