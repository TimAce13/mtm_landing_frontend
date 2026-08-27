import { useEffect, useState } from 'react'
import { getFaq, type FaqEntry } from '../../api/content'
import styles from './FaqBlock.module.css'

interface Props {
  /** Сколько вопросов показать (для блока на главной). Без значения — все. */
  limit?: number
  /** Готовый список — чтобы страница /faq не запрашивала данные повторно. */
  items?: FaqEntry[]
}

/** Аккордеон вопросов и ответов. Открыт максимум один пункт. */
export function FaqBlock({ limit, items: external }: Props) {
  const [items, setItems] = useState<FaqEntry[]>(external ?? [])
  const [openId, setOpenId] = useState<number | null>(null)

  useEffect(() => {
    if (external) { setItems(external); return }
    getFaq().then(setItems).catch(() => { })
  }, [external])

  const visible = limit ? items.slice(0, limit) : items

  if (visible.length === 0) {
    return <p className={styles.empty}>Вопросы скоро появятся.</p>
  }

  return (
    <div className={styles.wrap}>
      {visible.map((item, i) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id} className={`${styles.item} ${isOpen ? styles.itemOpen : ''} lpReveal`}
               data-reveal-delay={Math.min(i, 5) * 60}>
            <button
              type="button"
              className={styles.question}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
            >
              <span className={styles.category}>{item.category}</span>
              <span>{item.question}</span>
              <svg className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                   width="18" height="18" viewBox="0 0 18 18" fill="none"
                   stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4.5 7l4.5 4.5L13.5 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className={`${styles.answerWrap} ${isOpen ? styles.answerWrapOpen : ''}`}>
              <div className={styles.answerInner}>
                <p className={styles.answer}>{item.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
