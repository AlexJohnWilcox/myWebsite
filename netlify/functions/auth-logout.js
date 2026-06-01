const { clearCookie } = require('./lib/auth')

exports.handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearCookie() },
  body: JSON.stringify({ authenticated: false }),
})
