import { useState, type FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import { requestPasswordLink, errorMessage } from '../../api/billing'
import type { LkOutletContext } from '../../layouts/LkLayout'
import Button from '../../components/ui/Button'
import styles from './Lk.module.css'

export default function SettingsPage() {
  const { me } = useOutletContext<LkOutletContext>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const canSubmit = !busy

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await requestPasswordLink()
      setSuccess('Письмо со ссылкой отправлено на вашу почту. Пароль задаётся в приложении.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Настройки</h1>
        <p className={styles.subtitle}>Аккаунт и безопасность</p>
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Аккаунт</h2>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Email</span>
          <span className={styles.rowValue}>{me?.account.email ?? '—'}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Имя</span>
          <span className={styles.rowValue}>{me?.account.displayName ?? '—'}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Регистрация</span>
          <span className={styles.rowValue}>
            {me ? new Date(me.account.createdAtUtc).toLocaleDateString('ru-RU') : '—'}
          </span>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Смена пароля</h2>
        <p className={styles.subtitle} style={{ marginBottom: 16 }}>
          Пароль задаётся в приложении app.mtmanalytic.ru и общий для него и этого кабинета. Мы пришлём на вашу почту ссылку — сам пароль лендинг не видит.
        </p>

        {error && <div className={styles.errorBanner} role="alert">{error}</div>}
        {success && <div className={styles.successBanner}>{success}</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.actions}>
            <Button type="submit" variant="primary" size="md" loading={busy} disabled={!canSubmit}>
              Прислать ссылку для смены пароля
            </Button>
          </div>
        </form>
      </section>
    </>
  )
}
