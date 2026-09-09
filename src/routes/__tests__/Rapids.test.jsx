import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Rapids, STEAM_URL } from '@/routes/Rapids'

describe('Rapid Raccoons landing page', () => {
  it('renders the hero sign and tagline', () => {
    render(<Rapids />)
    expect(screen.getByRole('heading', { level: 1, name: /rapid raccoons/i })).toBeInTheDocument()
    expect(screen.getByText(/one raft\. no steering/i)).toBeInTheDocument()
  })

  it('renders the pitch line', () => {
    render(<Rapids />)
    expect(screen.getByText(/river you can't steer/i)).toBeInTheDocument()
  })

  it('renders all four core mechanics', () => {
    render(<Rapids />)
    expect(screen.getByRole('heading', { name: /clean-up crew/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /the lasso/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /success is the problem/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /river fights back/i })).toBeInTheDocument()
  })

  it('renders the co-op section and the dates', () => {
    render(<Rapids />)
    expect(screen.getByRole('heading', { name: /better with a crew/i })).toBeInTheDocument()
    expect(screen.getByText(/steam next fest/i)).toBeInTheDocument()
    expect(screen.getByText(/early access/i)).toBeInTheDocument()
  })

  it('renders the Steam wishlist links to the renamed store page', () => {
    render(<Rapids />)
    const ctas = screen.getAllByRole('link', { name: /wishlist on steam/i })
    expect(ctas.length).toBeGreaterThanOrEqual(2)
    for (const cta of ctas) {
      expect(cta).toHaveAttribute('href', STEAM_URL)
      expect(cta).toHaveAttribute('target', '_blank')
    }
    expect(STEAM_URL).toBe('https://store.steampowered.com/app/4896950/Rapid_Raccoons/')
  })
})
