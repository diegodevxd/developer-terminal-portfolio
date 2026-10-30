import { Briefcase, FolderGit2, GitPullRequest, Home, Mail, type LucideIcon } from 'lucide-react'

import { useActiveSection } from '@/hooks/useActiveSection'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/lib/utils'

export interface NavItem {
  id: string
  label: string
}

const ICONS: Record<string, LucideIcon> = {
  inicio: Home,
  'open-source': GitPullRequest,
  experiencia: Briefcase,
  proyectos: FolderGit2,
  contacto: Mail,
}

export function Navbar({ items }: { items: readonly NavItem[] }) {
  const active = useActiveSection(items.map((item) => item.id))
  const { locale, setLocale } = useLocale()

  return (
    <header className="fixed inset-x-0 top-5 z-40 flex justify-center px-3">
      <nav
        aria-label="Principal"
        className="flex max-w-full items-center gap-1 rounded-full border border-line bg-card/80 p-1 backdrop-blur-md"
      >
        <ul className="flex items-center gap-0.5">
          {items.map((item) => {
            const Icon = ICONS[item.id] ?? Home
            const isActive = active === item.id
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-label={item.label}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-2 font-mono text-xs tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                    isActive
                      ? 'bg-accent-electric text-white'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{item.label}</span>
                </a>
              </li>
            )
          })}
        </ul>
        <button
          type="button"
          onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
          aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a español'}
          className="ml-1 rounded-full border border-line px-3 py-2 font-mono text-xs tracking-wide text-foreground uppercase transition-colors hover:bg-accent-electric focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {locale === 'es' ? 'ES' : 'EN'}
        </button>
      </nav>
    </header>
  )
}
