import { useMemo, useState } from 'react'

import { CornerFrame, Reveal, Section, SectionHeading } from '@/components/layout'
import DiscCascadeCarousel from '@/components/ui/disc-cascade-carousel'
import { useContent } from '@/hooks/useContent'
import { useMediaQuery } from '@/hooks/useMediaQuery'

import { ProjectDetail } from './ProjectDetail'
import { projectsToDiscItems } from './projectsToDiscItems'

export function Projects() {
  const { projects, ui } = useContent()
  const { labels } = projects
  const isDesktop = useMediaQuery('(min-width: 720px)')
  const [active, setActive] = useState(0)
  const items = useMemo(() => projectsToDiscItems(projects.projects, labels), [projects, labels])
  const current = projects.projects[active] ?? projects.projects[0]

  return (
    <Section id="proyectos">
      <Reveal>
        <SectionHeading {...projects.heading} />
      </Reveal>
      {isDesktop ? (
        <div className="flex flex-col gap-10">
          <CornerFrame className="p-0">
            <DiscCascadeCarousel
              items={items}
              height="clamp(560px, 92svh, 820px)"
              background="transparent"
              color="var(--color-foreground)"
              serif="var(--font-display)"
              display="var(--font-display)"
              sans="var(--font-sans)"
              brand="DM"
              indexLabel={labels.indexLabel}
              hint={labels.hint}
              ariaLabel={labels.carouselAria}
              labels={{
                prev: labels.prev,
                next: labels.next,
                slideOf: labels.slideOf,
                live: labels.live,
                nav: labels.navAria,
              }}
              reviews={false}
              loop
              autoplay={0}
              frame={false}
              index={active}
              defaultIndex={0}
              onIndexChange={setActive}
              onSelect={(_, index) => {
                const href = projects.projects[index]?.href
                if (href) window.open(href, '_blank', 'noopener,noreferrer')
              }}
            />
          </CornerFrame>
          {current ? (
            <CornerFrame className="p-6 md:p-8" key={current.title}>
              <div aria-live="polite">
                <ProjectDetail
                  project={current}
                  labels={labels}
                  openExternalLabel={ui.openExternal}
                />
              </div>
            </CornerFrame>
          ) : null}
        </div>
      ) : (
        <ul className="flex flex-col gap-6">
          {projects.projects.map((project) => (
            <li key={project.title}>
              <CornerFrame className="p-6">
                <ProjectDetail
                  project={project}
                  labels={labels}
                  openExternalLabel={ui.openExternal}
                />
              </CornerFrame>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
