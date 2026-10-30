import { CornerFrame, Reveal, TerminalCard } from '@/components/layout'
import { AsciiPortrait } from '@/components/ui/ascii-portrait'
import { useContent } from '@/hooks/useContent'
import { useLocale } from '@/hooks/useLocale'

const buttonBase =
  'inline-flex min-h-11 items-center justify-center rounded-md px-6 font-mono text-sm tracking-wide uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

export function Hero() {
  const { locale } = useLocale()
  const { hero, contact } = useContent()

  return (
    <section
      id="inicio"
      className="mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-10 px-6 py-24 lg:grid-cols-2 lg:gap-12 lg:px-24"
    >
      <Reveal className="order-first mx-auto w-full max-w-[420px] lg:order-last lg:mr-0 lg:ml-auto lg:max-w-none lg:w-[min(100%,calc(80vh*0.8))]">
        <CornerFrame className="p-2">
          <AsciiPortrait
            src="/images/diego-portrait.webp"
            fallbackSrc="/images/diego-portrait.jpg"
            maskSrc="/images/diego-portrait-mask.png"
            alt={hero.portraitAlt}
            className="aspect-[4/5] w-full"
          />
        </CornerFrame>
      </Reveal>

      <div className="flex min-w-0 flex-col gap-8">
        <Reveal className="flex flex-col gap-4">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            {`// ${hero.eyebrow}`}
          </p>
          <h1 className="font-display text-[clamp(2.75rem,12vw,4.5rem)] leading-[0.9] font-bold tracking-tight uppercase lg:text-[clamp(3rem,5.2vw,5rem)]">
            <span className="block text-foreground">{hero.line1}</span>
            <span className="block text-muted-foreground">{hero.line2}</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
            {hero.summary}
          </p>
        </Reveal>
        <Reveal delay={0.2} className="flex flex-wrap gap-3">
          <a
            href="#proyectos"
            className={`${buttonBase} bg-accent-electric text-white hover:brightness-125`}
          >
            {hero.primaryCta}
          </a>
          <a
            href={contact.cv[locale]}
            download
            className={`${buttonBase} border border-line text-foreground hover:bg-card`}
          >
            {hero.secondaryCta}
          </a>
        </Reveal>
        <Reveal delay={0.3}>
          <TerminalCard
            className="max-w-xl"
            title={hero.terminal.title}
            command={hero.terminal.command}
            lines={hero.terminal.lines}
          />
        </Reveal>
      </div>
    </section>
  )
}
