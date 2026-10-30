import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  line1: string
  line2: string
  id?: string
  className?: string
}

export function SectionHeading({ eyebrow, line1, line2, id, className }: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {eyebrow ? (
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {`// ${eyebrow}`}
        </p>
      ) : null}
      <h2
        id={id}
        className="font-display text-[clamp(2.25rem,9vw,8rem)] leading-[0.9] font-bold tracking-tight uppercase"
      >
        <span className="block text-foreground">{line1}</span>
        <span className="block text-muted-foreground">{line2}</span>
      </h2>
    </div>
  )
}
