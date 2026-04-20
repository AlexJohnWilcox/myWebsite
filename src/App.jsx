import { Typewriter } from './components/Typewriter'

export default function App() {
  return (
    <main style={{ padding: 40, minHeight: '100vh' }}>
      <Typewriter as="h1" speed="slow">Alex Wilcox</Typewriter>
      <Typewriter as="p" speed="fast">
        Cybersecurity specialist and game developer based at High Point University.
      </Typewriter>
    </main>
  )
}
