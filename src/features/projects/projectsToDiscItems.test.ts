import { describe, expect, it } from 'vitest'

import { en } from '@/content/en'
import { es } from '@/content/es'

import { projectsToDiscItems } from './projectsToDiscItems'

describe('projectsToDiscItems', () => {
  it.each([
    ['es', es],
    ['en', en],
  ])('maps every %s project to a disc item', (_, content) => {
    const items = projectsToDiscItems(content.projects.projects, content.projects.labels)
    expect(items).toHaveLength(content.projects.projects.length)
    items.forEach((item, i) => {
      const project = content.projects.projects[i]
      expect(item.title).toBe(project.title)
      expect(item.credits?.[0]).toEqual({
        label: content.projects.labels.stack,
        value: project.stack.join(' · '),
      })
      expect(item.fine).toBe(project.stack.join(' · '))
      expect(item.palette).toEqual([
        project.palette?.from,
        project.palette?.accent,
        project.palette?.to,
      ])
    })
  })

  it('translates content patterns to carousel art', () => {
    const items = projectsToDiscItems(
      [{ ...es.projects.projects[0], pattern: 'grid' }],
      es.projects.labels,
    )
    expect(items[0].pattern).toBe('mosaic')
  })

  it('leaves art undefined when the project has none', () => {
    const [item] = projectsToDiscItems(
      [{ title: 'X', tagline: 't', stack: ['a'], bullets: [] }],
      es.projects.labels,
    )
    expect(item.pattern).toBeUndefined()
    expect(item.palette).toBeUndefined()
  })
})
