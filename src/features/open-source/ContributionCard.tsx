import { ExternalLink } from 'lucide-react'

import { CornerFrame } from '@/components/layout'
import type { Contribution } from '@/content/types'

interface ContributionCardProps {
  contribution: Contribution
  openExternalLabel: string
}

export function ContributionCard({ contribution, openExternalLabel }: ContributionCardProps) {
  const { project, driver, language, title, plain, technical, status, links } = contribution
  const meta = [project, driver, language].filter(Boolean).join(' · ')

  return (
    <CornerFrame className="group flex h-full flex-col gap-4 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent md:p-8">
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{meta}</p>
      <h3 className="font-display text-2xl leading-tight font-semibold tracking-tight uppercase md:text-3xl">
        {title}
      </h3>
      <p className="text-base leading-relaxed text-foreground">{plain}</p>
      <p className="font-mono text-xs leading-relaxed text-muted-foreground">{technical}</p>
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
        <span className="rounded-full border border-accent bg-accent/15 px-3 py-1 font-mono text-xs tracking-wide text-foreground uppercase">
          {status}
        </span>
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-foreground underline-offset-4 hover:text-accent-electric hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {link.label}
            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="sr-only">{openExternalLabel}</span>
          </a>
        ))}
      </div>
    </CornerFrame>
  )
}
