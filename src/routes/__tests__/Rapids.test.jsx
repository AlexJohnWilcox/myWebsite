import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Rapids } from '@/routes/Rapids'

describe('Rapids landing page', () => {
  it('renders the hero wordmark and tagline', () => {
    render(<Rapids />)
    expect(screen.getByRole('heading', { level: 1, name: /rapids/i })).toBeInTheDocument()
    expect(screen.getByText(/raft that won't stop/i)).toBeInTheDocument()
  })
})
