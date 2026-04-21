import { useSearchParams } from 'react-router-dom'
import { Typewriter } from '@/components/Typewriter'
import { SectionLabel } from '@/components/SectionLabel'
import { ProjectCard } from '@/components/ProjectCard'
import { projects } from '@/data/projects'
import styles from './Projects.module.css'

const FILTERS = [
  { key: 'all',           label: 'All' },
  { key: 'cybersecurity', label: 'Cybersecurity' },
  { key: 'web-design',    label: 'Web Design' },
  { key: 'internship',    label: 'Internship' },
  { key: 'games',         label: 'Games' },
]

export function Projects() {
  const [params, setParams] = useSearchParams()
  const active = params.get('category') || 'all'

  const yearEnd = (y) => typeof y === 'string' ? parseInt(y.split('-').pop(), 10) : y
  const visible = active === 'all'
    ? [...projects].sort((a, b) => yearEnd(b.year) - yearEnd(a.year))
    : projects.filter(p => p.category === active)

  const setActive = (key) => {
    if (key === 'all') setParams({}, { replace: false })
    else setParams({ category: key }, { replace: false })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <SectionLabel index={5}>PROJECTS</SectionLabel>
        <Typewriter as="h1" speed="slow">The Fun Work</Typewriter>
      </header>

      <div className={styles.filter}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={f.key === active ? styles.active : ''}
            onClick={() => setActive(f.key)}
            data-interactive
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className={styles.empty}>// no projects in this category yet</div>
      ) : (
        <div className={styles.grid}>
          {visible.map(p => <ProjectCard key={p.slug} project={p} />)}
        </div>
      )}
    </div>
  )
}
