import client from './client'

// Админ-API контента лендинга. Все ручки требуют аккаунт с IsAdmin;
// остальным сервер отвечает masked 404 — раздел просто «не существует».

export interface AdminFaq {
  id: number
  category: string
  question: string
  answer: string
  isPublished: boolean
  sortOrder: number
}

export interface AdminGuide {
  id: number
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string | null
  category: string
  durationSeconds: number
  isPublished: boolean
  sortOrder: number
}

export interface AdminDevlog {
  id: number
  version: string
  title: string
  summary: string
  kind: 'feature' | 'improvement' | 'fix'
  releasedOn: string
  isPublished: boolean
}

export const checkAdmin = () =>
  client.get<{ isAdmin: boolean }>('/api/admin/whoami')
    .then(r => r.data.isAdmin)
    .catch(() => false)

// ── FAQ ──────────────────────────────────────────────────────────────────

export const adminFaqList = () =>
  client.get<{ items: AdminFaq[] }>('/api/admin/faq').then(r => r.data.items)

export const adminFaqCreate = (body: Omit<AdminFaq, 'id'>) =>
  client.post('/api/admin/faq', body)

export const adminFaqUpdate = (id: number, body: Omit<AdminFaq, 'id'>) =>
  client.put(`/api/admin/faq/${id}`, body)

export const adminFaqDelete = (id: number) =>
  client.delete(`/api/admin/faq/${id}`)

// ── Видеоуроки ───────────────────────────────────────────────────────────

export const adminGuideList = () =>
  client.get<{ items: AdminGuide[] }>('/api/admin/guides').then(r => r.data.items)

export const adminGuideCreate = (body: Omit<AdminGuide, 'id'>) =>
  client.post('/api/admin/guides', body)

export const adminGuideUpdate = (id: number, body: Omit<AdminGuide, 'id'>) =>
  client.put(`/api/admin/guides/${id}`, body)

export const adminGuideDelete = (id: number) =>
  client.delete(`/api/admin/guides/${id}`)

// ── Devlog ───────────────────────────────────────────────────────────────

export const adminDevlogList = () =>
  client.get<{ items: AdminDevlog[] }>('/api/admin/devlog').then(r => r.data.items)

export const adminDevlogCreate = (body: Omit<AdminDevlog, 'id'>) =>
  client.post('/api/admin/devlog', body)

export const adminDevlogUpdate = (id: number, body: Omit<AdminDevlog, 'id'>) =>
  client.put(`/api/admin/devlog/${id}`, body)

export const adminDevlogDelete = (id: number) =>
  client.delete(`/api/admin/devlog/${id}`)

// ── Разбор платежей (NeedsReview: деньги приняты, услуга не выдана) ───────

export type ReviewPayment = {
  invoiceId: string
  accountId: number
  email: string
  amountRub: number
  kind: 'Renewal' | 'Upgrade'
  failReason: string | null
  createdAtUtc: string
  checkedAtUtc: string | null
  paidPlan: string
  paidExtraStores: number
  paidMonths: number
  activePlan: string | null
  activeExtraStores: number | null
  activePeriodEndUtc: string | null
}

export const adminPaymentsForReview = () =>
  client.get<{ items: ReviewPayment[]; total: number }>('/api/admin/payments/review').then(r => r.data)

/** honour=true — выдать оплаченное; honour=false — счёт закрыт после возврата в кассе. */
export const adminResolvePayment = (invoiceId: string, honour: boolean, note: string) =>
  client.post(`/api/admin/payments/${invoiceId}/resolve`, { honour, note })
