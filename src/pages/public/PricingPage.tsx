import { useEffect, useState } from 'react'
import { getPricing, type PricingResponse } from '../../api/content'
import { useReveal } from '../../hooks/useReveal'
import { PricingBlock } from '../../components/landing/PricingBlock'
import { FaqBlock } from '../../components/landing/FaqBlock'
import { PageHeader } from './PageHeader'

export default function PricingPage() {
  const rootRef = useReveal<HTMLDivElement>()
  const [pricing, setPricing] = useState<PricingResponse | null>(null)

  useEffect(() => { getPricing().then(setPricing).catch(() => { }) }, [])

  return (
    <div ref={rootRef}>
      <PageHeader
        eyebrow="Тарифы"
        title="Платите за модули, которые используете"
        lead="Пробный период — 7 дней бесплатно и без карты. Дальше выбираете тариф: чем длиннее период, тем ниже цена за месяц."
      />

      <section className="lpSectionTight" style={{ paddingTop: 0 }}>
        <div className="lpContainer">
          <PricingBlock pricing={pricing} />
        </div>
      </section>

      <section className="lpSection" style={{ background: 'var(--lp-bg-soft)' }}>
        <div className="lpContainer">
          <div className="lpSectionHead lpReveal">
            <span className="lpEyebrow">Вопросы об оплате</span>
            <h2 className="lpH2">Что важно знать</h2>
          </div>
          <FaqBlock />
        </div>
      </section>
    </div>
  )
}
