import { useEffect } from 'react'

import {
  Footer,
  Navbar,
  Reveal,
  ResumeButton,
  SectionHeading,
  SiteFrame,
  SocialRail,
  TerminalCard,
} from '@/components/layout'
import type { SectionHeadingContent } from '@/content/types'
import { useContent } from '@/hooks/useContent'
import { useLocale } from '@/hooks/useLocale'

export default function App() {
  const { locale } = useLocale()
  const content = useContent()
  const { meta, nav, hero, contact, ui } = content

  useEffect(() => {
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
  }, [meta])

  // Temporary skeleton until F3/F4 replace each section with its feature component.
  const headings: Record<string, SectionHeadingContent> = {
    inicio: { eyebrow: hero.eyebrow, line1: hero.line1, line2: hero.line2 },
    'open-source': content.openSource.heading,
    experiencia: content.experience.heading,
    proyectos: content.projects.heading,
    contacto: contact.heading,
  }

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
        {nav.map(({ id }) => {
          const heading = headings[id]
          if (!heading) return null
          return (
            <section
              key={id}
              id={id}
              className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center gap-10 px-6 py-24 lg:px-24"
            >
              <Reveal>
                <SectionHeading {...heading} />
              </Reveal>
              {id === 'inicio' ? (
                <Reveal delay={0.1}>
                  <TerminalCard
                    className="max-w-xl"
                    title={hero.terminal.title}
                    command={hero.terminal.command}
                    lines={hero.terminal.lines}
                  />
                </Reveal>
              ) : null}
            </section>
          )
        })}
      </main>
      <Footer text={content.footer.text} />
    </SiteFrame>
  )
}
