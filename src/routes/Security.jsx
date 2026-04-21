import { Link } from 'react-router-dom'
import { Typewriter } from '@/components/Typewriter'
import { SectionLabel } from '@/components/SectionLabel'
import { security } from '@/data/security'
import styles from './Security.module.css'

export function Security() {
  const posts = [...security.posts].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <SectionLabel index={6}>SECURITY</SectionLabel>
        <Typewriter as="h1" speed="slow">Technological Privacy - A Human Right</Typewriter>
        <p className={styles.intro}>{security.intro}</p>
      </header>

      <div className={styles.block}>
        <span className={styles.subLabel}>// entries</span>
        <ul className={styles.list}>
          {posts.map(post => (
            <li key={post.slug} className={styles.item}>
              <Link to={`/security/${post.slug}`} className={styles.itemLink}>
                <span className={styles.date}>{post.date}</span>
                <span className={styles.dash}>—</span>
                <span className={styles.itemTitle}>{post.title}</span>
                <span className={styles.keywords}>
                  {post.keywords.map(k => <span key={k} className={styles.tag}>{k}</span>)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
