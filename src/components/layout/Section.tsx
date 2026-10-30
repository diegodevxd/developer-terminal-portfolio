import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SectionProps {
  id: string
  children: ReactNode
  className?: string
}

export function Section({ id, children, className }: SectionProps) {
  return (
    <section id={id} className="border-t border-line">
      <div
        className={cn(
          'mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-24 md:gap-16 md:px-8 md:py-32 lg:px-24',
          className,
        )}
      >
        {children}
      </div>
    </section>
  )
}
