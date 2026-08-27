import { useEffect, useMemo, useState } from 'react'
import { getFaq, type FaqEntry } from '../../api/content'
import { useReveal } from '../../hooks/useReveal'
import { FaqBlock } from '../../components/landing/FaqBlock'
import { PageHeader } from './PageHeader'
import { SUPPORT_EMAIL } from '../../config'
import styles from './FaqPage.module.css'

const ALL = 'Все'

export default function FaqPage() {
  const rootRef = useReveal<HTMLDivElement>()
  const [items, setItems] = useState<FaqEntry[]>([])
  const [category, setCategory] = useState(ALL)

  useEffect(() => { getFaq().then(setItems).catch(() => { }) }, [])

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(items.map(i => i.category)))],
    [items]
  )

  const filtered = category === ALL ? items : items.filter(i => i.category === category)

  return (
    <div ref={rootRef}>
      <PageHeader
        eyebrow="Поддержка"
        title="Вопросы и ответы"
        lead="Собрали то, что спрашивают чаще всего. Если ответа нет — напишите, отвечаем в течение рабочего дня."
      />

      <section className="lpSectionTight" style={{ paddingTop: 0 }}>
        <div className="lpContainer">
          {categories.length > 2 && (
            <div className={`${styles.tabs} lpReveal`}>
              {categories.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.tab} ${c === category ? styles.tabActive : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <FaqBlock items={filtered} />

          <div className={`${styles.contact} lpReveal`}>
            <h3 className="lpH3">Не нашли ответ?</h3>
            <p className="lpBody" style={{ marginTop: 8 }}>
              Напишите на <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> — разберёмся вместе.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
