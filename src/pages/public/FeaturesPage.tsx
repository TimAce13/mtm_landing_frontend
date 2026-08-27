import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPricing, type PricingResponse } from '../../api/content'
import { useReveal } from '../../hooks/useReveal'
import { ModuleIcon } from '../../components/landing/ModuleIcons'
import { PageHeader } from './PageHeader'
import { DEMO_URL } from '../../config'
import styles from './FeaturesPage.module.css'

/** Подробности по каждому модулю: что даёт, какие задачи закрывает, как выглядит. */
const DETAILS: Record<string, { screen?: string; points: string[] }> = {
  analytics: {
    screen: '/screens/campaigns.webp',
    points: [
      'Заказы, выкупы, отмены и возвраты в одной таблице по дням и товарам',
      'Расход рекламы и ДРР по каждой кампании и SKU',
      'Сравнение периодов: текущий против прошлого без ручных выгрузок',
      'Тепловая карта заказов по часам и дням недели',
    ],
  },
  planner: {
    screen: '/screens/supply-planner.webp',
    points: [
      'Прогноз: на сколько дней хватит остатка при текущем темпе продаж',
      'Список товаров, которые закончатся в ближайшие две недели',
      'Рекомендация по объёму поставки с учётом скорости продаж',
      'Раздельный учёт остатков по складам',
    ],
  },
  'unit-economics': {
    screen: '/screens/unit-economics.webp',
    points: [
      'Прибыль по каждому SKU после комиссий, логистики и рекламы',
      'Загрузка себестоимости списком или из файла',
      'Доля расходов в выручке и маржинальность по товарам',
      'Быстрый поиск убыточных позиций',
    ],
  },
  monitoring: {
    screen: '/screens/autobids.webp',
    points: [
      'Контроль ДРР: кампании с перерасходом останавливаются автоматически',
      'Расписания ставок по часам — ночью ниже, в пик выше',
      'Защита дневного бюджета от резкого слива',
      'Журнал всех автоматических действий с возможностью отката',
    ],
  },
  dashboard: {
    screen: '/screens/dashboard.webp',
    points: [
      'Сводка кабинета: заказы, доставлено, отмены, реклама, итог',
      'Динамика по дням с наложением прошлого периода',
      'Складские риски: что заканчивается прямо сейчас',
      'Поиск дубликатов товаров в кампаниях',
    ],
  },
  'design-processor': {
    screen: '/screens/card-processor.webp',
    points: [
      'Пакетная обработка изображений под требования маркетплейса',
      'Приведение карточек к единому стилю',
      'Подготовка комплектов для загрузки без ручной рутины',
    ],
  },
}

export default function FeaturesPage() {
  const rootRef = useReveal<HTMLDivElement>()
  const [pricing, setPricing] = useState<PricingResponse | null>(null)

  useEffect(() => { getPricing().then(setPricing).catch(() => { }) }, [])

  const modules = pricing?.modules ?? []

  return (
    <div ref={rootRef}>
      <PageHeader
        eyebrow="Возможности"
        title={<>Шесть модулей,<br />которые закрывают работу с Ozon</>}
        lead="Дашборд и обработчик карточек входят в любой тариф. Остальные модули подключаются по мере необходимости — платить за всё сразу не нужно."
      />

      {modules.map((m, idx) => {
        const detail = DETAILS[m.code]
        const flip = idx % 2 === 1
        return (
          <section key={m.code} className="lpSectionTight" style={{ background: flip ? 'var(--lp-bg-soft)' : undefined }}>
            <div className="lpContainer">
              <div className={`${styles.row} ${flip ? styles.rowFlip : ''}`}>
                <div className={`${styles.text} lpReveal`}>
                  <div className={styles.iconRow}>
                    <div className={styles.icon}><ModuleIcon code={m.code} size={24} /></div>
                    {m.alwaysIncluded && <span className={styles.badge}>Входит в любой тариф</span>}
                  </div>
                  <h2 className="lpH2" style={{ fontSize: 32 }}>{m.name}</h2>
                  <p className="lpBody" style={{ marginTop: 14, fontSize: 17 }}>{m.description}</p>

                  {detail && (
                    <ul className={styles.points}>
                      {detail.points.map(p => (
                        <li key={p} className={styles.point}>
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                               strokeWidth="2.2" className={styles.pointIcon} aria-hidden="true">
                            <path d="M3 8.5l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {detail?.screen && (
                  <div className={`${styles.shot} lpReveal`} data-reveal-delay="120">
                    <img src={detail.screen} alt={m.name} loading="lazy" width={2200} height={1410} />
                  </div>
                )}
              </div>
            </div>
          </section>
        )
      })}

      <section className="lpSectionTight">
        <div className="lpContainer">
          <div className={`${styles.cta} lpReveal`}>
            <h2 className="lpH2">Посмотрите вживую</h2>
            <p className="lpLead" style={{ marginInline: 'auto' }}>
              Демо-кабинет открыт без регистрации: те же экраны, демонстрационные данные.
            </p>
            <div className={styles.ctaActions}>
              <a href={DEMO_URL} rel="noopener" className="lpBtn lpBtnPrimary lpBtnLg">Открыть демо</a>
              <Link to="/pricing" className="lpBtn lpBtnGhost lpBtnLg">Выбрать тариф</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
