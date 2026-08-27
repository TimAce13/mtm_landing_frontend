import { useParams } from 'react-router-dom'
import { PageHeader } from './PageHeader'
import { SUPPORT_EMAIL } from '../../config'
import styles from './LegalPage.module.css'

/**
 * Юридические страницы. Тексты — заглушки-каркасы: перед приёмом первого платежа
 * их обязательно заменяет реальная оферта и политика ПДн (152-ФЗ), согласованные юристом.
 */
const DOCS: Record<string, { title: string; eyebrow: string; body: string[] }> = {
  offer: {
    eyebrow: 'Документы',
    title: 'Публичная оферта',
    body: [
      'Текст оферты готовится и будет опубликован до начала приёма платежей.',
      'Здесь будут описаны: предмет договора, порядок оказания услуг, стоимость и порядок расчётов, права и обязанности сторон, ответственность, порядок возврата средств и реквизиты исполнителя.',
      `По вопросам, связанным с условиями оказания услуг, пишите на ${SUPPORT_EMAIL}.`,
    ],
  },
  privacy: {
    eyebrow: 'Документы',
    title: 'Политика конфиденциальности',
    body: [
      'Документ готовится и будет опубликован до начала приёма платежей.',
      'В нём будет описано: какие персональные данные обрабатываются, на каком основании и с какой целью, сроки хранения, порядок передачи третьим лицам, права субъекта персональных данных и порядок отзыва согласия — в соответствии с 152-ФЗ.',
      'Отдельно будет описан порядок работы с ключами доступа к кабинетам маркетплейсов: они хранятся в зашифрованном виде и используются исключительно для загрузки статистики вашего магазина.',
      `Запросы по обработке персональных данных: ${SUPPORT_EMAIL}.`,
    ],
  },
}

export default function LegalPage() {
  const { doc } = useParams<{ doc: string }>()
  const content = DOCS[doc ?? ''] ?? DOCS.offer

  return (
    <div>
      <PageHeader eyebrow={content.eyebrow} title={content.title} />
      <section className="lpSectionTight" style={{ paddingTop: 0 }}>
        <div className="lpContainer">
          <div className={styles.doc}>
            {content.body.map((p, i) => <p key={i} className={styles.para}>{p}</p>)}
          </div>
        </div>
      </section>
    </div>
  )
}
