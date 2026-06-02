import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { Login } from './Login'

describe('Login', () => {
  it('calls onAuthed after a successful login', async () => {
    const onAuthed = vi.fn()
    const login = vi.fn().mockResolvedValue({ authenticated: true })
    render(<Login login={login} onAuthed={onAuthed} />)
    fireEvent.change(screen.getByLabelText(/passphrase/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
    await waitFor(() => expect(onAuthed).toHaveBeenCalled())
    expect(login).toHaveBeenCalledWith('secret')
  })

  it('shows an error on failed login', async () => {
    const login = vi.fn().mockRejectedValue(new Error('invalid password'))
    render(<Login login={login} onAuthed={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/passphrase/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
    expect(await screen.findByText(/invalid password/i)).toBeInTheDocument()
  })
})
