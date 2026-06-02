// Mints a long-lived bearer JWT for the desktop calendar widget.
// Reads JWT_SECRET from ./.env (same secret the deployed function verifies with).
// Usage: node scripts/gen-desktop-token.mjs
import { readFileSync } from 'fs'
import jwt from 'jsonwebtoken'

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const m = env.match(/^JWT_SECRET=(.+)$/m)
if (!m) { console.error('JWT_SECRET not found in .env'); process.exit(1) }

const token = jwt.sign({ sub: 'alex', kind: 'desktop' }, m[1].trim(), { expiresIn: '1825d' })
process.stdout.write(token)
