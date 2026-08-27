import client, { clearTokens, BASE_URL } from './client'

// ── Типы ответов биллинг-API ─────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string
  accessExpiresInSeconds: number
  refreshExpiresInSeconds: number
}

// Тарифы и модули отдаёт публичный контент-API — см. api/content.ts (getPricing).

export interface MeResponse {
  account: {
    id: number
    email: string
    displayName: string
    emailConfirmed: boolean
    isAdmin: boolean
    createdAtUtc: string
  }
  subscription: {
    status: string
    planCode: string | null
    planName: string | null
    priceRub: number | null
    currentPeriodEndUtc: string | null
    autoRenew: boolean
    periodMonths: number
    extraStores: number
    trialUsed: boolean
    modules: { code: string; name: string }[]
    maxCabinets: number
    maxSubUsers: number
    activeSubUsers: number
  } | null
  trialAvailable: boolean
  appUrl: string
}

export interface CheckoutResponse {
  payment: {
    invoiceId: string
    amount: number
    currency: string
    months: number
    discountPercent: number
    modules: string[]
    extraStores: number
    description: string
    accountEmail: string
  }
  cloudPayments: {
    configured: boolean
    publicId: string
    devSimulateAvailable: boolean
  }
}

export interface PaymentRow {
  invoiceId: string
  planName: string
  amountRub: number
  periodMonths: number
  kind: 'Renewal' | 'Upgrade'
  extraStores: number
  status: string
  receiptUrl: string | null
  createdAtUtc: string
}

export interface SubUserRow {
  id: number
  email: string
  displayName: string
  features: string
  createdAtUtc: string
  active: boolean
}

// ── Машинные коды ошибок → русские сообщения ─────────────────────────────

export const SERVER_ERROR_CODES: Record<string, string> = {
  invalid_credentials: 'Неверный email или пароль',
  email_not_confirmed: 'Почта не подтверждена — проверьте входящие письма',
  account_blocked: 'Аккаунт заблокирован. Напишите в поддержку',
  email_taken: 'Этот email уже зарегистрирован',
  invalid_email: 'Некорректный email',
  password_too_short: 'Пароль должен быть не короче 8 символов',
  invalid_display_name: 'Укажите имя (до 256 символов)',
  too_many_attempts: 'Слишком много попыток — подождите несколько минут',
  invalid_token: 'Ссылка недействительна',
  token_expired: 'Срок действия ссылки истёк — запросите новую',
  token_used: 'Ссылка уже использована',
  plan_not_found: 'Тариф не найден',
  subscription_inactive: 'Подписка неактивна — сначала оплатите тариф',
  sub_user_limit_reached: 'Достигнут лимит подаккаунтов на вашем тарифе',
  invalid_current_password: 'Текущий пароль неверен',
  no_subscription: 'Подписка ещё не оформлена',
  csrf: 'Сессия устарела — перезагрузите страницу',

  // ── Оформление и оплата ──
  payment_in_progress: 'Платёж уже обрабатывается — дождитесь результата, это займёт не больше минуты',
  downgrade_at_renewal_only: 'Перейти на более дешёвый тариф можно при продлении: оплаченный период мы не забираем',
  period_not_found: 'Для этого тарифа такой срок оплаты недоступен',
  modules_required: 'Выберите модули по вашему тарифу',
  invalid_features: 'Некорректный набор модулей',
  invalid_extra_stores: 'Некорректное число дополнительных магазинов',
  trial_already_used: 'Пробный период уже был использован',
  invoice_not_found: 'Счёт не найден',
  invalid_code: 'Ссылка для входа недействительна — войдите ещё раз',

  // ── Платёж принят, но применить его нельзя: разбирает поддержка ──
  invoice_expired: 'Счёт просрочен — оформите оплату заново',
  invoice_not_pending: 'Счёт уже обработан',
  composition_mismatch: 'Состав подписки изменился после выставления счёта — мы уже разбираемся, поддержка свяжется с вами',
  quote_stale: 'Подписка изменилась после расчёта — мы уже разбираемся, поддержка свяжется с вами',
  amount_mismatch: 'Сумма платежа не совпала со счётом — мы уже разбираемся, поддержка свяжется с вами',
}

