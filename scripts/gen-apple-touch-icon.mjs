import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const svg = readFileSync(resolve(root, 'public/favicon.svg'))

await sharp(svg, { density: 1800 })
  .resize(180, 180)
  .png()
  .toFile(resolve(root, 'public/apple-touch-icon.png'))

console.log('Wrote public/apple-touch-icon.png (180x180)')
