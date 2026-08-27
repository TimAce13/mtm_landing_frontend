import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  THEMES,
  DEFAULT_THEME,
  normalizeThemeId,
  themeMeta,
  type ThemeId,
  type ThemeScheme,
} from '../theme/themes'

interface ThemeContextValue {
  theme: ThemeId
  /** Светлая тема или тёмная — иногда нужно самим компонентам. */
  scheme: ThemeScheme
  setTheme: (t: ThemeId) => void
  /** Оставлено для совместимости: переключает светлую/тёмную «морскую» пару. */
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const THEME_KEY = 'mtm_theme'

/**
 * Ставит на <html> два атрибута:
 *   data-theme  — конкретная тема (её и читают токены)
 *   data-scheme — светлая/тёмная (правила контраста и нативные контролы)
 * Второй нужен потому, что светлых тем теперь несколько, и завязываться
 * на data-theme="light" стало нельзя.
 */
function applyTheme(theme: ThemeId) {
  const el = document.documentElement
  el.setAttribute('data-theme', theme)
  el.setAttribute('data-scheme', themeMeta(theme).scheme)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(
    () => normalizeThemeId(localStorage.getItem(THEME_KEY)),
  )

  useEffect(() => { applyTheme(theme) }, [theme])

  const setTheme = useCallback((t: ThemeId) => {
    const next = normalizeThemeId(t)
    localStorage.setItem(THEME_KEY, next)
    setThemeState(next)
    applyTheme(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(themeMeta(theme).scheme === 'dark' ? 'light' : DEFAULT_THEME)
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, scheme: themeMeta(theme).scheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}

export { THEMES, type ThemeId }
