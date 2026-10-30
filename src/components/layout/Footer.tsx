export function Footer({ text }: { text: string }) {
  return (
    <footer className="border-t border-line px-6 py-8 text-center font-mono text-xs text-muted-foreground">
      {text}
    </footer>
  )
}
