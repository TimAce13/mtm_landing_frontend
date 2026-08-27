import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { APP_URL, DEMO_URL } from '../config'
import styles from './PublicLayout.module.css'
import '../styles/landing.css'

const NAV = [
  { to: '/features', label: 'Возможности' },
  { to: '/pricing', label: 'Тарифы' },
  { to: '/guides', label: 'Обучение' },
  { to: '/faq', label: 'Вопросы' },
  { to: '/devlog', label: 'Обновления' },
]

/**
 * Общий каркас публичных страниц: одна и та же шапка и подвал везде.
 * Лендинг не наследует переключатель тем приложения — палитра фиксирована
 * (см. styles/landing.css), чтобы вид публичной части был предсказуемым.
 */
export default function PublicLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Переход на другую страницу закрывает мобильное меню и поднимает наверх.
  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink

  return (
    <div className="landing">
      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={`lpContainer ${styles.headerInner}`}>
          <Link to="/" className={styles.brand}>
            <img src="/mtmicon.png" alt="" width={34} height={34} />
            MTM Analytics
          </Link>

          <nav className={styles.nav}>
            {NAV.map(item => (
              <NavLink key={item.to} to={item.to} className={navClass}>{item.label}</NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            {isAuthenticated ? (
              <Link to="/lk" className={`lpBtn lpBtnPrimary lpBtnSm ${styles.desktopOnly}`}>Личный кабинет</Link>
            ) : (
              <>
                <Link to="/login" className={`lpBtn lpBtnGhost lpBtnSm ${styles.desktopOnly}`}>Войти</Link>
                <Link to="/register" className={`lpBtn lpBtnPrimary lpBtnSm ${styles.desktopOnly}`}>Начать бесплатно</Link>
              </>
            )}
            <button
              className={styles.burger}
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <CloseIcon /> : <BurgerIcon />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className={`${styles.mobileMenu} ${styles.mobileMenuOpen}`}>
            {NAV.map(item => (
              <NavLink key={item.to} to={item.to} className={navClass}>{item.label}</NavLink>
            ))}
            <div className={styles.mobileActions}>
              {isAuthenticated ? (
                <Link to="/lk" className="lpBtn lpBtnPrimary lpBtnSm">Личный кабинет</Link>
              ) : (
                <>
                  <Link to="/login" className="lpBtn lpBtnGhost lpBtnSm">Войти</Link>
                  <Link to="/register" className="lpBtn lpBtnPrimary lpBtnSm">Начать</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className="lpContainer">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.footerBrandRow}>
                <img src="/mtmicon.png" alt="" width={34} height={34} />
                MTM Analytics
              </div>
              <p className={styles.footerAbout}>
                Аналитика и управление рекламой для продавцов Ozon: продажи, выкупы,
                юнит-экономика и контроль бюджета в одном кабинете.
              </p>
            </div>

            <div>
              <p className={styles.footerColTitle}>Продукт</p>
              <div className={styles.footerLinks}>
                <Link to="/features">Возможности</Link>
                <Link to="/pricing">Тарифы</Link>
                <a href={DEMO_URL} rel="noopener">Демо-кабинет</a>
                <Link to="/devlog">Обновления</Link>
              </div>
            </div>

            <div>
              <p className={styles.footerColTitle}>Помощь</p>
              <div className={styles.footerLinks}>
                <Link to="/guides">Видеоуроки</Link>
                <Link to="/faq">Вопросы и ответы</Link>
                <a href="mailto:support@mtmanalytic.ru">support@mtmanalytic.ru</a>
              </div>
            </div>

            <div>
              <p className={styles.footerColTitle}>Аккаунт</p>
              <div className={styles.footerLinks}>
                <Link to="/register">Регистрация</Link>
                <Link to="/login">Вход</Link>
                <a href={APP_URL} rel="noopener">Приложение</a>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <span>© {new Date().getFullYear()} MTM Analytics</span>
            <div className={styles.footerLegal}>
              <Link to="/legal/offer">Оферта</Link>
              <Link to="/legal/privacy">Политика конфиденциальности</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function BurgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
