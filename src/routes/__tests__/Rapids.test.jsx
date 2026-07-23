import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Rapids } from '@/routes/Rapids'

describe('Rapids landing page', () => {
  it('renders the hero wordmark and tagline', () => {
    render(<Rapids />)
    expect(screen.getByRole('heading', { level: 1, name: /rapids/i })).toBeInTheDocument()
    expect(screen.getByText(/raft that won't stop/i)).toBeInTheDocument()
  })

  it('renders the pitch line', () => {
    render(<Rapids />)
    expect(screen.getByText(/river you can't steer/i)).toBeInTheDocument()
  })

  it('renders all four core mechanics', () => {
    render(<Rapids />)
    expect(screen.getByRole('heading', { name: /two-hand grab/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /no steering/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /the wave/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /quotas/i })).toBeInTheDocument()
  })

  it('renders the co-op section', () => {
    render(<Rapids />)
    expect(screen.getByRole('heading', { name: /1–4 player|co-op chaos/i })).toBeInTheDocument()
  })

  it('renders the Steam wishlist link', () => {
    render(<Rapids />)
    const cta = screen.getByRole('link', { name: /wishlist on steam/i })
    expect(cta).toHaveAttribute('href', 'https://store.steampowered.com/app/4896950/Rapids/')
    expect(cta).toHaveAttribute('target', '_blank')
  })
})
