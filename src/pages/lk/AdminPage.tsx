import { useEffect, useState } from 'react'
import {
  adminDevlogCreate, adminDevlogDelete, adminDevlogList, adminDevlogUpdate,
  adminFaqCreate, adminFaqDelete, adminFaqList, adminFaqUpdate,
  adminGuideCreate, adminGuideDelete, adminGuideList, adminGuideUpdate,
  adminPaymentsForReview, adminResolvePayment,
  checkAdmin, type AdminDevlog, type AdminFaq, type AdminGuide, type ReviewPayment,
} from '../../api/admin'
import { errorMessage } from '../../api/billing'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import styles from './Lk.module.css'
import admin from './AdminPage.module.css'

type Tab = 'faq' | 'guides' | 'devlog' | 'payments'

const EMPTY_FAQ: Omit<AdminFaq, 'id'> = {
  category: 'Оплата', question: '', answer: '', isPublished: true, sortOrder: 100,
}
const EMPTY_GUIDE: Omit<AdminGuide, 'id'> = {
  title: '', description: '', videoUrl: '', thumbnailUrl: '', category: 'Старт',
  durationSeconds: 0, isPublished: true, sortOrder: 100,
}
const EMPTY_DEVLOG: Omit<AdminDevlog, 'id'> = {
  version: '', title: '', summary: '', kind: 'feature',
  releasedOn: new Date().toISOString().slice(0, 10), isPublished: true,
}

/**
 * Админ-панель контента лендинга: FAQ, видеоуроки, журнал обновлений.
 * Маршрут доступен любому вошедшему, но данные отдаёт только сервер и только админу —
 * не-админ увидит сообщение «раздел недоступен» (сервер отвечает masked 404).
 */
export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [tab, setTab] = useState<Tab>('faq')

  useEffect(() => { checkAdmin().then(setIsAdmin) }, [])

  if (isAdmin === null) {
    return <p className={styles.empty}>Проверяем доступ…</p>
  }

  if (!isAdmin) {
    return (
      <>
        <div className={styles.header}>
          <h1 className={styles.title}>Раздел недоступен</h1>
          <p className={styles.subtitle}>Управление контентом доступно только администраторам.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление</h1>
        <p className={styles.subtitle}>Контент публичных страниц и разбор платежей</p>
      </div>

      <div className={admin.tabs}>
        <button type="button" className={`${admin.tab} ${tab === 'faq' ? admin.tabActive : ''}`}
                onClick={() => setTab('faq')}>Вопросы и ответы</button>
        <button type="button" className={`${admin.tab} ${tab === 'guides' ? admin.tabActive : ''}`}
                onClick={() => setTab('guides')}>Видеоуроки</button>
        <button type="button" className={`${admin.tab} ${tab === 'devlog' ? admin.tabActive : ''}`}
                onClick={() => setTab('devlog')}>Обновления</button>
        <button type="button" className={`${admin.tab} ${tab === 'payments' ? admin.tabActive : ''}`}
                onClick={() => setTab('payments')}>Разбор платежей</button>
      </div>

      {tab === 'faq' && <FaqSection />}
      {tab === 'guides' && <GuidesSection />}
      {tab === 'devlog' && <DevlogSection />}
      {tab === 'payments' && <PaymentsReviewSection />}
    </>
  )
}

