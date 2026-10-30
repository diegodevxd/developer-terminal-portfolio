import { useEffect, useState } from 'react'

/** Fraction of the viewport height where the "reading line" sits. */
const LINE = 0.4

/** Last section whose top has crossed the reading line; the first id if none has. */
export function pickActiveSection(
  ids: readonly string[],
  getTop: (id: string) => number | null,
  viewportHeight: number,
): string {
  let current = ids[0] ?? ''
  for (const id of ids) {
    const top = getTop(id)
    if (top !== null && top <= viewportHeight * LINE) current = id
  }
  return current
}

/**
 * Scroll-spy driven by a line at ~40% of the viewport. Elements are looked up on every
 * pass, so sections that mount late (React.lazy) are picked up as soon as the layout changes.
 */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? '')
  const key = ids.join('|')

  useEffect(() => {
    const sectionIds = key.split('|').filter(Boolean)
    let frame = 0

    const update = () => {
      frame = 0
      const next = pickActiveSection(
        sectionIds,
        (id) => document.getElementById(id)?.getBoundingClientRect().top ?? null,
        window.innerHeight,
      )
      setActive(next)
    }
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Layout shifts (lazy sections mounting, fonts loading) move the sections without scrolling.
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    resizeObserver?.observe(document.body)

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      resizeObserver?.disconnect()
    }
  }, [key])

  return active
}
