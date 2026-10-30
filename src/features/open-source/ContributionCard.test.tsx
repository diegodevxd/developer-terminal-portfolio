import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { es } from '@/content/es'

import { ContributionCard } from './ContributionCard'

describe('ContributionCard', () => {
  it('renders every link as an external, noopener link', () => {
    const contribution = es.openSource.contributions[0]
    render(<ContributionCard contribution={contribution} openExternalLabel={es.ui.openExternal} />)
    const anchors = screen.getAllByRole('link')
    expect(anchors).toHaveLength(contribution.links.length)
    for (const anchor of anchors) {
      expect(anchor.getAttribute('target')).toBe('_blank')
      expect(anchor.getAttribute('rel')).toContain('noopener')
    }
    expect(screen.getByText(contribution.status)).not.toBeNull()
  })
})
