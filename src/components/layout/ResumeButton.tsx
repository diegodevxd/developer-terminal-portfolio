interface ResumeButtonProps {
  href: string
  label?: string
}

export function ResumeButton({ href, label = 'CV ↓' }: ResumeButtonProps) {
  return (
    <a
      href={href}
      download
      className="fixed right-8 bottom-8 z-40 hidden border border-line bg-card px-4 py-2 font-mono text-xs tracking-widest text-foreground uppercase transition-colors hover:bg-accent-electric focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:block"
    >
      {label}
    </a>
  )
}
