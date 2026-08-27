import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getDevlog, getGuides, getPricing, formatDuration,
  type DevlogEntry, type GuideEntry, type PricingResponse,
} from '../../api/content'
import { useReveal } from '../../hooks/useReveal'
import { ModuleIcon } from '../../components/landing/ModuleIcons'
import { PricingBlock } from '../../components/landing/PricingBlock'
import { FaqBlock } from '../../components/landing/FaqBlock'
import { DevlogList } from '../../components/landing/DevlogList'
import { DEMO_URL } from '../../config'
import styles from './HomePage.module.css'

const SCREENS = [
  { key: 'dashboard', tab: 'Дашборд', file: '/screens/dashboard.webp',
    caption: 'Сводка кабинета: заказы, выкуп, возвраты, реклама и складские риски на одном экране.' },
  { key: 'campaigns', tab: 'Реклама', file: '/screens/campaigns.webp',
    caption: 'Кампании с расходом, заказами и ДРР — видно, что окупается, а что съедает бюджет.' },
  { key: 'unit-economics', tab: 'Юнит-экономика', file: '/screens/unit-economics.webp',
    caption: 'Прибыль по каждому товару с учётом себестоимости, комиссий и рекламы.' },
  { key: 'supply-planner', tab: 'Планировщик', file: '/screens/supply-planner.webp',
    caption: 'Прогноз: когда закончится товар и сколько везти, чтобы не терять продажи.' },
  { key: 'orders-heatmap', tab: 'Часы заказов', file: '/screens/orders-heatmap.webp',
    caption: 'Тепловая карта заказов по часам и дням — когда включать и выключать рекламу.' },
  { key: 'autobids', tab: 'Авто-ставки', file: '/screens/autobids.webp',
    caption: 'Расписания ставок: ночью ниже, в пик — выше, без ручной рутины.' },
]

const STATS = [
  { value: '6', label: 'модулей: от аналитики до обработки карточек' },
  { value: '60 дней', label: 'история заказов и рекламы в отчётах' },
  { value: '∞', label: 'пользователей в команде на любом тарифе' },
  { value: '7 дней', label: 'бесплатно, все модули и без карты' },
]

const PAINS = [
  {
    title: 'Отчёты Ozon не отвечают на главный вопрос',
    text: 'Выгрузки показывают заказы и расходы по отдельности. Сколько вы заработали на конкретном товаре после комиссий, логистики и рекламы — приходится считать руками в таблице.',
    fix: 'Прибыль по каждому SKU считается автоматически',
  },
  {
    title: 'Реклама съедает маржу незаметно',
    text: 'Кампания открутила бюджет, а заказы пришли по другим товарам. Пока вы заметите перекос в ДРР, деньги уже потрачены — а проверять кабинет вручную каждый день невозможно.',
    fix: 'Контроль ДРР и авто-остановка перерасхода',
  },
  {
    title: 'Товар заканчивается неожиданно',
    text: 'Хиты уходят в ноль, пока вы везёте то, что и так лежит на складе. Позиция в выдаче теряется, и её приходится выкупать рекламой заново.',
    fix: 'Прогноз остатков и план поставок',
  },
]

const STEPS = [
  {
    title: 'Подключите кабинет Ozon',
    text: 'Создайте ключ в личном кабинете Ozon Seller и добавьте его в MTM — это пара минут, порядок действий показан в видеоуроке. Ключ хранится в зашифрованном виде.',
  },
  {
    title: 'Дождитесь загрузки данных',
    text: 'Мы подтянем заказы, возвраты, рекламу и остатки за последние два месяца. Дальше данные обновляются сами — а закрытые дни больше не пересчитываются.',
  },
  {
    title: 'Работайте с готовыми отчётами',
    text: 'Дашборд покажет картину целиком, юнит-экономика — прибыль по товарам, мониторинг возьмёт на себя контроль рекламных бюджетов.',
  },
]

