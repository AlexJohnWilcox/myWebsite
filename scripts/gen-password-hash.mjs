// Usage: node scripts/gen-password-hash.mjs 'your-passphrase'
import bcrypt from 'bcryptjs'

const pw = process.argv[2]
if (!pw) {
  console.error("Usage: node scripts/gen-password-hash.mjs 'your-passphrase'")
  process.exit(1)
}
const hash = bcrypt.hashSync(pw, 12)
console.log(hash)
