import { useEffect, useState } from 'react'
import { getGuides, formatDuration, type GuideEntry } from '../../api/content'
import Button from '../../components/ui/Button'
import styles from './Lk.module.css'

/** Раздел «Инструкции» внутри ЛК: те же видеоуроки, что и на публичной странице. */
export default function GuidesLkPage() {
  const [items, setItems] = useState<GuideEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getGuides()
      .then(setItems)
      .catch(() => { })
      .finally(() => setLoaded(true))
  }, [])

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Инструкции</h1>
        <p className={styles.subtitle}>Видеоуроки по работе с сервисом</p>
      </div>

      <section className={styles.card}>
        {!loaded ? (
          <p className={styles.empty}>Загружаем…</p>
        ) : items.length === 0 ? (
          <p className={styles.empty}>
            Видеоуроки скоро появятся. Пока можно посмотреть демо-кабинет или написать в поддержку.
          </p>
        ) : (
          <div className={styles.guideGrid}>
            {items.map(g => (
              <a key={g.id} href={g.videoUrl} target="_blank" rel="noopener noreferrer"
                 className={styles.guideCard} style={{ textDecoration: 'none' }}>
                <span className={styles.guideTag}>{g.category}</span>
                <h3 className={styles.guideTitle}>{g.title}</h3>
                <p className={styles.guideDesc}>{g.description}</p>
                <span style={{ fontSize: 14, color: 'var(--color-accent)' }}>
                  Смотреть{g.durationSeconds > 0 ? ` · ${formatDuration(g.durationSeconds)}` : ''} →
                </span>
              </a>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <a href="/guides" target="_blank" rel="noopener">
            <Button variant="outline" size="md">Открыть раздел обучения</Button>
          </a>
        </div>
      </section>
    </>
  )
}
