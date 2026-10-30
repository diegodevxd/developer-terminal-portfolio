import { Check, Copy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Reveal, Section, SectionHeading } from '@/components/layout'
import { useContent } from '@/hooks/useContent'

const FEEDBACK_MS = 2000

const linkClass =
  'inline-flex min-h-11 items-center justify-center rounded-md border border-line px-5 font-mono text-sm tracking-wide text-foreground uppercase transition-colors hover:border-accent hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

function legacyCopy(text: string): boolean {
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = typeof document.execCommand === 'function' && document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

export function Contact() {
  const { contact, ui } = useContent()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contact.email)
    } catch {
      // Clipboard API unavailable or denied: try the legacy copy command.
      if (!legacyCopy(contact.email)) return
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), FEEDBACK_MS)
  }, [contact.email])

  return (
    <Section id="contacto">
      <Reveal className="flex flex-col gap-6">
        <SectionHeading {...contact.heading} className="[&_h2]:text-[clamp(3rem,13vw,11rem)]" />
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
          {contact.intro}
        </p>
      </Reveal>
      <Reveal delay={0.1} className="flex flex-col gap-6">
        <button
          type="button"
          onClick={copyEmail}
          aria-label={`${ui.copyEmail}: ${contact.email}`}
          className="flex min-h-16 w-full max-w-full items-center justify-between gap-4 rounded-md bg-accent-electric px-5 py-4 text-left font-mono text-base text-white transition-[filter] hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-fit sm:text-xl md:px-8"
        >
          <span className="min-w-0 break-all">{contact.email}</span>
          {copied ? (
            <Check className="size-5 shrink-0" aria-hidden="true" />
          ) : (
            <Copy className="size-5 shrink-0" aria-hidden="true" />
          )}
        </button>
        <p aria-live="polite" className="min-h-5 font-mono text-xs text-ok">
          {copied ? ui.copied : ''}
        </p>
        <div className="flex flex-wrap gap-3">
          <a href={contact.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {ui.github}
          </a>
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {ui.linkedin}
          </a>
          <a href={contact.cv.es} download className={linkClass}>
            {ui.downloadCvEs}
          </a>
          <a href={contact.cv.en} download className={linkClass}>
            {ui.downloadCvEn}
          </a>
        </div>
      </Reveal>
    </Section>
  )
}
