import { connect } from './blobs.js'

// connect() guards the real connectLambda so that test / unlinked-local
// invocations (no injected blobs context) are a no-op, while a real invocation
// (event.blobs present) routes into connectLambda to wire the environment.
describe('connect', () => {
  it('does nothing when the event has no blobs context (test/unlinked-local)', () => {
    expect(() => connect({ headers: {} })).not.toThrow()
    expect(() => connect(undefined)).not.toThrow()
  })

  it('routes into connectLambda when a blobs context is present', () => {
    // A present-but-malformed context reaches connectLambda, which fails to
    // decode it — proving connect did not short-circuit past the wiring step.
    expect(() => connect({ blobs: 'not-a-valid-context', headers: {} })).toThrow()
  })
})
