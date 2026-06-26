// Returns true for the standalone Rapids landing route, which renders without
// the portfolio's global chrome (nav, footer, chat bubble, custom cursor).
export function isBareRoute(pathname) {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '')
  return normalized === '/rapids'
}
