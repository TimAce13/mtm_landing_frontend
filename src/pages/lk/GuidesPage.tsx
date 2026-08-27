import styles from './Lk.module.css'

interface Guide {
  tag: string
  title: string
  desc: string
}

// Каркас раздела инструкций: наполняется статьями/видео по мере записи.
const GUIDES: Guide[] = [
  { tag: 'Старт', title: 'Подключение кабинета Ozon', desc: 'Где взять Client-Id и Api-Key в личном кабинете Ozon Seller и как добавить кабинет в MTM Analytics.' },
  { tag: 'Старт', title: 'Первый вход в приложение', desc: 'Обзор интерфейса: дашборд, кампании, аналитика заказов и выкупов.' },
  { tag: 'Реклама', title: 'Контроль ДРР и SpendGuard', desc: 'Как настроить автоматическую защиту рекламного бюджета и лимиты ДРР по товарам.' },
  { tag: 'Реклама', title: 'Авто-ставки по расписанию', desc: 'Управление ставками по часам: ночные понижения, пиковые повышения, стратегии.' },
  { tag: 'Команда', title: 'Подаккаунты и роли', desc: 'Как выдать сотруднику доступ и ограничить его роль на кабинете (участник / просмотр).' },
  { tag: 'Финансы', title: 'Юнит-экономика и себестоимость', desc: 'Загрузка себестоимости и чтение отчёта прибыльности по SKU.' },
]

export default function GuidesPage() {
  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Инструкции</h1>
        <p className={styles.subtitle}>Гайды и видеоуроки по работе с сервисом</p>
      </div>

      <section className={styles.card}>
        <div className={styles.guideGrid}>
          {GUIDES.map(g => (
            <div key={g.title} className={styles.guideCard}>
              <span className={styles.guideTag}>{g.tag}</span>
              <h3 className={styles.guideTitle}>{g.title}</h3>
              <p className={styles.guideDesc}>{g.desc}</p>
              <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Скоро</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
