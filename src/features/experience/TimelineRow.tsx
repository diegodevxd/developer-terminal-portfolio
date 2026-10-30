import { Reveal } from '@/components/layout'
import type { TimelineEntry } from '@/content/types'

export function TimelineRow({ entry }: { entry: TimelineEntry }) {
  const { period, role, org, place, bullets } = entry

  return (
    <li className="relative border-l border-line pb-16 pl-8 last:pb-0 lg:pl-10">
      <span
        aria-hidden="true"
        className="absolute top-2 -left-[5px] size-2.5 rounded-full bg-accent-electric"
      />
      <Reveal className="flex flex-col lg:grid lg:grid-cols-[minmax(14rem,1fr)_auto_1.4fr] lg:items-start lg:gap-10">
        <div className="order-2 mt-4 flex min-w-0 flex-col gap-1 lg:order-1 lg:mt-3">
          <h3 className="font-display text-2xl leading-tight font-semibold tracking-tight text-accent-electric uppercase">
            {role}
          </h3>
          <p className="font-mono text-xs tracking-wide text-foreground">{org}</p>
          {place ? <p className="font-mono text-xs text-muted-foreground">{place}</p> : null}
        </div>
        <p className="order-1 font-display text-[clamp(2.5rem,9vw,5.5rem)] leading-none font-bold tracking-tight text-foreground uppercase lg:order-2 lg:whitespace-nowrap lg:text-center lg:text-[clamp(2.25rem,3.6vw,4rem)]">
          {period}
        </p>
        <ul className="order-3 mt-4 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-line lg:mt-3">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </Reveal>
    </li>
  )
}
