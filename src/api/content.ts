import client from './client'

// ── Тарифы, модули, периоды ──────────────────────────────────────────────

export interface ModuleInfo {
  code: string
  name: string
  description: string
  alwaysIncluded: boolean
}

export interface PeriodInfo {
  months: number
  discountPercent: number
}

export interface PlanPrice {
  months: number
  discountPercent: number
  perMonthRub: number
  totalRub: number
}

export interface PlanInfo {
  code: string
  name: string
  tagline: string
  basePriceRub: number
  moduleSlots: number
  includesAllModules: boolean
  maxCabinets: number
  maxSubUsers: number
  isPopular: boolean
  prices: PlanPrice[]
}

export interface PricingResponse {
  modules: ModuleInfo[]
  periods: PeriodInfo[]
  plans: PlanInfo[]
  extraStorePriceRub: number
  trialDays: number
}

export const getPricing = () =>
  client.get<PricingResponse>('/api/public/pricing').then(r => r.data)

// ── Контент ──────────────────────────────────────────────────────────────

export interface FaqEntry {
  id: number
  category: string
  question: string
  answer: string
}

export interface GuideEntry {
  id: number
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string | null
  category: string
  durationSeconds: number
}

export interface DevlogEntry {
  id: number
  version: string
  title: string
  summary: string
  kind: 'feature' | 'improvement' | 'fix'
  releasedOn: string
}

export const getFaq = () =>
  client.get<{ items: FaqEntry[] }>('/api/public/faq').then(r => r.data.items)

export const getGuides = () =>
  client.get<{ items: GuideEntry[] }>('/api/public/guides').then(r => r.data.items)

export const getDevlog = (limit = 20) =>
  client.get<{ items: DevlogEntry[] }>(`/api/public/devlog?limit=${limit}`).then(r => r.data.items)

// ── Форматирование ───────────────────────────────────────────────────────

export function formatRub(value: number): string {
  return value.toLocaleString('ru-RU')
}

/** «12 мес.» / «1 мес.» */
export function monthsLabel(months: number): string {
  return `${months} мес.`
}

/** Склонение существительных: plural(3, 'модуль','модуля','модулей') → «3 модуля». */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  const word = mod10 === 1 && mod100 !== 11 ? one
    : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? few
    : many
  return `${n} ${word}`
}

export function formatDuration(seconds: number): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
}
