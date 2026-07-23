import React from 'react'
import styles from './AppFooter.module.css'

export default function AppFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.meta}>
          <div className={styles.title}>Project PRAGYA</div>
          <div className={styles.tagline}>
            "Every child deserves a science lab. PRAGYA puts one in their pocket."
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.policies}>
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <span>User Agreement</span>
          <span>Accessibility</span>
        </div>
        <div className={styles.builtBy}>Built by Sathvik Hegade</div>
      </div>
    </footer>
  )
}
