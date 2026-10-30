import { Reveal, Section, SectionHeading } from '@/components/layout'
import { useContent } from '@/hooks/useContent'

import { TechBadge } from './TechBadge'

export function Stack() {
  const { stack, certifications } = useContent()

  return (
    <Section id="stack">
      <Reveal>
        <SectionHeading {...stack.heading} />
      </Reveal>
      <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
        {stack.groups.map((group, index) => (
          <Reveal key={group.group} delay={(index % 2) * 0.1}>
            <section className="flex flex-col gap-4">
              <h3 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {`// ${group.group}`}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <TechBadge {...item} />
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>
      <Reveal className="flex flex-col gap-4 border-t border-line pt-10">
        <h3 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {`// ${certifications.title}`}
        </h3>
        <ul className="flex flex-wrap gap-3">
          {certifications.items.map((cert) => (
            <li
              key={cert.code}
              className="flex flex-col gap-0.5 rounded-md border border-line px-4 py-3"
            >
              <span className="font-mono text-sm text-foreground">{cert.code}</span>
              <span className="text-sm text-muted-foreground">{cert.name}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {`${cert.issuer} · ${cert.year}`}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
