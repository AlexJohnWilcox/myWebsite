import '@testing-library/jest-dom/vitest'

// Mock IntersectionObserver for framer-motion's whileInView
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}
