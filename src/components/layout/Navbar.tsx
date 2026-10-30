import {
  Briefcase,
  FolderGit2,
  GitPullRequest,
  Home,
  Mail,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { useActiveSection } from '@/hooks/useActiveSection'
import { useLocale, type Locale } from '@/hooks/useLocale'
import { cn } from '@/lib/utils'

export interface NavItem {
  id: string
  label: string
}

export interface NavbarLabels {
  navAria: string
  languageAria: string
  languageNames: Record<Locale, string>
  openMenu: string
  closeMenu: string
}

interface NavbarProps {
  items: readonly NavItem[]
  labels: NavbarLabels
}

const ICONS: Record<string, LucideIcon> = {
  inicio: Home,
  'open-source': GitPullRequest,
  experiencia: Briefcase,
  proyectos: FolderGit2,
  contacto: Mail,
}

const LOCALES: readonly Locale[] = ['es', 'en']

export function Navbar({ items, labels }: NavbarProps) {
  const active = useActiveSection(items.map((item) => item.id))
  const { locale, setLocale } = useLocale()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className="fixed inset-x-0 top-4 z-40 flex justify-center px-3 sm:top-5">
      <nav
        aria-label={labels.navAria}
        className="relative flex max-w-full items-center gap-1 rounded-full border border-line bg-card/80 p-1 backdrop-blur-md"
      >
        <ul className="hidden items-center gap-0.5 sm:flex">
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
                  <span className="hidden md:inline">{item.label}</span>
                </a>
              </li>
            )
          })}
        </ul>

        <div
          role="group"
          aria-label={labels.languageAria}
          className="flex items-center rounded-full border border-line p-0.5 font-mono text-xs sm:ml-1"
        >
          {LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              lang={option}
              onClick={() => setLocale(option)}
              aria-pressed={locale === option}
              aria-label={labels.languageNames[option]}
              className={cn(
                'rounded-full px-2.5 py-1.5 tracking-wide uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                locale === option
                  ? 'bg-accent-electric text-white'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? labels.closeMenu : labels.openMenu}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-foreground transition-colors hover:bg-accent-electric focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:hidden"
        >
          {open ? (
            <X className="size-4" aria-hidden="true" />
          ) : (
            <Menu className="size-4" aria-hidden="true" />
          )}
        </button>

        {open ? (
          <ul
            id="mobile-nav"
            className="absolute inset-x-0 top-full mt-2 rounded-2xl border border-line bg-card/95 p-2 backdrop-blur-md sm:hidden"
          >
            {items.map((item) => {
              const Icon = ICONS[item.id] ?? Home
              const isActive = active === item.id
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-xs tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                      isActive
                        ? 'bg-accent-electric text-white'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        ) : null}
      </nav>
    </header>
  )
}
