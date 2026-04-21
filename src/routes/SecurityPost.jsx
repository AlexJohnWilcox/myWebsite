import { Link, useParams } from 'react-router-dom'
import { Typewriter } from '@/components/Typewriter'
import { SectionLabel } from '@/components/SectionLabel'
import { security } from '@/data/security'
import styles from './Security.module.css'

export function SecurityPost() {
  const { slug } = useParams()
  const posts = [...security.posts].sort((a, b) => b.date.localeCompare(a.date))
  const idx = posts.findIndex(p => p.slug === slug)
  const post = posts[idx]

  if (!post) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <SectionLabel index={6}>SECURITY</SectionLabel>
          <Typewriter as="h1" speed="slow">not found</Typewriter>
          <p className={styles.intro}>That entry doesn't exist.</p>
        </header>
        <Link className={styles.back} to="/security">[ ← all entries ]</Link>
      </div>
    )
  }

  const older = posts[idx + 1]
  const newer = posts[idx - 1]

  return (
    <div className={styles.page}>
      <Link className={styles.back} to="/security">← Back</Link>
      <header className={styles.header}>
        <SectionLabel index={6}>SECURITY</SectionLabel>
        <Typewriter as="h1" speed="slow">{post.title}</Typewriter>
        <div className={styles.meta}>
          <span className={styles.date}>{post.date}</span>
          <span className={styles.dash}>—</span>
          <span className={styles.metaKeywords}>
            {post.keywords.map(k => <span key={k} className={styles.tag}>{k}</span>)}
          </span>
        </div>
      </header>

      <div className={styles.postBody}>
        {post.body.map((para, i) => (
          <Typewriter key={i} as="p" speed="fast" className={styles.para}>{para}</Typewriter>
        ))}
      </div>

      <div className={styles.pager}>
        {older ? (
          <Link to={`/security/${older.slug}`} className={styles.pagerLink}>
            <span className={styles.pagerLabel}>← older</span>
            <span className={styles.pagerTitle}>{older.title}</span>
          </Link>
        ) : <span />}
        {newer ? (
          <Link to={`/security/${newer.slug}`} className={`${styles.pagerLink} ${styles.pagerRight}`}>
            <span className={styles.pagerLabel}>newer →</span>
            <span className={styles.pagerTitle}>{newer.title}</span>
          </Link>
        ) : <span />}
      </div>
    </div>
  )
}
