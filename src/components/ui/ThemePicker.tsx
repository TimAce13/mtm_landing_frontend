import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../../context/ThemeContext'
import { THEMES, themeMeta } from '../../theme/themes'
import css from './ThemePicker.module.css'

/**
 * Выбор темы оформления.
 *
 * Раньше здесь были две кнопки «Тёмная / Светлая». Тем стало шесть, поэтому
 * это кнопка со списком: в строку они уже не помещаются, а список заодно даёт
 * место под образец цветов и короткое пояснение.
 *
 * Список рендерится ПОРТАЛОМ в body: у сайдбара `overflow: hidden` (без него
 * ломается анимация раскрытия), и выпадашка внутри него просто обрезалась.
 * Поэтому позиция считается вручную от кнопки и прижимается к границам окна.
 *
 * variant:
 *   sidebar  — строка в нижней части навбара, список раскрывается вправо
 *   floating — виджет в углу экранов входа, список раскрывается вверх
 */
export default function ThemePicker({ variant = 'sidebar' }: { variant?: 'sidebar' | 'floating' }) {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const current = themeMeta(theme)

  const close = useCallback(() => setOpen(false), [])

  // Позиция считается после отрисовки панели: до этого неизвестна её высота.
  useLayoutEffect(() => {
    if (!open) { setPos(null); return }
    const t = triggerRef.current?.getBoundingClientRect()
    const p = panelRef.current?.getBoundingClientRect()
    if (!t || !p) return

    const margin = 8
    let left: number
    let top: number
    if (variant === 'sidebar') {
      left = t.right + 10           // вправо от навбара
      top  = t.bottom - p.height    // низом по низу кнопки
    } else {
      left = t.left
      top  = t.top - p.height - 8   // вверх над кнопкой
    }
    left = Math.min(Math.max(margin, left), window.innerWidth  - p.width  - margin)
    top  = Math.min(Math.max(margin, top),  window.innerHeight - p.height - margin)
    setPos({ left, top })
  }, [open, variant])

  // Закрытие по клику мимо и по Esc. Панель лежит в портале, поэтому проверяем
  // и её тоже — иначе клик по пункту засчитывался бы как «мимо».
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return
      close()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', close)
    }
  }, [open, close])

  const panel = open && createPortal(
    <div
      ref={panelRef}
      className={css.panel}
      role="listbox"
      aria-label="Тема оформления"
      style={pos
        ? { left: pos.left, top: pos.top }
        : { left: 0, top: 0, visibility: 'hidden' }}
    >
      <p className={css.panelTitle}>Тема оформления</p>
      {THEMES.map(t => (
        <button
          key={t.id}
          type="button"
          role="option"
          aria-selected={t.id === theme}
          className={`${css.option} ${t.id === theme ? css.optionActive : ''}`}
          onClick={() => { setTheme(t.id); close() }}
        >
          <span className={css.swatch} aria-hidden="true">
            <span style={{ background: t.swatch[0] }} />
            <span style={{ background: t.swatch[1] }} />
            <span style={{ background: t.swatch[2] }} />
          </span>
          <span className={css.optionText}>
            <span className={css.optionLabel}>{t.label}</span>
            <span className={css.optionHint}>{t.hint}</span>
            <span className={css.optionFont}>Шрифт: {t.font}</span>
          </span>
          {t.id === theme && (
            <svg className={css.check} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      ))}
    </div>,
    document.body,
  )

  return (
    <div className={`${css.wrap} ${variant === 'floating' ? css.wrapFloating : css.wrapSidebar}`}>
      <button
        ref={triggerRef}
        type="button"
        className={css.trigger}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={`Тема оформления: ${current.label}`}
      >
        <span className={css.triggerIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
          </svg>
        </span>
        <span className={css.triggerLabel}>{current.label}</span>
        <svg className={`${css.chevron} ${open ? css.chevronOpen : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {panel}
    </div>
  )
}
