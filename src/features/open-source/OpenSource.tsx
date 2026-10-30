import { Reveal, Section, SectionHeading } from '@/components/layout'
import { useContent } from '@/hooks/useContent'

import { ContributionCard } from './ContributionCard'

export function OpenSource() {
  const { openSource, ui } = useContent()

  return (
    <Section id="open-source" className="gap-16 md:gap-20">
      <Reveal className="flex flex-col gap-6">
        <SectionHeading {...openSource.heading} />
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
          {openSource.intro}
        </p>
      </Reveal>
      <ul className="grid gap-8 md:grid-cols-2 md:gap-10">
        {openSource.contributions.map((contribution, index) => (
          <li key={contribution.title}>
            <Reveal delay={(index % 2) * 0.1} className="h-full">
              <ContributionCard contribution={contribution} openExternalLabel={ui.openExternal} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
