import type { StackItem } from '@/content/types'

import { getIconPath } from './icons'

export function TechBadge({ name, slug }: StackItem) {
  const path = getIconPath(slug)

  return (
    <span className="inline-flex min-h-9 items-center gap-2 rounded-md border border-line bg-card px-3 py-1.5 text-sm text-foreground">
      {path ? (
        <svg
          viewBox="0 0 24 24"
          role="img"
          aria-hidden="true"
          className="size-4 shrink-0 fill-foreground"
          data-testid="tech-icon"
        >
          <path d={path} />
        </svg>
      ) : null}
      {name}
    </span>
  )
}
