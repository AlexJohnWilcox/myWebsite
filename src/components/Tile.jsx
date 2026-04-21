import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SectionLabel } from './SectionLabel'
import styles from './Tile.module.css'

export function Tile({ index, title, subtitle, to, featured = false, children }) {
  return (
    <motion.div layoutId={`tile-${index}`} className={`${styles.tile} ${featured ? styles.featured : ''}`}>
      <Link to={to} style={{ display: 'contents' }}>
        <SectionLabel index={index}>{featured ? 'FEATURED' : title}</SectionLabel>
        {children && <div className={styles.featuredContent}>{children}</div>}
        <div>
          <div className={styles.title}>{title}</div>
          {subtitle && <div className={styles.sub}>{subtitle}</div>}
        </div>
      </Link>
    </motion.div>
  )
}
