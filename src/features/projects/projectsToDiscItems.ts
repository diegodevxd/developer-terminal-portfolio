import type { DiscCascadeItem, DiscPattern as DiscArt } from '@/components/ui/disc-cascade-carousel'
import type { DiscPattern, Project, ProjectsLabels } from '@/content/types'

/** Content pattern names -> label art available in the carousel. */
const PATTERN_ART: Record<DiscPattern, DiscArt> = {
  rings: 'rings',
  grid: 'mosaic',
  dots: 'halftone',
  waves: 'horizon',
  bars: 'stripes',
}

export function projectsToDiscItems(
  projects: readonly Project[],
  labels: Pick<ProjectsLabels, 'stack' | 'summary'>,
): DiscCascadeItem[] {
  return projects.map((project) => ({
    title: project.title,
    pattern: project.pattern ? PATTERN_ART[project.pattern] : undefined,
    // Disc palette is [background, figure, accent].
    palette: project.palette
      ? [project.palette.from, project.palette.accent, project.palette.to]
      : undefined,
    credits: [
      { label: labels.stack, value: project.stack.join(' · ') },
      { label: labels.summary, value: project.tagline },
    ],
  }))
}
