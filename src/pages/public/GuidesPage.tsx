import { useEffect, useMemo, useState } from 'react'
import { getGuides, formatDuration, type GuideEntry } from '../../api/content'
import { useReveal } from '../../hooks/useReveal'
import { PageHeader } from './PageHeader'
import { DEMO_URL, SUPPORT_EMAIL } from '../../config'
import styles from './GuidesPage.module.css'

const ALL = 'Все'

export default function GuidesPage() {
  const rootRef = useReveal<HTMLDivElement>()
  const [items, setItems] = useState<GuideEntry[]>([])
  const [category, setCategory] = useState(ALL)
  const [active, setActive] = useState<GuideEntry | null>(null)

  useEffect(() => { getGuides().then(setItems).catch(() => { }) }, [])

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(items.map(i => i.category)))],
    [items]
  )
  const filtered = category === ALL ? items : items.filter(i => i.category === category)

  return (
    <div ref={rootRef}>
      <PageHeader
        eyebrow="Обучение"
        title="Видеоинструкции"
        lead="Короткие уроки по каждому шагу: подключение кабинета, чтение отчётов, настройка рекламы и работа командой."
      />

      <section className="lpSectionTight" style={{ paddingTop: 0 }}>
        <div className="lpContainer">
          {items.length === 0 ? (
            <div className={`${styles.empty} lpReveal`}>
              <h3 className="lpH3">Видеоуроки скоро появятся</h3>
              <p className="lpBody" style={{ marginTop: 10 }}>
                Мы записываем их прямо сейчас. Пока можно изучить интерфейс в демо-кабинете
                или задать вопрос на <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              </p>
              <a href={DEMO_URL} rel="noopener" className="lpBtn lpBtnPrimary" style={{ marginTop: 24 }}>
                Открыть демо-кабинет
              </a>
            </div>
          ) : (
            <>
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

              <div className={styles.grid}>
                {filtered.map((g, i) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`${styles.card} lpReveal`}
                    data-reveal-delay={Math.min(i, 6) * 70}
                    onClick={() => setActive(g)}
                  >
                    <div className={styles.thumb}>
                      {g.thumbnailUrl && <img src={g.thumbnailUrl} alt="" loading="lazy" />}
                      <span className={styles.play}>
                        <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M7 4.5l9 5.5-9 5.5z" />
                        </svg>
                      </span>
                      {g.durationSeconds > 0 && (
                        <span className={styles.duration}>{formatDuration(g.durationSeconds)}</span>
                      )}
                    </div>
                    <div className={styles.body}>
                      <span className={styles.cat}>{g.category}</span>
                      <h3 className={styles.title}>{g.title}</h3>
                      <p className={styles.desc}>{g.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {active && (
        <div className={styles.modal} onClick={() => setActive(null)} role="dialog" aria-modal="true">
          <div className={styles.modalInner} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className="lpH3">{active.title}</h3>
              <button type="button" className={styles.close} onClick={() => setActive(null)} aria-label="Закрыть">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {/* Плеер провайдера (VK Video / RuTube / YouTube) во фрейме. */}
            <div className={styles.player}>
              <iframe
                src={active.videoUrl}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className={styles.modalDesc}>{active.description}</p>
            <a href={active.videoUrl} target="_blank" rel="noopener noreferrer" className={styles.modalLink}>
              Открыть в новой вкладке ↗
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
