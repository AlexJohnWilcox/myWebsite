import { useState } from 'react'
import styles from './Media.module.css'

// Renders a gameplay image or video. Falls back to a labeled placeholder when
// the file is missing (no src) or fails to load — lets the page ship before
// captures exist. Drop a correctly-named file into public/rapids/ to replace it.
export function Media({ src, type = 'image', poster, label = '', className = '', ...rest }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={`${styles.placeholder} ${className}`} role="img" aria-label={label || 'media placeholder'}>
        <span className={styles.placeholderLabel}>{label || 'media'}</span>
      </div>
    )
  }

  if (type === 'video') {
    return (
      <video
        className={className}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        onError={() => setFailed(true)}
        {...rest}
      />
    )
  }

  return (
    <img
      className={className}
      src={src}
      alt={label}
      loading="lazy"
      onError={() => setFailed(true)}
      {...rest}
    />
  )
}
