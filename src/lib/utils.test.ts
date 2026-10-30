import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  it('joins class names and drops falsy values', () => {
    const isHidden = false as boolean
    expect(cn('text-sm', isHidden && 'hidden', undefined, 'font-bold')).toBe('text-sm font-bold')
  })

  it('resolves conflicting Tailwind utilities keeping the last one', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
