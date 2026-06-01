import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
    // .netlify holds esbuild-bundled copies of functions during `netlify dev`;
    // never collect those as test files.
    exclude: ['**/node_modules/**', '**/dist/**', '**/.netlify/**'],
  },
})
