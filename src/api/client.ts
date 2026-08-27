import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

// Адаптированная копия src/api/client.ts из MTMFrontend (та же механика: токен в памяти,
// httpOnly refresh-cookie, single-flight refresh, BroadcastChannel между вкладками).
// Отличия: эндпоинты /api/auth/*, нет demo-режима, cookie ходит на Path=/api/auth.

export interface RefreshResponse {
  accessToken: string
  accessExpiresInSeconds: number
  refreshExpiresInSeconds: number
}

interface MemoryAccessData {
  accessToken: string
  accessExpiresAt: string
}

// ============================================================
// ACCESS TOKEN — живёт ТОЛЬКО в памяти модуля, никогда в storage.
// Пропадает при перезагрузке страницы (намеренно: silent re-auth по refresh-cookie).
// ============================================================

let _memoryAccess: MemoryAccessData | null = null

export function setMemoryAccessToken(token: string, expiresAt: string): void {
  _memoryAccess = { accessToken: token, accessExpiresAt: expiresAt }
}

export function getMemoryAccessToken(): string | null {
  return _memoryAccess?.accessToken ?? null
}

export function getMemoryAccessExpiresAt(): string | null {
  return _memoryAccess?.accessExpiresAt ?? null
}

export function clearTokens(): void {
  _memoryAccess = null
}

// ============================================================
// DEVICE ID — стабильный UUID на браузер (тот же ключ, что в MTM app)
// ============================================================

const DEVICE_ID_KEY = 'mtm_device_id'

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

// ============================================================
// AXIOS CLIENT — фронт и API на одном origin (в dev — vite-прокси /api),
// поэтому BASE_URL пуст; VITE_API_BASE_URL оставлен как аварийная ручка.
// ============================================================

const ENV_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
export const BASE_URL = import.meta.env.DEV ? '' : ENV_BASE_URL

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  // X-Requested-With — CSRF-маркер для cookie-аутентифицированных /api/auth/refresh и /api/auth/logout.
  headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
  timeout: 45_000,
  withCredentials: true,
})

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getMemoryAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ============================================================
// ОБНОВЛЕНИЕ ТОКЕНА — ровно одна точка на всё приложение (single-flight).
// История: два независимых refresh-а предъявляли один токен дважды → сервер
// видел «кражу» и гасил все сессии. Не дублировать пути обновления!
// ============================================================

const AUTH_CHANNEL_NAME = 'mtm_billing_auth'

const authChannel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(AUTH_CHANNEL_NAME) : null

export const AUTH_TOKEN_EVENT = 'auth:token'

authChannel?.addEventListener('message', (e: MessageEvent) => {
  const msg = e.data as { type?: string; token?: string; expiresAt?: string } | null
  if (msg?.type !== 'token' || !msg.token || !msg.expiresAt) return

  const current = getMemoryAccessExpiresAt()
  if (current && new Date(msg.expiresAt) <= new Date(current)) return

  setMemoryAccessToken(msg.token, msg.expiresAt)
  window.dispatchEvent(new CustomEvent(AUTH_TOKEN_EVENT, { detail: { accessExpiresAt: msg.expiresAt } }))
})

let inFlightRefresh: Promise<string | null> | null = null

async function performRefresh(): Promise<string | null> {
  try {
    const refreshUrl = import.meta.env.DEV ? '/api/auth/refresh' : `${ENV_BASE_URL}/api/auth/refresh`

    // Сырой axios, а не client — иначе перехватчик 401 зациклится сам на себе.
    const { data } = await axios.post<RefreshResponse>(
      refreshUrl,
      { deviceId: getDeviceId() },
      {
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        timeout: 15_000,
        withCredentials: true,
      }
    )

    const accessExpiresAt = new Date(Date.now() + data.accessExpiresInSeconds * 1000).toISOString()
    setMemoryAccessToken(data.accessToken, accessExpiresAt)
    authChannel?.postMessage({ type: 'token', token: data.accessToken, expiresAt: accessExpiresAt })
    window.dispatchEvent(new CustomEvent(AUTH_TOKEN_EVENT, { detail: { accessExpiresAt } }))
    return data.accessToken
  } catch {
    return null
  }
}

export function refreshAccessToken(minRemainingMs = 0): Promise<string | null> {
  if (minRemainingMs > 0) {
    const expiresAt = getMemoryAccessExpiresAt()
    const token = getMemoryAccessToken()
    if (token && expiresAt && new Date(expiresAt).getTime() - Date.now() > minRemainingMs) {
      return Promise.resolve(token)
    }
  }
  if (!inFlightRefresh) {
    inFlightRefresh = performRefresh().finally(() => { inFlightRefresh = null })
  }
  return inFlightRefresh
}

client.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    const isAuthEndpoint =
      originalRequest?.url?.includes('/api/auth/login') ||
      originalRequest?.url?.includes('/api/auth/refresh')

    // ---- Network / 5xx: один повтор для GET ----
    const status = error.response?.status
    const method = (originalRequest?.method ?? '').toLowerCase()
    const isNetworkError = !error.response && (
      error.code === 'ECONNRESET' ||
      error.code === 'ERR_NETWORK' ||
      error.message === 'Network Error' ||
      error.message?.toLowerCase().includes('socket hang')
    )
    if (
      method === 'get' &&
      !originalRequest._retry5xx &&
      !isAuthEndpoint &&
      (isNetworkError || (status && status >= 500))
    ) {
      originalRequest._retry5xx = true
      await new Promise(r => setTimeout(r, 1_500))
      return client(originalRequest)
    }

    // Токен мог обновить сосед (вкладка/запрос) — повторяем с актуальным без сети.
    if (
      error.response?.status === 401 &&
      !originalRequest._retriedWithFreshToken &&
      !isAuthEndpoint
    ) {
      const usedToken = String(originalRequest.headers?.Authorization ?? '').replace(/^Bearer /, '')
      const currentToken = getMemoryAccessToken()
      if (currentToken && currentToken !== usedToken) {
        originalRequest._retriedWithFreshToken = true
        originalRequest.headers.Authorization = `Bearer ${currentToken}`
        return client(originalRequest)
      }
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true

      const newToken = await refreshAccessToken()
      if (!newToken) {
        clearTokens()
        window.dispatchEvent(new CustomEvent('auth:logout'))
        return Promise.reject(error)
      }

      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return client(originalRequest)
    }

    return Promise.reject(error)
  }
)

export default client
