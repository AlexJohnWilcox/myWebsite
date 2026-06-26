import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Layout } from '@/App'

describe('chrome gating', () => {
  it('hides the global nav on /rapids', () => {
    render(<MemoryRouter initialEntries={['/rapids']}><Layout /></MemoryRouter>)
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('renders the global nav on a normal route', () => {
    render(<MemoryRouter initialEntries={['/about']}><Layout /></MemoryRouter>)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