export function errorMessage(e: unknown): string {
  const err = e as { response?: { data?: { error?: string }, status?: number }, code?: string }
  const code = err?.response?.data?.error
  if (code && SERVER_ERROR_CODES[code]) return SERVER_ERROR_CODES[code]
  if (err?.response?.status === 429) return SERVER_ERROR_CODES.too_many_attempts
  if (err?.code === 'ERR_NETWORK') return 'Нет соединения с сервером'
  return 'Произошла ошибка — попробуйте ещё раз'
}

// ── Auth ─────────────────────────────────────────────────────────────────

/**
 * Регистрация без пароля (A-1): пароль задаётся в приложении по ссылке из письма,
 * которое отправляет оно же. Лендинг пароля не видит и не передаёт.
 */
export async function register(email: string, displayName: string) {
  await client.post('/api/auth/register', { email, displayName })
}

/**
 * Вход — полный переход браузера в приложение. Обратно нас вернут на серверный колбэк,
 * который поставит сессию и отдаст редирект в ЛК. Одноразовый код в JavaScript не попадает.
 */
export function startSsoLogin(): void {
  // АБСОЛЮТНЫЙ адрес обязателен: относительный путь ушёл бы на хост фронта (App Platform),
  // где такой ручки нет. BASE_URL пуст на стенде — там vite-прокси, и относительный верен.
  window.location.assign(`${BASE_URL}/api/auth/sso/start`)
}

export async function logout(): Promise<void> {
  try {
    await client.post('/api/auth/logout')
  } catch {
    // fire-and-forget: cookie чистит сервер; локальный токен сбрасываем всегда
  }
  clearTokens()
}

export const forgotPassword = (email: string) => client.post('/api/auth/forgot', { email })

// ── ЛК ───────────────────────────────────────────────────────────────────

export const getMe = () => client.get<MeResponse>('/api/me').then(r => r.data)

/** Оформление: тариф + период + выбранные модули + дополнительные магазины. */
export const checkout = (planCode: string, months: number, modules: string[], extraStores: number) =>
  client.post<CheckoutResponse>('/api/subscription/checkout',
    { planCode, months, modules, extraStores }).then(r => r.data)

/** Бесплатный пробный период (один раз на аккаунт). */
export const startTrial = () =>
  client.post<{ trialEndsAtUtc: string; days: number }>('/api/subscription/trial').then(r => r.data)
export const setAutoRenew = (enabled: boolean) =>
  client.post('/api/subscription/auto-renew', { enabled })
export const getPayments = () =>
  client.get<{ items: PaymentRow[] }>('/api/payments').then(r => r.data.items)
/** Смена пароля живёт в приложении: просим выслать ссылку на почту владельца. */
export const requestPasswordLink = () => client.post('/api/me/account/password-link')

// ── Подаккаунты ──────────────────────────────────────────────────────────

export const getSubUsers = () =>
  client.get<{ items: SubUserRow[] }>('/api/subusers').then(r => r.data.items)
export const createSubUser = (email: string, displayName: string, features: string[]) =>
  client.post('/api/subusers', { email, displayName, features })
export const deactivateSubUser = (id: number) => client.post(`/api/subusers/${id}/deactivate`)
/** Владелец лишь запускает отправку ссылки — пароль сотрудник задаёт сам в приложении. */
export const resetSubUserPassword = (id: number) =>
  client.post(`/api/subusers/${id}/reset-password`)

// ── Dev-заглушка оплаты (только локальная разработка) ────────────────────

export const devSimulatePayment = (invoiceId: string) =>
  client.post('/api/dev/simulate-payment', { invoiceId })