/** Общая обвязка раздела: загрузка, баннеры, форма создания/редактирования. */
function useCrud<TItem extends { id: number }, TBody>(
  load: () => Promise<TItem[]>,
  create: (b: TBody) => Promise<unknown>,
  update: (id: number, b: TBody) => Promise<unknown>,
  remove: (id: number) => Promise<unknown>,
  empty: TBody,
) {
  const [items, setItems] = useState<TItem[]>([])
  const [draft, setDraft] = useState<TBody>(empty)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const reload = () => { load().then(setItems).catch(() => { }) }
  useEffect(reload, [])

  const startCreate = () => { setEditingId(null); setDraft(empty); setError(''); setSuccess('') }
  const startEdit = (item: TItem) => {
    const { id, ...rest } = item as TItem & Record<string, unknown>
    setEditingId(id)
    setDraft(rest as unknown as TBody)
    setError(''); setSuccess('')
  }

  async function save() {
    setBusy(true); setError(''); setSuccess('')
    try {
      if (editingId === null) await create(draft)
      else await update(editingId, draft)
      setSuccess(editingId === null ? 'Добавлено' : 'Сохранено')
      setDraft(empty); setEditingId(null)
      reload()
    } catch (e) {
      setError(errorMessage(e))
    } finally { setBusy(false) }
  }

  async function destroy(id: number) {
    if (!window.confirm('Удалить запись? Действие необратимо.')) return
    setBusy(true); setError('')
    try {
      await remove(id)
      if (editingId === id) { setEditingId(null); setDraft(empty) }
      reload()
    } catch (e) {
      setError(errorMessage(e))
    } finally { setBusy(false) }
  }

  return { items, draft, setDraft, editingId, busy, error, success, startCreate, startEdit, save, destroy }
}

// ── FAQ ──────────────────────────────────────────────────────────────────

