import { lazy, Suspense, useEffect } from 'react'

import {
  Footer,
  Navbar,
  Reveal,
  ResumeButton,
  Section,
  SectionHeading,
  SiteFrame,
  SocialRail,
} from '@/components/layout'
import { About } from '@/features/about'
import { Contact } from '@/features/contact'
import { Experience } from '@/features/experience'
import { Hero } from '@/features/hero'
import { OpenSource } from '@/features/open-source'
import { Stack } from '@/features/stack'
import { useContent } from '@/hooks/useContent'
import { useLocale } from '@/hooks/useLocale'

// Lazy: keeps the carousel engine out of the initial bundle.
const Projects = lazy(() => import('@/features/projects').then((m) => ({ default: m.Projects })))

export default function App() {
  const { locale } = useLocale()
  const content = useContent()
  const { meta, nav, contact, ui } = content

  useEffect(() => {
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
  }, [meta])

  return (
    <SiteFrame>
      <Navbar
        items={nav}
        labels={{
          navAria: ui.navAria,
          languageAria: ui.languageAria,
          languageNames: ui.languageNames,
          openMenu: ui.openMenu,
          closeMenu: ui.closeMenu,
        }}
      />
      <SocialRail
        github={contact.github}
        linkedin={contact.linkedin}
        email={contact.email}
        labels={{
          nav: ui.socialAria,
          github: ui.github,
          linkedin: ui.linkedin,
          email: ui.email,
        }}
      />
      <ResumeButton href={contact.cv[locale]} label={ui.resume} />
      <main>
        <Hero />
        <About />
        <OpenSource />
        <Experience />
        <Suspense
          fallback={
            <Section id="proyectos">
              <Reveal>
                <SectionHeading {...content.projects.heading} />
              </Reveal>
              <div className="h-[clamp(560px,92svh,820px)]" aria-hidden="true" />
            </Section>
          }
        >
          <Projects />
        </Suspense>
        <Stack />
        <Contact />
      </main>
      <Footer text={content.footer.text} />
    </SiteFrame>
  )
}
