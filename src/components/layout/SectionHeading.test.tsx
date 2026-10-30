import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SectionHeading } from './SectionHeading'

describe('SectionHeading', () => {
  it('renders both lines and the eyebrow with the // prefix', () => {
    render(<SectionHeading eyebrow="Contribuciones" line1="Open" line2="Source" id="os" />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.id).toBe('os')
    expect(screen.getByText('Open').textContent).toBe('Open')
    expect(screen.getByText('Source').textContent).toBe('Source')
    expect(screen.getByText('// Contribuciones')).toBeTruthy()
  })

  it('omits the eyebrow when not provided', () => {
    render(<SectionHeading line1="A" line2="B" />)
    expect(screen.queryByText(/^\/\//)).toBeNull()
  })
})
