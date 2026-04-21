import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './ProjectCard.module.css'

export function ProjectCard({ project }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div className={styles.card} onClick={() => setOpen(o => !o)} data-interactive>
      <div className={styles.meta}>
        <span>{project.category.toUpperCase()}</span>
        <span>{project.year}</span>
      </div>
      <div className={styles.title}>{project.title}</div>
      <div className={styles.summary}>{project.summary}</div>
      <div className={styles.tags}>
        {project.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className={styles.body}
          >
            <p>{project.body}</p>
            {(project.links?.github || project.links?.demo || project.links?.writeup) && (
              <div className={styles.links}>
                {project.links.demo && <a href={project.links.demo} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>[ {project.category === 'games' ? 'PLAY' : 'DEMO'} ]</a>}
                {project.links.github && <a href={project.links.github} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>[ GITHUB ]</a>}
                {project.links.writeup && <a href={project.links.writeup} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>[ WRITEUP ]</a>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
