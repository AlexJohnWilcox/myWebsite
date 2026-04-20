import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error) { console.error(error) }
  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.err}>
          <div className={styles.meta}>// render fault</div>
          <h1>Something broke.</h1>
          <a className={styles.cta} href="/">[ GO HOME ]</a>
        </div>
      )
    }
    return this.props.children
  }
}
