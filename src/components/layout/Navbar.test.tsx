import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LocaleProvider } from '@/app/providers'
import { es } from '@/content/es'

import { Navbar } from './Navbar'

const labels = {
  navAria: es.ui.navAria,
  languageAria: es.ui.languageAria,
  languageNames: es.ui.languageNames,
  openMenu: es.ui.openMenu,
  closeMenu: es.ui.closeMenu,
}

function setup() {
  render(
    <LocaleProvider>
      <Navbar items={es.nav} labels={labels} />
    </LocaleProvider>,
  )
}

describe('Navbar mobile menu', () => {
  it('toggles the panel with aria-expanded', () => {
    setup()
    const toggle = screen.getByRole('button', { name: es.ui.openMenu })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(
      screen.getByRole('button', { name: es.ui.closeMenu }).getAttribute('aria-expanded'),
    ).toBe('true')
    expect(document.getElementById('mobile-nav')).not.toBeNull()
  })

  it('closes on Escape and when a link is chosen', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: es.ui.openMenu }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.getElementById('mobile-nav')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: es.ui.openMenu }))
    const panel = document.getElementById('mobile-nav')
    const link = panel?.querySelector('a')
    expect(link).not.toBeNull()
    if (link) fireEvent.click(link)
    expect(document.getElementById('mobile-nav')).toBeNull()
  })
})