export default function HomePage() {
  const rootRef = useReveal<HTMLDivElement>()
  const [pricing, setPricing] = useState<PricingResponse | null>(null)
  const [guides, setGuides] = useState<GuideEntry[]>([])
  const [devlog, setDevlog] = useState<DevlogEntry[]>([])
  const [activeShot, setActiveShot] = useState(0)

  useEffect(() => {
    getPricing().then(setPricing).catch(() => { })
    getGuides().then(g => setGuides(g.slice(0, 3))).catch(() => { })
    getDevlog(3).then(setDevlog).catch(() => { })
  }, [])

  const shot = SCREENS[activeShot]

  return (
    <div ref={rootRef}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className={`${styles.hero}`}>
        <div className={`lpGlow lpGlowAccent ${styles.heroGlowA}`} />
        <div className={`lpGlow ${styles.heroGlowB}`} />
        <div className="lpGrid" />

        <div className="lpContainer">
          <div className={styles.heroInner}>
            <div className={`${styles.heroBadge} lpReveal`}>
              <span className={styles.heroBadgeTag}>Новое</span>
              <Link to="/devlog">Тепловая карта заказов по часам</Link>
            </div>

            <h1 className={`lpH1 ${styles.heroTitle} lpReveal`} data-reveal-delay="60">
              Аналитика Ozon, которая<br />
              <span>считает деньги</span>, а не клики
            </h1>

            <p className="lpLead lpReveal" data-reveal-delay="120" style={{ marginInline: 'auto' }}>
              Продажи, выкупы, реклама и прибыль по каждому товару — в одном кабинете.
              Без выгрузок в Excel и ручных сверок: цифры сходятся с личным кабинетом Ozon
              до копейки и до часа.
            </p>

            <div className={`${styles.heroActions} lpReveal`} data-reveal-delay="180">
              <Link to="/register" className="lpBtn lpBtnPrimary lpBtnLg">
                Попробовать 7 дней бесплатно
              </Link>
              <a href={DEMO_URL} rel="noopener" className="lpBtn lpBtnGhost lpBtnLg">
                Посмотреть демо-кабинет
              </a>
            </div>

            <p className={`${styles.heroNote} lpReveal`} data-reveal-delay="220">
              Без привязки карты · Все модули включены · Отменить можно в любой момент
            </p>
          </div>
        </div>

        <div className={`lpContainer ${styles.heroShot}`}>
          <div className={`${styles.heroShotFrame} lpReveal`} data-reveal-delay="260">
            <img src="/screens/dashboard.webp" alt="Дашборд MTM Analytics" width={2200} height={1410} />
          </div>
        </div>
      </section>

      {/* ── Метрики ──────────────────────────────────────── */}
      <section className="lpContainer" style={{ paddingBottom: 8 }}>
        <div className={`${styles.stats} lpReveal`}>
          {STATS.map(s => (
            <div key={s.label} className={styles.stat}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Боли ─────────────────────────────────────────── */}
      <section className="lpSection">
        <div className="lpContainer">
          <div className="lpSectionHead lpReveal">
            <span className="lpEyebrow">Зачем это нужно</span>
            <h2 className="lpH2">Продавцы теряют деньги не на цене, а на непрозрачности</h2>
            <p className="lpLead">
              Данные у вас уже есть — они просто разбросаны по разным отчётам и не сведены
              в одну картину. MTM собирает их вместе и переводит в решения.
            </p>
          </div>

          <div className="lpGrid3">
            {PAINS.map((p, i) => (
              <div key={p.title} className={`${styles.painCard} lpReveal`} data-reveal-delay={i * 90}>
                <div className={styles.painIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 8v5" strokeLinecap="round" />
                    <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
                    <path d="M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className={styles.painTitle}>{p.title}</h3>
                <p className={styles.painText}>{p.text}</p>
                <div className={styles.painArrow}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {p.fix}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="lpDivider" />

      {/* ── Как это работает ─────────────────────────────── */}
      <section className="lpSection">
        <div className="lpContainer">
          <div className="lpSectionHead lpReveal">
            <span className="lpEyebrow">Как это работает</span>
            <h2 className="lpH2">Три шага от ключа до готовых отчётов</h2>
            <p className="lpLead">
              Ничего не нужно настраивать вручную и переносить в таблицы — данные приходят сами.
            </p>
          </div>

          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={s.title} className={`${styles.step} lpReveal`} data-reveal-delay={i * 100}>
                <div className={styles.stepNum}>{i + 1}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepText}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Модули ───────────────────────────────────────── */}
      <section className="lpSection" style={{ background: 'var(--lp-bg-soft)' }}>
        <div className="lpContainer">
          <div className="lpSectionHead lpReveal">
            <span className="lpEyebrow">Модули</span>
            <h2 className="lpH2">Платите только за то, чем действительно пользуетесь</h2>
            <p className="lpLead">
              Платформа собрана из модулей. Дашборд и обработчик карточек входят в любой тариф,
              остальные вы выбираете под свои задачи.
            </p>
          </div>

          <div className="lpGrid3">
            {(pricing?.modules ?? []).map((m, i) => (
              <div key={m.code} className={`lpCard lpCardHover ${styles.moduleCard} lpReveal`} data-reveal-delay={(i % 3) * 80}>
                <div className={styles.moduleHead}>
                  <div className={styles.moduleIcon}><ModuleIcon code={m.code} /></div>
                  <h3 className={styles.moduleName}>{m.name}</h3>
                  {m.alwaysIncluded && <span className={styles.moduleIncluded}>в любом тарифе</span>}
                </div>
                <p className={styles.moduleText}>{m.description}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 44 }} className="lpReveal">
            <Link to="/features" className="lpBtn lpBtnGhost">Подробно о возможностях</Link>
          </div>
        </div>
      </section>

      {/* ── Скриншоты ────────────────────────────────────── */}
      <section className="lpSection">
        <div className="lpContainer">
          <div className="lpSectionHead lpReveal">
            <span className="lpEyebrow">Интерфейс</span>
            <h2 className="lpH2">Так это выглядит внутри</h2>
            <p className="lpLead">
              Реальные экраны продукта с демонстрационными данными. Всё это можно открыть
              прямо сейчас — без регистрации.
            </p>
          </div>

          <div className={`${styles.shotTabs} lpReveal`}>
            {SCREENS.map((s, i) => (
              <button
                key={s.key}
                className={`${styles.shotTab} ${i === activeShot ? styles.shotTabActive : ''}`}
                onClick={() => setActiveShot(i)}
                type="button"
              >
                {s.tab}
              </button>
            ))}
          </div>

          <div className={`${styles.shotStage} lpReveal`}>
            <img src={shot.file} alt={shot.tab} width={2200} height={1410} />
          </div>
          <p className={styles.shotCaption}>{shot.caption}</p>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <a href={DEMO_URL} rel="noopener" className="lpBtn lpBtnGhost">Открыть демо-кабинет</a>
          </div>
        </div>
      </section>

      <hr className="lpDivider" />

      {/* ── Видеоуроки ───────────────────────────────────── */}
      <section className="lpSection">
        <div className="lpContainer">
          <div className="lpSectionHead lpReveal">
            <span className="lpEyebrow">Обучение</span>
            <h2 className="lpH2">Разберётесь без поддержки</h2>
            <p className="lpLead">
              Короткие видео по каждому шагу: от подключения ключей до настройки авто-ставок.
            </p>
          </div>

          {guides.length > 0 ? (
            <div className={styles.videoRow}>
              {guides.map((g, i) => (
                <a key={g.id} href={g.videoUrl} target="_blank" rel="noopener noreferrer"
                   className={`${styles.videoCard} lpReveal`} data-reveal-delay={i * 90}>
                  <div className={styles.videoThumb}>
                    {g.thumbnailUrl && <img src={g.thumbnailUrl} alt="" loading="lazy" />}
                    <span className={styles.videoPlay}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M7 4.5l9 5.5-9 5.5z" />
                      </svg>
                    </span>
                    {g.durationSeconds > 0 && (
                      <span className={styles.videoDuration}>{formatDuration(g.durationSeconds)}</span>
                    )}
                  </div>
                  <div className={styles.videoBody}>
                    <span className={styles.videoCat}>{g.category}</span>
                    <h3 className={styles.videoTitle}>{g.title}</h3>
                    <p className={styles.videoDesc}>{g.description}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className={`${styles.videoEmpty} lpReveal`}>
              Видеоуроки скоро появятся. Пока можно посмотреть демо-кабинет
              или задать вопрос на <a href="mailto:support@mtmanalytic.ru" style={{ color: 'var(--lp-accent)' }}>support@mtmanalytic.ru</a>.
            </div>
          )}

          {guides.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 40 }} className="lpReveal">
              <Link to="/guides" className="lpBtn lpBtnGhost">Все видеоуроки</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Тарифы ───────────────────────────────────────── */}
      <section className="lpSection" style={{ background: 'var(--lp-bg-soft)' }} id="pricing">
        <div className="lpContainer">
          <div className="lpSectionHead lpReveal">
            <span className="lpEyebrow">Тарифы</span>
            <h2 className="lpH2">Прозрачные цены без скрытых условий</h2>
            <p className="lpLead">
              Чем длиннее период — тем ниже цена. Пробный период не требует карты.
            </p>
          </div>

          <PricingBlock pricing={pricing} compact />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="lpSection">
        <div className="lpContainer">
          <div className="lpSectionHead lpReveal">
            <span className="lpEyebrow">Вопросы</span>
            <h2 className="lpH2">Частые вопросы</h2>
          </div>
          <FaqBlock limit={5} />
          <div style={{ textAlign: 'center', marginTop: 40 }} className="lpReveal">
            <Link to="/faq" className="lpBtn lpBtnGhost">Все вопросы и ответы</Link>
          </div>
        </div>
      </section>

      {/* ── Devlog ───────────────────────────────────────── */}
      {devlog.length > 0 && (
        <section className="lpSectionTight">
          <div className="lpContainer">
            <div className="lpSectionHead lpReveal" style={{ marginBottom: 40 }}>
              <span className="lpEyebrow">Обновления</span>
              <h2 className="lpH2">Продукт развивается каждую неделю</h2>
            </div>
            <DevlogList items={devlog} />
            <div style={{ textAlign: 'center', marginTop: 36 }} className="lpReveal">
              <Link to="/devlog" className="lpBtn lpBtnGhost">Весь журнал обновлений</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Финальный CTA ────────────────────────────────── */}
      <section className="lpSectionTight">
        <div className="lpContainer">
          <div className={`${styles.cta} lpReveal`}>
            <h2 className="lpH2">Начните с бесплатной недели</h2>
            <p className="lpLead" style={{ marginInline: 'auto' }}>
              Все модули открыты, карта не нужна. Подключите кабинет и посмотрите,
              сколько вы зарабатываете на самом деле.
            </p>
            <div className={styles.ctaActions}>
              <Link to="/register" className="lpBtn lpBtnPrimary lpBtnLg">Создать аккаунт</Link>
              <a href={DEMO_URL} rel="noopener" className="lpBtn lpBtnGhost lpBtnLg">Сначала демо</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
