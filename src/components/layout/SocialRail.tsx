import { Mail } from 'lucide-react'
import { siGithub } from 'simple-icons'

interface SocialRailProps {
  github: string
  linkedin: string
  email: string
  labels: { nav: string; github: string; linkedin: string; email: string }
}

const linkClass =
  'grid size-9 place-items-center text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'

// LinkedIn is not part of simple-icons (removed upstream) nor lucide: inline glyph path.
const LINKEDIN_PATH =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'

function BrandIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
      <path d={path} />
    </svg>
  )
}

export function SocialRail({ github, linkedin, email, labels }: SocialRailProps) {
  return (
    <nav
      aria-label={labels.nav}
      className="fixed top-1/2 left-8 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
    >
      <span aria-hidden="true" className="h-12 w-px bg-line" />
      <a
        href={github}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={labels.github}
        className={linkClass}
      >
        <BrandIcon path={siGithub.path} />
      </a>
      <a
        href={linkedin}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={labels.linkedin}
        className={linkClass}
      >
        <BrandIcon path={LINKEDIN_PATH} />
      </a>
      <a href={`mailto:${email}`} aria-label={labels.email} className={linkClass}>
        <Mail className="size-5" aria-hidden="true" />
      </a>
      <span aria-hidden="true" className="h-12 w-px bg-line" />
    </nav>
  )
}
