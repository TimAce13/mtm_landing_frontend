import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode,
} from 'react'
import {
  AUTH_TOKEN_EVENT, clearTokens, getMemoryAccessExpiresAt, getMemoryAccessToken, refreshAccessToken,
} from '../api/client'

// Упрощённый AuthContext биллинга (по мотивам MTMFrontend):
// silent re-auth по refresh-cookie на старте + проактивное продление за 2 минуты
// до истечения. ЕДИНСТВЕННЫЙ путь обновления — refreshAccessToken() (single-flight).

interface AuthState {
  isAuthenticated: boolean
  isInitializing: boolean
  onLoginSuccess: () => void
  onLogout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const PROACTIVE_REFRESH_BEFORE_MS = 2 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleProactiveRefresh = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const expiresAt = getMemoryAccessExpiresAt()
    if (!expiresAt) return
    const delay = Math.max(5_000, new Date(expiresAt).getTime() - Date.now() - PROACTIVE_REFRESH_BEFORE_MS)
    timerRef.current = setTimeout(async () => {
      const token = await refreshAccessToken(PROACTIVE_REFRESH_BEFORE_MS)
      if (!token) {
        clearTokens()
        setIsAuthenticated(false)
      }
    }, delay)
  }, [])

  // Стартовая инициализация: пробуем silent refresh (httpOnly-cookie).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const token = getMemoryAccessToken() ?? await refreshAccessToken()
      if (cancelled) return
      setIsAuthenticated(!!token)
      setIsInitializing(false)
      if (token) scheduleProactiveRefresh()
    })()
    return () => { cancelled = true }
  }, [scheduleProactiveRefresh])

  // Токен обновился (этой вкладкой или соседней) — переставляем таймер.
  useEffect(() => {
    const onToken = () => {
      setIsAuthenticated(true)
      scheduleProactiveRefresh()
    }
    const onLogout = () => {
      clearTokens()
      setIsAuthenticated(false)
    }
    window.addEventListener(AUTH_TOKEN_EVENT, onToken)
    window.addEventListener('auth:logout', onLogout)
    return () => {
      window.removeEventListener(AUTH_TOKEN_EVENT, onToken)
      window.removeEventListener('auth:logout', onLogout)
    }
  }, [scheduleProactiveRefresh])

  const onLoginSuccess = useCallback(() => {
    setIsAuthenticated(true)
    scheduleProactiveRefresh()
  }, [scheduleProactiveRefresh])

  const onLogout = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, isInitializing, onLoginSuccess, onLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
