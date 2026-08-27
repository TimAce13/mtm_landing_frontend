import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { getMe, logout, type MeResponse } from '../api/billing'
import Button from '../components/ui/Button'
import ThemeToggle from '../components/ui/ThemeToggle'
import styles from './LkLayout.module.css'

export interface LkOutletContext {
  me: MeResponse | null
  reloadMe: () => void
}


const SITE_NAV = [
  { to: '/features', label: 'Возможности' },
  { to: '/pricing', label: 'Тарифы' },
  { to: '/guides', label: 'Обучение' },
  { to: '/faq', label: 'Вопросы' },
  { to: '/devlog', label: 'Обновления' },
]

/** Каркас личного кабинета: верхняя навигация + контентная колонка. */
export default function LkLayout() {
  const [me, setMe] = useState<MeResponse | null>(null)

  const reloadMe = () => {
    getMe().then(setMe).catch(() => { /* 401 обработает интерцептор */ })
  }

  useEffect(reloadMe, [])

  async function handleLogout() {
    await logout()

    // Жёсткая навигация, не роутер: /login без формы сразу ре-логинит через SSO (сессия
    // приложения жива), а на navigate('/') RequireAuth успел бы отрисовать редирект первым.
    window.location.replace('/')
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink

  const lkNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.lkNavLink} ${styles.lkNavLinkActive}` : styles.lkNavLink

  return (
    <div className={styles.page}>
      {/* Первый ряд повторяет публичную шапку, второй добавляет разделы кабинета.
          Разметка своя, не общий компонент с лендингом: там палитра фиксирована, ЛК на токенах тем. */}
      <header className={styles.topbar}>
        <div className={styles.topbarRow}>
          <Link to="/" className={styles.brand} title="На главную">
            <img src="/mtmicon.png" alt="" width={34} height={34} />
            MTM Analytics
          </Link>

          <nav className={styles.nav}>
            {SITE_NAV.map(item => (
              <NavLink key={item.to} to={item.to} className={navClass}>{item.label}</NavLink>
            ))}
          </nav>

          <div className={styles.right}>
            <span className={styles.userEmail}>{me?.account.email}</span>
            <a href={me?.appUrl ?? 'https://app.mtmanalytic.ru'} rel="noopener">
              <Button variant="outline" size="sm">Открыть приложение</Button>
            </a>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Выйти</Button>
          </div>
        </div>

        <div className={styles.lkRow}>
          <nav className={styles.lkNav}>
            <NavLink to="/lk/subscription" className={lkNavClass}>Подписка</NavLink>
            <NavLink to="/lk/subusers" className={lkNavClass}>Команда</NavLink>
            <NavLink to="/lk/guides" className={lkNavClass}>Инструкции</NavLink>
            <NavLink to="/lk/settings" className={lkNavClass}>Настройки</NavLink>
            {me?.account.isAdmin && <NavLink to="/lk/admin" className={lkNavClass}>Управление</NavLink>}
          </nav>
        </div>
      </header>

      <main className={styles.content}>
        <Outlet context={{ me, reloadMe } satisfies LkOutletContext} />
      </main>
      <ThemeToggle />
    </div>
  )
}
