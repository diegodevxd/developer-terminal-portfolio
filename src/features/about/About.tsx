import { CornerFrame, Reveal, Section, SectionHeading } from '@/components/layout'
import { useContent } from '@/hooks/useContent'

export function About() {
  const { about } = useContent()

  return (
    <Section id="sobre-mi">
      <Reveal>
        <SectionHeading {...about.heading} />
      </Reveal>
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="flex flex-col gap-6">
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-prose text-base leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6">
            {about.facts.map((fact) => (
              <div key={fact.label} className="flex min-w-0 flex-col gap-1">
                <dt className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  {fact.label}
                </dt>
                <dd className="text-sm text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col gap-4">
          <h3 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            {`// ${about.lookingFor.title}`}
          </h3>
          <ul className="flex flex-col gap-3">
            {about.lookingFor.items.map((item) => (
              <li key={item}>
                <CornerFrame className="p-4 text-sm leading-relaxed text-foreground">
                  {item}
                </CornerFrame>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  )
}
