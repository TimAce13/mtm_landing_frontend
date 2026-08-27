import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  checkout, devSimulatePayment, errorMessage, getPayments, setAutoRenew, startTrial,
  type CheckoutResponse, type PaymentRow,
} from '../../api/billing'
import { getPricing, formatRub, monthsLabel, plural, type PricingResponse } from '../../api/content'
import type { LkOutletContext } from '../../layouts/LkLayout'
import Button from '../../components/ui/Button'
import styles from './Lk.module.css'
import sub from './SubscriptionPage.module.css'

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Ожидает оплаты',
  Active: 'Активна',
  Trial: 'Пробный период',
  PastDue: 'Просрочена',
  Canceled: 'Продление отключено',
  Expired: 'Истекла',
  Succeeded: 'Оплачен',
  Failed: 'Ошибка',
  Refunded: 'Возврат',
}

export default function SubscriptionPage() {
  const { me, reloadMe } = useOutletContext<LkOutletContext>()

  const [pricing, setPricing] = useState<PricingResponse | null>(null)
  const [payments, setPayments] = useState<PaymentRow[]>([])

  const [planCode, setPlanCode] = useState('')
  const [months, setMonths] = useState(12)
  const [modules, setModules] = useState<string[]>([])
  const [extraStores, setExtraStores] = useState(0)

  const [pending, setPending] = useState<CheckoutResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const prefilled = useRef(false)
  const lastPlan = useRef<string | null>(null)

  const subscription = me?.subscription ?? null
  const trialAvailable = me?.trialAvailable ?? false

  useEffect(() => {
    getPricing().then(setPricing).catch(() => { })
    getPayments().then(setPayments).catch(() => { })
  }, [])

  // Подставляем состав действующей подписки: продление обязано идти тем же составом.
  useEffect(() => {
    if (prefilled.current || !pricing) return
    prefilled.current = true

    const code = subscription?.planCode
      || pricing.plans.find(x => x.isPopular)?.code
      || pricing.plans[0]?.code || ''
    setPlanCode(code)
    if (!subscription) return

    setExtraStores(subscription.extraStores ?? 0)
    setMonths(subscription.periodMonths && subscription.periodMonths > 0 ? subscription.periodMonths : 12)
    const chosen = pricing.plans.find(x => x.code === code)
    setModules(chosen?.includesAllModules
      ? pricing.modules.filter(m => !m.alwaysIncluded).map(m => m.code)
      : subscription.modules.map(m => m.code))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricing, me])

  const plan = pricing?.plans.find(p => p.code === planCode) ?? null
  const price = plan?.prices.find(p => p.months === months) ?? plan?.prices[0] ?? null
  const selectable = pricing?.modules.filter(m => !m.alwaysIncluded) ?? []
  const slots = plan?.includesAllModules ? selectable.length : (plan?.moduleSlots ?? 0)
  const modulesReady = plan?.includesAllModules || modules.length === slots

  // Смена тарифа сбрасывает модули, не влезшие в слоты. Только при РЕАЛЬНОЙ смене —
  // иначе первый проход затёр бы подставленный выше состав.
  useEffect(() => {
    if (!plan) return
    const previous = lastPlan.current
    lastPlan.current = planCode
    if (previous === null || previous === planCode) return
    if (plan.includesAllModules) { setModules(selectable.map(m => m.code)); return }
    setModules(prev => prev.slice(0, plan.moduleSlots))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planCode, pricing])

  const total = price
    ? price.totalRub + (pricing ? pricing.extraStorePriceRub * extraStores * months * (100 - price.discountPercent) / 100 : 0)
    : 0

  function toggleModule(code: string) {
    if (plan?.includesAllModules) return
    setModules(prev => {
      if (prev.includes(code)) return prev.filter(c => c !== code)
      if (prev.length >= slots) return [...prev.slice(1), code] // вытесняем самый ранний выбор
      return [...prev, code]
    })
  }

  async function handleTrial() {
    setBusy(true); setError(''); setSuccess('')
    try {
      const r = await startTrial()
      setSuccess(`Пробный период активирован на ${r.days} дней — можно работать в приложении.`)
      reloadMe()
    } catch (e) {
      setError(errorMessage(e))
    } finally { setBusy(false) }
  }

  async function handleCheckout() {
    if (!plan || busy) return
    setBusy(true); setError(''); setSuccess('')
    try {
      const res = await checkout(plan.code, months, modules, extraStores)
      setPending(res)
      if (res.cloudPayments.configured) {
        // Боевой режим: здесь инициализируется виджет CloudPayments (появится вместе с ключами).
        setError('Платёжный виджет ещё не подключён — напишите в поддержку.')
      }
    } catch (e) {
      setError(errorMessage(e))
    } finally { setBusy(false) }
  }

  async function handleSimulate() {
    if (!pending || busy) return
    setBusy(true); setError('')
    try {
      await devSimulatePayment(pending.payment.invoiceId)
      setSuccess('Оплата (тестовая) прошла — подписка продлена.')
      setPending(null)
      reloadMe()
      getPayments().then(setPayments).catch(() => { })
    } catch (e) {
      setError(errorMessage(e))
    } finally { setBusy(false) }
  }

  async function handleAutoRenew(enabled: boolean) {
    setBusy(true); setError('')
    try {
      await setAutoRenew(enabled)
      reloadMe()
    } catch (e) {
      setError(errorMessage(e))
    } finally { setBusy(false) }
  }

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Подписка</h1>
        <p className={styles.subtitle}>Тариф, модули, оплата и история платежей</p>
      </div>

      {error && <div className={styles.errorBanner} role="alert">{error}</div>}
      {success && <div className={styles.successBanner}>{success}</div>}

      {/* Текущее состояние */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Текущий тариф</h2>
        {subscription ? (
          <>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Тариф</span>
              <span className={styles.rowValue}>
                {subscription.status === 'Trial' ? 'Пробный период' : subscription.planName ?? '—'}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Статус</span>
              <span className={
                subscription.status === 'Active' || subscription.status === 'Trial' ? styles.statusActive
                  : subscription.status === 'PastDue' || subscription.status === 'Expired' ? styles.statusExpired
                  : styles.statusNone}>
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>{subscription.status === 'Trial' ? 'Действует до' : 'Оплачено до'}</span>
              <span className={styles.rowValue}>
                {subscription.currentPeriodEndUtc ? formatDate(subscription.currentPeriodEndUtc) : '—'}
              </span>
            </div>
            {subscription.modules.length > 0 && (
              <div className={styles.row}>
                <span className={styles.rowLabel}>Модули</span>
                <span className={styles.rowValue}>{subscription.modules.map(m => m.name).join(', ')}</span>
              </div>
            )}
            <div className={styles.row}>
              <span className={styles.rowLabel}>Лимиты</span>
              <span className={styles.rowValue}>
                {plural(subscription.maxCabinets, 'магазин', 'магазина', 'магазинов')} ·{' '}
                {subscription.activeSubUsers}/{subscription.maxSubUsers} подаккаунтов
              </span>
            </div>
            {(subscription.status === 'Active' || subscription.status === 'Canceled') && (
              <div className={styles.actions}>
                <Button variant="outline" size="sm" disabled={busy}
                        onClick={() => handleAutoRenew(!subscription.autoRenew)}>
                  {subscription.autoRenew ? 'Отключить автопродление' : 'Включить автопродление'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className={styles.empty}>Подписка ещё не оформлена.</p>
        )}

        {trialAvailable && (
          <div className={sub.trialBox}>
            <div>
              <div className={sub.trialTitle}>Доступен бесплатный пробный период</div>
              <div className={sub.trialText}>
                {pricing?.trialDays ?? 7} дней со всеми модулями. Карта не нужна — оплата только после окончания.
              </div>
            </div>
            <Button variant="primary" size="md" loading={busy} disabled={busy} onClick={handleTrial}>
              Активировать
            </Button>
          </div>
        )}
      </section>

      {/* Конструктор подписки */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          {subscription?.status === 'Active' ? 'Продлить или сменить тариф' : 'Оформить подписку'}
        </h2>

        {!pricing ? (
          <p className={styles.empty}>Загружаем тарифы…</p>
        ) : (
          <>
            {/* Период */}
            <p className={sub.stepLabel}>1. Период оплаты</p>
            <div className={sub.periods}>
              {pricing.periods.map(p => (
                <button key={p.months} type="button"
                        className={`${sub.period} ${p.months === months ? sub.periodActive : ''}`}
                        onClick={() => setMonths(p.months)}>
                  {monthsLabel(p.months)}
                  {p.discountPercent > 0 && <span className={sub.periodBadge}>−{p.discountPercent}%</span>}
                </button>
              ))}
            </div>

            {/* Тариф */}
            <p className={sub.stepLabel}>2. Тариф</p>
            <div className={sub.plans}>
              {pricing.plans.map(p => {
                const pp = p.prices.find(x => x.months === months) ?? p.prices[0]
                return (
                  <button key={p.code} type="button"
                          className={`${sub.plan} ${p.code === planCode ? sub.planActive : ''}`}
                          onClick={() => setPlanCode(p.code)}>
                    <span className={sub.planName}>
                      {p.name}
                      {p.isPopular && <span className={sub.planTag}>Популярный</span>}
                    </span>
                    <span className={sub.planPrice}>{formatRub(pp.perMonthRub)} ₽<small> / мес</small></span>
                    <span className={sub.planMeta}>
                      {p.includesAllModules ? 'Все модули' : `${plural(p.moduleSlots, 'модуль', 'модуля', 'модулей')} на выбор`}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Модули */}
            <p className={sub.stepLabel}>
              3. Модули
              {plan && !plan.includesAllModules && (
                <span className={sub.stepHint}> — выбрано {modules.length} из {slots}</span>
              )}
            </p>
            <div className={sub.modules}>
              {selectable.map(m => {
                const checked = plan?.includesAllModules || modules.includes(m.code)
                return (
                  <button key={m.code} type="button"
                          className={`${sub.module} ${checked ? sub.moduleActive : ''}`}
                          onClick={() => toggleModule(m.code)}
                          disabled={plan?.includesAllModules}>
                    <span className={sub.moduleCheck}>{checked && <CheckIcon />}</span>
                    <span>
                      <span className={sub.moduleName}>{m.name}</span>
                      <span className={sub.moduleDesc}>{m.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>
            <p className={sub.alwaysNote}>
              Всегда включены: {pricing.modules.filter(m => m.alwaysIncluded).map(m => m.name).join(', ')}
            </p>

            {/* Магазины */}
            <p className={sub.stepLabel}>4. Дополнительные магазины</p>
            <div className={sub.stores}>
              <button type="button" className={sub.storeBtn} disabled={extraStores === 0}
                      onClick={() => setExtraStores(v => Math.max(0, v - 1))}>−</button>
              <span className={sub.storeValue}>
                {plural(1 + extraStores, 'магазин', 'магазина', 'магазинов')}
              </span>
              <button type="button" className={sub.storeBtn} disabled={extraStores >= 20}
                      onClick={() => setExtraStores(v => v + 1)}>+</button>
              <span className={sub.storeHint}>
                {extraStores > 0
                  ? `+${formatRub(pricing.extraStorePriceRub * extraStores)} ₽ / мес`
                  : `Ещё магазин — ${formatRub(pricing.extraStorePriceRub)} ₽ / мес`}
              </span>
            </div>

            {/* Итог */}
            <div className={sub.total}>
              <div>
                <div className={sub.totalLabel}>Итого к оплате</div>
                <div className={sub.totalMeta}>
                  {plan?.name} · {monthsLabel(months)}
                  {price && price.discountPercent > 0 && ` · скидка ${price.discountPercent}%`}
                </div>
              </div>
              <div className={sub.totalValue}>{formatRub(Math.round(total))} ₽</div>
            </div>

            <div className={styles.actions}>
              {!pending ? (
                <Button variant="primary" size="lg" loading={busy}
                        disabled={busy || !plan || !modulesReady}
                        onClick={handleCheckout}>
                  {modulesReady
                    ? 'Перейти к оплате'
                    : `Выберите ещё ${plural(slots - modules.length, 'модуль', 'модуля', 'модулей')}`}
                </Button>
              ) : pending.cloudPayments.devSimulateAvailable && !pending.cloudPayments.configured ? (
                <>
                  <Button variant="primary" size="lg" loading={busy} disabled={busy} onClick={handleSimulate}>
                    Оплатить {formatRub(pending.payment.amount)} ₽ (тест)
                  </Button>
                  <Button variant="ghost" size="lg" disabled={busy} onClick={() => setPending(null)}>Отмена</Button>
                </>
              ) : (
                <div className={styles.infoBanner}>
                  Счёт создан. Оплата картой появится после подключения CloudPayments.
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* История платежей */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>История платежей</h2>
        {payments.length === 0 ? (
          <p className={styles.empty}>Платежей пока нет</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тариф</th>
                <th>Период</th>
                <th>Сумма</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.invoiceId}>
                  <td>{formatDate(p.createdAtUtc)}</td>
                  <td>{p.planName}</td>
                  <td>{p.kind === 'Upgrade' ? 'Переход на тариф' : monthsLabel(p.periodMonths)}</td>
                  <td>{formatRub(p.amountRub)} ₽</td>
                  <td>
                    <span className={
                      p.status === 'Succeeded' ? `${styles.badge} ${styles.badgeSuccess}`
                        : p.status === 'Failed' ? `${styles.badge} ${styles.badgeError}`
                        : `${styles.badge} ${styles.badgeMuted}`}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M3 8.5l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
