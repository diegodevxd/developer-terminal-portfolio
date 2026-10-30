import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TechBadge } from './TechBadge'

describe('TechBadge', () => {
  it('renders the icon path when the slug is known', () => {
    render(<TechBadge name="TypeScript" slug="typescript" />)
    expect(screen.getByText('TypeScript')).not.toBeNull()
    const path = screen.getByTestId('tech-icon').querySelector('path')
    expect(path?.getAttribute('d')?.length).toBeGreaterThan(10)
  })

  it('renders only text without a slug', () => {
    render(<TechBadge name="SQL" />)
    expect(screen.getByText('SQL')).not.toBeNull()
    expect(screen.queryByTestId('tech-icon')).toBeNull()
  })

  it('renders only text for an unknown slug', () => {
    render(<TechBadge name="Nope" slug="does-not-exist" />)
    expect(screen.queryByTestId('tech-icon')).toBeNull()
  })
})
