const auth = require('./auth')

beforeAll(() => { process.env.JWT_SECRET = 'test-secret-xyz' })

describe('auth', () => {
  it('signs a token that it can verify', () => {
    const token = auth.signSession()
    expect(auth.verifySession(token)).toBeTruthy()
  })

  it('rejects a tampered token', () => {
    expect(auth.verifySession('not.a.jwt')).toBeNull()
  })

  it('serializes an httpOnly Secure SameSite cookie', () => {
    const c = auth.serializeCookie('abc')
    expect(c).toMatch(/^cal_session=abc;/)
    expect(c).toMatch(/HttpOnly/)
    expect(c).toMatch(/Secure/)
    expect(c).toMatch(/SameSite=Strict/)
  })

  it('parses a token out of the request cookie header', () => {
    const event = { headers: { cookie: 'foo=1; cal_session=tok123; bar=2' } }
    expect(auth.tokenFromEvent(event)).toBe('tok123')
  })

  it('requireAuth returns payload for a valid cookie and null otherwise', () => {
    const token = auth.signSession()
    expect(auth.requireAuth({ headers: { cookie: `cal_session=${token}` } })).toBeTruthy()
    expect(auth.requireAuth({ headers: {} })).toBeNull()
  })
})
