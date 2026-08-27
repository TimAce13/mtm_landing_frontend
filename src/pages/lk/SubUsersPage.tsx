import { useEffect, useState, type FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  createSubUser, deactivateSubUser, errorMessage, getSubUsers, resetSubUserPassword,
  type SubUserRow,
} from '../../api/billing'
import type { LkOutletContext } from '../../layouts/LkLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import styles from './Lk.module.css'

/** Подаккаунты: identity создаётся в приложении, пароль назначает владелец. */
export default function SubUsersPage() {
  const { me, reloadMe } = useOutletContext<LkOutletContext>()

  const [items, setItems] = useState<SubUserRow[]>([])
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const sub = me?.subscription ?? null
  const limitReached = sub != null && sub.activeSubUsers >= sub.maxSubUsers

  const reload = () => { getSubUsers().then(setItems).catch(() => { }) }
  useEffect(reload, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await createSubUser(email.trim(), displayName.trim(), ['*'])
      setSuccess(`Подаккаунт ${email.trim()} создан. Сотруднику ушло письмо со ссылкой — пароль он задаст сам. Вход: app.mtmanalytic.ru`)
      setEmail(''); setDisplayName('')
      setShowForm(false)
      reload()
      reloadMe()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleDeactivate(id: number) {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await deactivateSubUser(id)
      reload()
      reloadMe()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleResetPassword(id: number, subEmail: string) {
    // A-1: владелец не придумывает пароль за сотрудника — приложение шлёт тому ссылку.
    if (!window.confirm(`Отправить ${subEmail} ссылку для смены пароля?`)) return
    setBusy(true)
    setError('')
    try {
      await resetSubUserPassword(id)
      setSuccess(`Письмо со ссылкой отправлено на ${subEmail}`)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Команда</h1>
        <p className={styles.subtitle}>
          Подаккаунты для сотрудников — вход в приложение под своими данными.
          Роли на кабинетах (владелец / участник / просмотр) настраиваются в самом приложении.
        </p>
      </div>

      {error && <div className={styles.errorBanner} role="alert">{error}</div>}
      {success && <div className={styles.successBanner}>{success}</div>}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          Подаккаунты {sub ? `(${sub.activeSubUsers} из ${sub.maxSubUsers})` : ''}
        </h2>

        {items.length === 0 ? (
          <p className={styles.empty}>Подаккаунтов пока нет</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Имя</th>
                <th>Статус</th>
                <th style={{ textAlign: 'right' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map(s => (
                <tr key={s.id}>
                  <td>{s.email}</td>
                  <td>{s.displayName}</td>
                  <td>
                    <span className={s.active ? `${styles.badge} ${styles.badgeSuccess}` : `${styles.badge} ${styles.badgeMuted}`}>
                      {s.active ? 'Активен' : 'Отключён'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {s.active && (
                      <>
                        <Button variant="ghost" size="sm" disabled={busy}
                          onClick={() => handleResetPassword(s.id, s.email)}>
                          Сменить пароль
                        </Button>
                        <Button variant="ghost" size="sm" disabled={busy}
                          onClick={() => handleDeactivate(s.id)}>
                          Отключить
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className={styles.actions}>
          {!showForm ? (
            <Button variant="primary" size="md" disabled={limitReached || !sub}
              onClick={() => { setShowForm(true); setSuccess('') }}>
              {limitReached ? 'Достигнут лимит тарифа' : 'Добавить сотрудника'}
            </Button>
          ) : (
            <form className={styles.form} onSubmit={handleCreate} noValidate>
              <Input label="Email сотрудника" type="email" placeholder="employee@example.com"
                value={email} onChange={e => setEmail(e.target.value)} disabled={busy} autoFocus />
              <Input label="Имя" type="text" placeholder="Имя сотрудника"
                value={displayName} onChange={e => setDisplayName(e.target.value)} disabled={busy} />
              <div className={styles.actions}>
                <Button type="submit" variant="primary" size="md" loading={busy}
                  disabled={busy || !email.trim() || !displayName.trim()}>
                  Создать
                </Button>
                <Button type="button" variant="ghost" size="md" disabled={busy}
                  onClick={() => setShowForm(false)}>
                  Отмена
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
