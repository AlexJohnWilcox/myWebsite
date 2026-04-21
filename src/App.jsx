import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Lenis from '@studio-freight/lenis'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Cursor } from './components/Cursor'
import { ChatBubble } from './components/ChatBubble'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ScrollToTop } from './components/ScrollToTop'

const Hub = lazy(() => import('./routes/Hub').then(m => ({ default: m.Hub })))
const About = lazy(() => import('./routes/About').then(m => ({ default: m.About })))
const Academics = lazy(() => import('./routes/Academics').then(m => ({ default: m.Academics })))
const Experience = lazy(() => import('./routes/Experience').then(m => ({ default: m.Experience })))
const Projects = lazy(() => import('./routes/Projects').then(m => ({ default: m.Projects })))
const Contact = lazy(() => import('./routes/Contact').then(m => ({ default: m.Contact })))
const NotFound = lazy(() => import('./routes/NotFound').then(m => ({ default: m.NotFound })))

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
          <Routes location={location}>
            <Route path="/" element={<Hub />} />
            <Route path="/about" element={<About />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.08 })
    let rafId
    const raf = (t) => {
      lenis.raf(t)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Cursor />
        <Nav />
        <AnimatedRoutes />
        <Footer />
        <ChatBubble />
      </ErrorBoundary>
    </BrowserRouter>
  )
}
