import { ExternalLink } from 'lucide-react'

import type { Project, ProjectsLabels } from '@/content/types'

interface ProjectDetailProps {
  project: Project
  labels: Pick<ProjectsLabels, 'viewRepository'>
  openExternalLabel: string
  /** Heading level: the carousel panel is an h3 under the section h2. */
  showTitle?: boolean
}

export function ProjectDetail({
  project,
  labels,
  openExternalLabel,
  showTitle = true,
}: ProjectDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      {showTitle ? (
        <h3 className="font-display text-2xl leading-tight font-semibold tracking-tight uppercase md:text-3xl">
          {project.title}
        </h3>
      ) : null}
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        {project.tagline}
      </p>
      <ul className="flex list-disc flex-col gap-2 pl-5 text-base leading-relaxed marker:text-accent-electric">
        {project.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="rounded-md border border-line bg-card px-3 py-1 font-mono text-xs text-foreground"
          >
            {tech}
          </li>
        ))}
      </ul>
      {project.href ? (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 font-mono text-xs tracking-wide text-foreground underline-offset-4 hover:text-accent-electric hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {labels.viewRepository}
          <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="sr-only">{openExternalLabel}</span>
        </a>
      ) : null}
    </div>
  )
}
