import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const corner = 'pointer-events-none absolute size-3.5 border-foreground'

export function CornerFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative border border-line p-6', className)}>
      <span aria-hidden="true" className={cn(corner, '-top-px -left-px border-t-2 border-l-2')} />
      <span aria-hidden="true" className={cn(corner, '-top-px -right-px border-t-2 border-r-2')} />
      <span
        aria-hidden="true"
        className={cn(corner, '-bottom-px -left-px border-b-2 border-l-2')}
      />
      <span
        aria-hidden="true"
        className={cn(corner, '-right-px -bottom-px border-r-2 border-b-2')}
      />
      {children}
    </div>
  )
}
