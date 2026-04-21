import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Cursor } from './components/Cursor'
import { ChatBubble } from './components/ChatBubble'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ScrollToTop } from './components/ScrollToTop'
import { Hub } from './routes/Hub'
import { About } from './routes/About'
import { Academics } from './routes/Academics'
import { Experience } from './routes/Experience'
import { Projects } from './routes/Projects'
import { Contact } from './routes/Contact'
import { NotFound } from './routes/NotFound'

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
        <Routes location={location}>
          <Route path="/" element={<Hub />} />
          <Route path="/about" element={<About />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
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
