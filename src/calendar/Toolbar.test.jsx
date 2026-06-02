import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { Toolbar } from './Toolbar'

describe('Toolbar', () => {
  it('shows the heading and switches view', () => {
    const onView = vi.fn()
    render(<Toolbar heading="June 2026" view="month" onView={onView} onPrev={vi.fn()} onNext={vi.fn()} onToday={vi.fn()} onNew={vi.fn()} />)
    expect(screen.getByText('June 2026')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^week$/i }))
    expect(onView).toHaveBeenCalledWith('week')
  })

  it('fires onNew when the New button is clicked', () => {
    const onNew = vi.fn()
    render(<Toolbar heading="X" view="month" onView={vi.fn()} onPrev={vi.fn()} onNext={vi.fn()} onToday={vi.fn()} onNew={onNew} />)
    fireEvent.click(screen.getByRole('button', { name: /\+ new/i }))
    expect(onNew).toHaveBeenCalled()
  })
})
