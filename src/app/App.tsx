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
import { useLocale, type Locale } from '@/hooks/useLocale'

// Temporary copy for F1. In F2 this moves to src/content/{es,en}.ts.
const PLACEHOLDER = {
  es: {
    nav: [
      { id: 'inicio', label: 'Inicio' },
      { id: 'open-source', label: 'Open Source' },
      { id: 'experiencia', label: 'Experiencia' },
      { id: 'proyectos', label: 'Proyectos' },
      { id: 'contacto', label: 'Contacto' },
    ],
    sections: {
      inicio: { eyebrow: 'León, MX · Disponible', line1: 'Desarrollador', line2: 'Full-Stack' },
      'open-source': { eyebrow: 'Contribuciones', line1: 'Open', line2: 'Source' },
      experiencia: { eyebrow: 'Trayectoria', line1: 'Mi', line2: 'Experiencia' },
      proyectos: { eyebrow: 'Trabajo', line1: 'Mis', line2: 'Proyectos' },
      contacto: { eyebrow: 'Contacto', line1: '¿Hablamos?', line2: 'Escríbeme' },
    },
    terminal: {
      command: 'whoami',
      lines: ['Texto de prueba uno', 'Texto de prueba dos', 'Texto de prueba tres'],
    },
    footer: '© Diego Mancera · Texto de prueba',
    resume: 'CV ↓',
  },
  en: {
    nav: [
      { id: 'inicio', label: 'Home' },
      { id: 'open-source', label: 'Open Source' },
      { id: 'experiencia', label: 'Experience' },
      { id: 'proyectos', label: 'Projects' },
      { id: 'contacto', label: 'Contact' },
    ],
    sections: {
      inicio: { eyebrow: 'León, MX · Available', line1: 'Full-Stack', line2: 'Developer' },
      'open-source': { eyebrow: 'Contributions', line1: 'Open', line2: 'Source' },
      experiencia: { eyebrow: 'Career', line1: 'My', line2: 'Experience' },
      proyectos: { eyebrow: 'Work', line1: 'My', line2: 'Projects' },
      contacto: { eyebrow: 'Contact', line1: "Let's talk?", line2: 'Write me' },
    },
    terminal: {
      command: 'whoami',
      lines: ['Placeholder text one', 'Placeholder text two', 'Placeholder text three'],
    },
    footer: '© Diego Mancera · Placeholder text',
    resume: 'CV ↓',
  },
} satisfies Record<Locale, unknown>

const LINKS = {
  github: 'https://github.com/',
  linkedin: 'https://www.linkedin.com/',
  email: 'diegomancera.dev@gmail.com',
  cv: { es: '/cv/Diego-Mancera-CV-ES.pdf', en: '/cv/Diego-Mancera-CV-EN.pdf' },
} as const

export default function App() {
  const { locale } = useLocale()
  const copy = PLACEHOLDER[locale]

  return (
    <SiteFrame>
      <Navbar items={copy.nav} />
      <SocialRail github={LINKS.github} linkedin={LINKS.linkedin} email={LINKS.email} />
      <ResumeButton href={LINKS.cv[locale]} label={copy.resume} />
      <main>
        {copy.nav.map(({ id }) => {
          const section = copy.sections[id as keyof typeof copy.sections]
          return (
            <section
              key={id}
              id={id}
              className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center gap-10 px-6 py-24 lg:px-24"
            >
              <Reveal>
                <SectionHeading
                  eyebrow={section.eyebrow}
                  line1={section.line1}
                  line2={section.line2}
                />
              </Reveal>
              {id === 'inicio' ? (
                <Reveal delay={0.1}>
                  <TerminalCard
                    className="max-w-xl"
                    command={copy.terminal.command}
                    lines={copy.terminal.lines}
                  />
                </Reveal>
              ) : null}
            </section>
          )
        })}
      </main>
      <Footer text={copy.footer} />
    </SiteFrame>
  )
}
