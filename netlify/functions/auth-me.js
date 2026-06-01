const { requireAuth } = require('./lib/auth')

exports.handler = async (event) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ authenticated: !!requireAuth(event) }),
})
