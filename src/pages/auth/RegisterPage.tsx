import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { register, errorMessage } from '../../api/billing'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import ThemeToggle from '../../components/ui/ThemeToggle'
import styles from './AuthPages.module.css'

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)

  const canSubmit =
    displayName.trim().length > 0 &&
    email.trim().length > 0 &&
    !isLoading

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setIsLoading(true)
    setError('')
    try {
      await register(email.trim(), displayName.trim())
      setDone(true)
    } catch (err) {
      setError(errorMessage(err))
      setIsLoading(false)
    }
  }

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <img className={styles.logoImg} src="/mtmicon.png" alt="MTM Analytics" width={104} height={104} />
            <h1 className={styles.title}>Почти готово</h1>
          </div>
          <div className={styles.centerCard}>
            <p style={{ margin: 0 }}>
              Мы отправили письмо на <strong>{email.trim()}</strong>.<br />
              Перейдите по ссылке из письма и задайте пароль.
            </p>
            <p className={styles.hint}>Письма нет? Проверьте «Спам», а затем запросите ссылку заново на странице «Не помню пароль».</p>
            <Link to="/login"><Button variant="outline" size="lg" fullWidth>К входу</Button></Link>
          </div>
        </div>
        <ThemeToggle />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <img className={styles.logoImg} src="/mtmicon.png" alt="MTM Analytics" width={104} height={104} />
          <h1 className={styles.title}>Регистрация</h1>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input label="Имя" type="text" placeholder="Как к вам обращаться"
            value={displayName} onChange={e => { setDisplayName(e.target.value); setError('') }}
            disabled={isLoading} autoComplete="name" autoFocus />
          <Input label="Email" type="email" placeholder="you@example.com"
            value={email} onChange={e => { setEmail(e.target.value); setError('') }}
            disabled={isLoading} autoComplete="email" />

          {error && (
            <div className={styles.errorBanner} role="alert">
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth
            loading={isLoading} disabled={!canSubmit} style={{ marginTop: 8 }}>
            {isLoading ? 'Создаём аккаунт...' : 'Создать аккаунт'}
          </Button>
        </form>

        <div className={styles.links}>
          <span style={{ color: 'var(--color-text-muted)' }}>Уже есть аккаунт?</span>
          <Link to="/login">Войти</Link>
        </div>
      </div>
      <ThemeToggle />
    </div>
  )
}
