import type { ReactNode } from 'react'

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh w-full bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 border-[6px] border-accent-electric"
      />
      {children}
    </div>
  )
}
