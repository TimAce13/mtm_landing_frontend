/** Внешние адреса продукта. В dev приложение крутится локально на 5173. */
const isDev = import.meta.env.DEV

export const APP_URL = import.meta.env.VITE_APP_URL
  ?? (isDev ? 'http://localhost:5173' : 'https://app.mtmanalytic.ru')

/**
 * Прямая ссылка в демо-кабинет приложения. Приложение включает демо-режим
 * само, увидев ?demo=1 (см. MTMFrontend/src/main.tsx) — регистрация не нужна.
 */
export const DEMO_URL = `${APP_URL}/login?demo=1`

export const SUPPORT_EMAIL = 'support@mtmanalytic.ru'