function FaqSection() {
  const c = useCrud<AdminFaq, Omit<AdminFaq, 'id'>>(
    adminFaqList, adminFaqCreate, adminFaqUpdate, adminFaqDelete, EMPTY_FAQ)

  return (
    <>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>{c.editingId === null ? 'Новый вопрос' : `Редактирование #${c.editingId}`}</h2>
        {c.error && <div className={styles.errorBanner}>{c.error}</div>}
        {c.success && <div className={styles.successBanner}>{c.success}</div>}

        <div className={admin.form}>
          <div className={admin.formRow}>
            <Input label="Раздел" value={c.draft.category}
                   onChange={e => c.setDraft({ ...c.draft, category: e.target.value })} disabled={c.busy} />
            <Input label="Порядок" type="number" value={String(c.draft.sortOrder)}
                   onChange={e => c.setDraft({ ...c.draft, sortOrder: Number(e.target.value) || 0 })} disabled={c.busy} />
          </div>
          <Input label="Вопрос" value={c.draft.question}
                 onChange={e => c.setDraft({ ...c.draft, question: e.target.value })} disabled={c.busy} />
          <label className={admin.textareaLabel}>
            Ответ
            <textarea className={admin.textarea} rows={5} value={c.draft.answer}
                      onChange={e => c.setDraft({ ...c.draft, answer: e.target.value })} disabled={c.busy} />
          </label>
          <label className={admin.checkbox}>
            <input type="checkbox" checked={c.draft.isPublished}
                   onChange={e => c.setDraft({ ...c.draft, isPublished: e.target.checked })} disabled={c.busy} />
            Опубликовано на сайте
          </label>
          <div className={styles.actions}>
            <Button variant="primary" size="md" loading={c.busy}
                    disabled={c.busy || !c.draft.question.trim() || !c.draft.answer.trim()}
                    onClick={c.save}>
              {c.editingId === null ? 'Добавить' : 'Сохранить'}
            </Button>
            {c.editingId !== null && (
              <Button variant="ghost" size="md" onClick={c.startCreate} disabled={c.busy}>Отмена</Button>
            )}
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Вопросы ({c.items.length})</h2>
        {c.items.length === 0 ? <p className={styles.empty}>Пока пусто</p> : (
          <div className={admin.list}>
            {c.items.map(item => (
              <div key={item.id} className={admin.row}>
                <div className={admin.rowMain}>
                  <div className={admin.rowTitle}>
                    {item.question}
                    {!item.isPublished && <span className={admin.hidden}>скрыто</span>}
                  </div>
                  <div className={admin.rowMeta}>{item.category} · порядок {item.sortOrder}</div>
                </div>
                <div className={admin.rowActions}>
                  <Button variant="ghost" size="sm" onClick={() => c.startEdit(item)} disabled={c.busy}>Изменить</Button>
                  <Button variant="ghost" size="sm" onClick={() => c.destroy(item.id)} disabled={c.busy}>Удалить</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

// ── Видеоуроки ───────────────────────────────────────────────────────────

function GuidesSection() {
  const c = useCrud<AdminGuide, Omit<AdminGuide, 'id'>>(
    adminGuideList, adminGuideCreate, adminGuideUpdate, adminGuideDelete, EMPTY_GUIDE)

  return (
    <>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>{c.editingId === null ? 'Новый видеоурок' : `Редактирование #${c.editingId}`}</h2>
        {c.error && <div className={styles.errorBanner}>{c.error}</div>}
        {c.success && <div className={styles.successBanner}>{c.success}</div>}

        <div className={admin.form}>
          <Input label="Название" value={c.draft.title}
                 onChange={e => c.setDraft({ ...c.draft, title: e.target.value })} disabled={c.busy} />
          <label className={admin.textareaLabel}>
            Описание
            <textarea className={admin.textarea} rows={3} value={c.draft.description}
                      onChange={e => c.setDraft({ ...c.draft, description: e.target.value })} disabled={c.busy} />
          </label>
          <Input label="Ссылка на видео (embed)" placeholder="https://rutube.ru/play/embed/..."
                 value={c.draft.videoUrl}
                 onChange={e => c.setDraft({ ...c.draft, videoUrl: e.target.value })} disabled={c.busy} />
          <Input label="Обложка (URL, необязательно)" placeholder="https://…/preview.jpg"
                 value={c.draft.thumbnailUrl ?? ''}
                 onChange={e => c.setDraft({ ...c.draft, thumbnailUrl: e.target.value })} disabled={c.busy} />
          <div className={admin.formRow}>
            <Input label="Раздел" value={c.draft.category}
                   onChange={e => c.setDraft({ ...c.draft, category: e.target.value })} disabled={c.busy} />
            <Input label="Длительность, сек" type="number" value={String(c.draft.durationSeconds)}
                   onChange={e => c.setDraft({ ...c.draft, durationSeconds: Number(e.target.value) || 0 })} disabled={c.busy} />
            <Input label="Порядок" type="number" value={String(c.draft.sortOrder)}
                   onChange={e => c.setDraft({ ...c.draft, sortOrder: Number(e.target.value) || 0 })} disabled={c.busy} />
          </div>
          <label className={admin.checkbox}>
            <input type="checkbox" checked={c.draft.isPublished}
                   onChange={e => c.setDraft({ ...c.draft, isPublished: e.target.checked })} disabled={c.busy} />
            Опубликовано на сайте
          </label>
          <div className={styles.actions}>
            <Button variant="primary" size="md" loading={c.busy}
                    disabled={c.busy || !c.draft.title.trim() || !c.draft.videoUrl.trim()}
                    onClick={c.save}>
              {c.editingId === null ? 'Добавить' : 'Сохранить'}
            </Button>
            {c.editingId !== null && (
              <Button variant="ghost" size="md" onClick={c.startCreate} disabled={c.busy}>Отмена</Button>
            )}
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Видеоуроки ({c.items.length})</h2>
        {c.items.length === 0 ? <p className={styles.empty}>Пока пусто</p> : (
          <div className={admin.list}>
            {c.items.map(item => (
              <div key={item.id} className={admin.row}>
                <div className={admin.rowMain}>
                  <div className={admin.rowTitle}>
                    {item.title}
                    {!item.isPublished && <span className={admin.hidden}>скрыто</span>}
                  </div>
                  <div className={admin.rowMeta}>{item.category} · порядок {item.sortOrder}</div>
                </div>
                <div className={admin.rowActions}>
                  <Button variant="ghost" size="sm" onClick={() => c.startEdit(item)} disabled={c.busy}>Изменить</Button>
                  <Button variant="ghost" size="sm" onClick={() => c.destroy(item.id)} disabled={c.busy}>Удалить</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

// ── Devlog ───────────────────────────────────────────────────────────────

function DevlogSection() {
  const c = useCrud<AdminDevlog, Omit<AdminDevlog, 'id'>>(
    adminDevlogList, adminDevlogCreate, adminDevlogUpdate, adminDevlogDelete, EMPTY_DEVLOG)

  return (
    <>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>{c.editingId === null ? 'Новая запись' : `Редактирование #${c.editingId}`}</h2>
        {c.error && <div className={styles.errorBanner}>{c.error}</div>}
        {c.success && <div className={styles.successBanner}>{c.success}</div>}

        <div className={admin.form}>
          <div className={admin.formRow}>
            <Input label="Версия" placeholder="1.5.0" value={c.draft.version}
                   onChange={e => c.setDraft({ ...c.draft, version: e.target.value })} disabled={c.busy} />
            <Input label="Дата релиза" type="date" value={c.draft.releasedOn.slice(0, 10)}
                   onChange={e => c.setDraft({ ...c.draft, releasedOn: e.target.value })} disabled={c.busy} />
            <label className={admin.selectLabel}>
              Тип
              <select className={admin.select} value={c.draft.kind} disabled={c.busy}
                      onChange={e => c.setDraft({ ...c.draft, kind: e.target.value as AdminDevlog['kind'] })}>
                <option value="feature">Новое</option>
                <option value="improvement">Улучшение</option>
                <option value="fix">Исправление</option>
              </select>
            </label>
          </div>
          <Input label="Заголовок" value={c.draft.title}
                 onChange={e => c.setDraft({ ...c.draft, title: e.target.value })} disabled={c.busy} />
          <label className={admin.textareaLabel}>
            Короткое описание
            <textarea className={admin.textarea} rows={3} value={c.draft.summary}
                      onChange={e => c.setDraft({ ...c.draft, summary: e.target.value })} disabled={c.busy} />
          </label>
          <label className={admin.checkbox}>
            <input type="checkbox" checked={c.draft.isPublished}
                   onChange={e => c.setDraft({ ...c.draft, isPublished: e.target.checked })} disabled={c.busy} />
            Опубликовано на сайте
          </label>
          <div className={styles.actions}>
            <Button variant="primary" size="md" loading={c.busy}
                    disabled={c.busy || !c.draft.version.trim() || !c.draft.title.trim() || !c.draft.summary.trim()}
                    onClick={c.save}>
              {c.editingId === null ? 'Добавить' : 'Сохранить'}
            </Button>
            {c.editingId !== null && (
              <Button variant="ghost" size="md" onClick={c.startCreate} disabled={c.busy}>Отмена</Button>
            )}
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Записи ({c.items.length})</h2>
        {c.items.length === 0 ? <p className={styles.empty}>Пока пусто</p> : (
          <div className={admin.list}>
            {c.items.map(item => (
              <div key={item.id} className={admin.row}>
                <div className={admin.rowMain}>
                  <div className={admin.rowTitle}>
                    v{item.version} — {item.title}
                    {!item.isPublished && <span className={admin.hidden}>скрыто</span>}
                  </div>
                  <div className={admin.rowMeta}>
                    {new Date(item.releasedOn).toLocaleDateString('ru-RU')} · {item.kind}
                  </div>
                </div>
                <div className={admin.rowActions}>
                  <Button variant="ghost" size="sm" onClick={() => c.startEdit(item)} disabled={c.busy}>Изменить</Button>
                  <Button variant="ghost" size="sm" onClick={() => c.destroy(item.id)} disabled={c.busy}>Удалить</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}


const MONEY = new Intl.NumberFormat('ru-RU')
// Машинный код → человеческий текст. Сопоставляем по началу строки: после кода
// бывают подробности через двоеточие.
const REASONS: [string, string][] = [
  ['composition_mismatch', 'состав оплаты разошёлся с действующей подпиской'],
  ['quote_stale', 'подписка изменилась после расчёта апгрейда'],
  ['invoice_expired', 'счёт был просрочен на момент оплаты'],
  ['paid_after_closed', 'оплата пришла по уже закрытому счёту'],
  ['partial_refund', 'вернули часть суммы — откатывать состав вручную'],
  ['refund_without_snapshot', 'нечем откатить состав: платёж старше этой возможности'],
  ['amount missing', 'сумму от кассы не удалось разобрать'],
  ['amount/currency mismatch', 'сумма или валюта не совпали со счётом'],
]

function reasonText(raw: string | null): string {
  if (!raw) return 'причина не указана'
  const hit = REASONS.find(([code]) => raw.startsWith(code))
  return hit ? hit[1] : raw
}
const day = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('ru-RU') : '—'

/** Платежи в статусе NeedsReview: деньги приняты, услуга не выдана. Два исхода —
 *  выдать оплаченное или закрыть после возврата в кассе; оба пишутся в аудит. */
function PaymentsReviewSection() {
  const [items, setItems] = useState<ReviewPayment[] | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => adminPaymentsForReview()
    .then(d => setItems(d.items))
    .catch(e => { setItems([]); setError(errorMessage(e)) })

  useEffect(() => { load() }, [])

  const resolve = async (row: ReviewPayment, honour: boolean) => {
    const note = (notes[row.invoiceId] ?? '').trim()
    if (!note) { setError('Опишите, что решили и почему — это остаётся в аудите'); return }
    setBusy(row.invoiceId); setError(''); setSuccess('')
    try {
      await adminResolvePayment(row.invoiceId, honour, note)
      setSuccess(honour
        ? `Услуга выдана: ${row.email}, ${MONEY.format(row.amountRub)} ₽`
        : `Счёт закрыт после возврата: ${row.email}, ${MONEY.format(row.amountRub)} ₽`)
      setNotes(prev => ({ ...prev, [row.invoiceId]: '' }))
      await load()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy('')
    }
  }

  if (items === null) return <p className={styles.empty}>Загружаем…</p>

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Платежи на разборе</h2>
      <p className={styles.subtitle}>
        Деньги списаны, но применить оплату автоматически не удалось. Пока платёж здесь,
        клиент не получил оплаченное — разберите его или верните деньги в кассе.
      </p>

      {error && <div className={styles.errorBanner}>{error}</div>}
      {success && <div className={styles.successBanner}>{success}</div>}

      {items.length === 0 ? (
        <p className={styles.empty}>Разбирать нечего — все платежи применились.</p>
      ) : (
        <div className={admin.list}>
          {items.map(row => (
            <div key={row.invoiceId} className={admin.row}>
              <div className={admin.rowMain}>
                <div className={admin.rowTitle}>
                  {row.email}
                  <span className={admin.hidden}>{MONEY.format(row.amountRub)} ₽</span>
                </div>
                <div className={admin.rowMeta}>
                  {reasonText(row.failReason)}
                </div>
                <div className={admin.rowMeta}>
                  Оплачено: {row.kind === 'Upgrade' ? 'апгрейд до' : 'продление'} «{row.paidPlan}»
                  {row.kind === 'Renewal' && `, ${row.paidMonths} мес`}
                  {row.paidExtraStores > 0 && `, доп. магазинов: ${row.paidExtraStores}`}
                  {' · '}Сейчас у клиента: {row.activePlan
                    ? `«${row.activePlan}» до ${day(row.activePeriodEndUtc)}`
                    : 'подписки нет'}
                  {' · '}Счёт от {day(row.createdAtUtc)}
                </div>
                <div style={{ marginTop: 10 }}>
                  <Input
                    placeholder="Что решили и почему — останется в аудите"
                    value={notes[row.invoiceId] ?? ''}
                    onChange={e => setNotes(prev => ({ ...prev, [row.invoiceId]: e.target.value }))}
                  />
                </div>
              </div>
              <div className={admin.rowActions}>
                <Button variant="primary" disabled={busy === row.invoiceId}
                        onClick={() => resolve(row, true)}>Выдать оплаченное</Button>
                <Button variant="ghost" disabled={busy === row.invoiceId}
                        onClick={() => resolve(row, false)}>Деньги возвращены</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
