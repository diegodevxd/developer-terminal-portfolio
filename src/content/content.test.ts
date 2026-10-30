import { describe, expect, it } from 'vitest'

import { en } from './en'
import { es } from './es'
import { getContent } from './index'

type Shape = string | readonly Shape[] | { readonly [key: string]: Shape }

function shapeOf(value: unknown): Shape {
  if (Array.isArray(value)) return value.map(shapeOf)
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, shapeOf(child)] as const)
    return Object.fromEntries(entries)
  }
  return typeof value
}

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach((child) => collectStrings(child, out))
  else if (value !== null && typeof value === 'object') {
    Object.values(value).forEach((child) => collectStrings(child, out))
  }
  return out
}

function collectHrefs(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((child) => collectHrefs(child, out))
  else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === 'href' && typeof child === 'string') out.push(child)
      else collectHrefs(child, out)
    }
  }
  return out
}

describe('content', () => {
  it('es and en have exactly the same shape', () => {
    expect(shapeOf(en)).toEqual(shapeOf(es))
  })

  it('getContent returns the content for each locale', () => {
    expect(getContent('es')).toBe(es)
    expect(getContent('en')).toBe(en)
  })

  it('every link is https, a site path or mailto', () => {
    for (const content of [es, en]) {
      const { github, linkedin, cv } = content.contact
      const links = [...collectHrefs(content), github, linkedin, cv.es, cv.en]
      expect(links.length).toBeGreaterThan(8)
      for (const href of links) {
        expect(href).toMatch(/^(https:\/\/|\/|mailto:)/)
      }
    }
  })

  it('does not publish a phone number', () => {
    for (const content of [es, en]) {
      for (const text of collectStrings(content)) {
        if (/^(https?:|mailto:|\/)/.test(text)) continue
        expect(text.replace(/[\s().+-]/g, '')).not.toMatch(/\d{10}/)
        expect(text).not.toMatch(/4504|9448/)
      }
    }
  })
})
