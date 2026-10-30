import { useEffect, useState } from 'react'

export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? '')
  const key = ids.join('|')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const sectionIds = key.split('|').filter(Boolean)
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [key])

  return active
}
