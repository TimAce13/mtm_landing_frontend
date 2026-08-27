import { formatDate, type DevlogEntry } from '../../api/content'
import styles from './DevlogList.module.css'

const KIND_LABEL: Record<string, string> = {
  feature: 'Новое',
  improvement: 'Улучшение',
  fix: 'Исправление',
}

const KIND_CLASS: Record<string, string> = {
  feature: styles.kindFeature,
  improvement: styles.kindImprovement,
  fix: styles.kindFix,
}

/** Журнал обновлений: версия, дата, тип изменения и короткое описание. */
export function DevlogList({ items }: { items: DevlogEntry[] }) {
  if (items.length === 0) {
    return <p className={styles.empty}>Записей пока нет.</p>
  }

  return (
    <div className={styles.list}>
      {items.map((entry, i) => (
        <article key={entry.id} className={`${styles.entry} lpReveal`} data-reveal-delay={Math.min(i, 5) * 60}>
          <div className={styles.meta}>
            <span className={styles.version}>v{entry.version}</span>
            <span className={`${styles.kind} ${KIND_CLASS[entry.kind] ?? styles.kindFeature}`}>
              {KIND_LABEL[entry.kind] ?? 'Новое'}
            </span>
            <span className={styles.date}>{formatDate(entry.releasedOn)}</span>
          </div>
          <div>
            <h3 className={styles.title}>{entry.title}</h3>
            <p className={styles.summary}>{entry.summary}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
