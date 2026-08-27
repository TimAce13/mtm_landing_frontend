import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'

/** Единая вводная шапка внутренних публичных страниц. */
export function PageHeader({ eyebrow, title, lead, children }: {
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className={styles.head}>
      <div className={`lpGlow lpGlowAccent ${styles.glow}`} />
      <div className="lpGrid" />
      <div className="lpContainer">
        <div className={styles.inner}>
          <span className="lpEyebrow" style={{ justifyContent: 'center' }}>{eyebrow}</span>
          <h1 className="lpH1" style={{ fontSize: 'clamp(32px, 4.2vw, 50px)' }}>{title}</h1>
          {lead && <p className="lpLead" style={{ marginInline: 'auto' }}>{lead}</p>}
          {children}
        </div>
      </div>
    </section>
  )
}
