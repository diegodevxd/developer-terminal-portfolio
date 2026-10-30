import { cn } from '@/lib/utils'

interface TerminalCardProps {
  command: string
  lines: string[]
  className?: string
}

export function TerminalCard({ command, lines, className }: TerminalCardProps) {
  return (
    <div
      className={cn(
        'w-full max-w-full overflow-hidden rounded-lg border border-line bg-[#050614] font-mono text-sm',
        className,
      )}
    >
      <div className="relative flex items-center gap-1.5 border-b border-line px-4 py-2.5">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span aria-hidden="true" className="size-2.5 rounded-full bg-[#febc2e]" />
        <span aria-hidden="true" className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="absolute inset-x-0 text-center text-xs text-muted-foreground">
          Terminal — zsh
        </span>
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        <p className="text-foreground">
          <span className="text-muted-foreground">~ % </span>
          {command}
        </p>
        {lines.map((line) => (
          <p key={line} className="flex gap-2 break-words text-foreground">
            <span aria-hidden="true" className="text-ok">
              ✓
            </span>
            <span className="min-w-0">{line}</span>
          </p>
        ))}
      </div>
    </div>
  )
}
