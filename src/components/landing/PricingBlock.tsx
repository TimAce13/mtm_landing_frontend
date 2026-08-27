import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatRub, monthsLabel, plural, type PricingResponse } from '../../api/content'
import styles from './PricingBlock.module.css'

interface Props {
  pricing: PricingResponse | null
  /** true — блок на главной: без подробностей, ведёт на /pricing и регистрацию. */
  compact?: boolean
}

/**
 * Блок тарифов: переключатель периодов + карточка пробного периода + платные тарифы.
 * Цены приходят с сервера уже посчитанными по каждому периоду — фронт не дублирует формулу.
 */
export function PricingBlock({ pricing, compact = false }: Props) {
  const periods = pricing?.periods ?? []
  // По умолчанию — самый выгодный период (как в референсе: подсвечены 12 мес.).
  const [months, setMonths] = useState<number | null>(null)
  const activeMonths = months ?? (periods.length ? periods[periods.length - 1].months : 1)

  if (!pricing) {
    return (
      <div className={styles.grid}>
        {[0, 1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
      </div>
    )
  }

  const selectable = pricing.modules.filter(m => !m.alwaysIncluded)
  const alwaysOn = pricing.modules.filter(m => m.alwaysIncluded)

  return (
    <>
      <div className={`${styles.periods} lpReveal`}>
        <div className={styles.periodsInner}>
          {periods.map(p => (
            <button
              key={p.months}
              type="button"
              className={`${styles.period} ${p.months === activeMonths ? styles.periodActive : ''}`}
              onClick={() => setMonths(p.months)}
            >
              {monthsLabel(p.months)}
              {p.discountPercent > 0 && (
                <span className={styles.periodDiscount}>−{p.discountPercent}%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Пробный период */}
        <div className={`${styles.card} ${styles.cardTrial} lpReveal`}>
          <div className={styles.head}>
            <h3 className={styles.name}>Пробный период</h3>
          </div>
          <p className={styles.tagline}>
            Знакомство с платформой без оплаты и без привязки карты.
          </p>

          <div className={styles.priceBlock}>
            <div className={styles.priceOld} />
            <div className={styles.priceRow}>
              <span className={styles.priceFree}>Бесплатно</span>
              <span className={styles.priceFreeUnit}>{pricing.trialDays} дней</span>
            </div>
            <div className={styles.priceTotal}>Дальше — любой тариф на выбор</div>
          </div>

          <p className={styles.listTitle}>Что входит</p>
          <ul className={styles.list}>
            <li className={styles.item}><Check /> Все модули без ограничений</li>
            <li className={styles.item}><Check /> Подключение 1 магазина</li>
            <li className={styles.item}><Check /> Совместная работа с командой</li>
            <li className={styles.item}><Check /> Данные сохранятся после оплаты</li>
          </ul>

          <Link to="/register" className={`lpBtn lpBtnGhost ${styles.action}`}>
            Начать бесплатно
          </Link>
        </div>

        {/* Платные тарифы */}
        {pricing.plans.map(plan => {
          const price = plan.prices.find(p => p.months === activeMonths) ?? plan.prices[0]
          const hasDiscount = price.discountPercent > 0

          return (
            <div
              key={plan.code}
              className={`${styles.card} ${plan.isPopular ? styles.cardPopular : ''} lpReveal`}
            >
              <div className={styles.head}>
                <h3 className={styles.name}>{plan.name}</h3>
                {plan.isPopular && <span className={styles.popularTag}>Популярный</span>}
              </div>
              <p className={styles.tagline}>{plan.tagline}</p>

              <div className={styles.priceBlock}>
                <div className={styles.priceOld}>
                  {hasDiscount && `${formatRub(plan.basePriceRub)} ₽ / месяц`}
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{formatRub(price.perMonthRub)} ₽</span>
                  <span className={styles.priceUnit}>/ месяц</span>
                </div>
                <div className={styles.priceTotal}>
                  {activeMonths > 1
                    ? `${formatRub(price.totalRub)} ₽ за ${monthsLabel(activeMonths)} единым платежом`
                    : 'Оплата помесячно'}
                </div>
              </div>

              <p className={styles.listTitle}>Что входит</p>
              <ul className={styles.list}>
                <li className={styles.item}>
                  <Check />
                  {plan.includesAllModules
                    ? `Все модули: ${selectable.map(m => m.name).join(', ')}`
                    : `${plural(plan.moduleSlots, 'модуль', 'модуля', 'модулей')} на выбор из ${selectable.length}`}
                </li>
                {alwaysOn.map(m => (
                  <li key={m.code} className={styles.item}><Check />{m.name}</li>
                ))}
                <li className={styles.item}>
                  <Check />
                  {plural(plan.maxCabinets, 'магазин', 'магазина', 'магазинов')} Ozon
                </li>
                <li className={styles.item}><Check />Неограниченное число пользователей</li>
                <li className={`${styles.item} ${styles.itemMuted}`}><Check />Совместная работа с командой</li>
              </ul>

              <Link
                to={compact ? '/pricing' : '/register'}
                className={`lpBtn ${plan.isPopular ? 'lpBtnPrimary' : 'lpBtnGhost'} ${styles.action}`}
              >
                {compact ? 'Подробнее' : 'Выбрать тариф'}
              </Link>
            </div>
          )
        })}
      </div>

      <div className={`${styles.extra} lpReveal`}>
        <p className={styles.extraText}>
          <strong>Несколько магазинов?</strong> Подключайте их в один аккаунт и переключайтесь в один клик —
          данные кабинетов не смешиваются.
        </p>
        <div className={styles.extraPrice}>
          + {formatRub(pricing.extraStorePriceRub)} ₽ <span>/ месяц за магазин</span>
        </div>
      </div>
    </>
  )
}

function Check() {
  return (
    <svg className={styles.itemIcon} width="15" height="15" viewBox="0 0 16 16" fill="none"
         stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M3 8.5l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
