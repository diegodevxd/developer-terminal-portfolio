import { useEffect } from 'react'

import {
  Footer,
  Navbar,
  Reveal,
  ResumeButton,
  SectionHeading,
  SiteFrame,
  SocialRail,
} from '@/components/layout'
import type { SectionHeadingContent } from '@/content/types'
import { Hero } from '@/features/hero'
import { useContent } from '@/hooks/useContent'
import { useLocale } from '@/hooks/useLocale'

export default function App() {
  const { locale } = useLocale()
  const content = useContent()
  const { meta, nav, contact, ui } = content

  useEffect(() => {
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
  }, [meta])

  // Temporary skeleton until F3/F4 replace each section with its feature component.
  const headings: Record<string, SectionHeadingContent> = {
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
          if (id === 'inicio') return <Hero key={id} />
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
            </section>
          )
        })}
      </main>
      <Footer text={content.footer.text} />
    </SiteFrame>
  )
}
