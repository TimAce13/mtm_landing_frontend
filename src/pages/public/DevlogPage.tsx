import { useEffect, useState } from 'react'
import { getDevlog, type DevlogEntry } from '../../api/content'
import { useReveal } from '../../hooks/useReveal'
import { DevlogList } from '../../components/landing/DevlogList'
import { PageHeader } from './PageHeader'

export default function DevlogPage() {
  const rootRef = useReveal<HTMLDivElement>()
  const [items, setItems] = useState<DevlogEntry[]>([])

  useEffect(() => { getDevlog(100).then(setItems).catch(() => { }) }, [])

  return (
    <div ref={rootRef}>
      <PageHeader
        eyebrow="Журнал обновлений"
        title="Что нового в MTM Analytics"
        lead="Мы выпускаем обновления регулярно и коротко рассказываем о каждом: что добавили, что улучшили, что починили."
      />

      <section className="lpSectionTight" style={{ paddingTop: 0 }}>
        <div className="lpContainer">
          <DevlogList items={items} />
        </div>
      </section>
    </div>
  )
}
