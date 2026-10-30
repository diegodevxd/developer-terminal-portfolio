import { Reveal, Section, SectionHeading } from '@/components/layout'
import { useContent } from '@/hooks/useContent'

import { TimelineRow } from './TimelineRow'

export function Experience() {
  const { experience } = useContent()

  return (
    <Section id="experiencia">
      <Reveal>
        <SectionHeading {...experience.heading} />
      </Reveal>
      <ol className="flex flex-col">
        {experience.entries.map((entry) => (
          <TimelineRow key={`${entry.period}-${entry.role}`} entry={entry} />
        ))}
      </ol>
    </Section>
  )
}
