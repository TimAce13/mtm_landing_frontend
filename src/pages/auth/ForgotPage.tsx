import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword, errorMessage } from '../../api/billing'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import ThemeToggle from '../../components/ui/ThemeToggle'
import styles from './AuthPages.module.css'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || isLoading) return
    setIsLoading(true)
    setError('')
    try {
      await forgotPassword(email.trim())
      setDone(true)
    } catch (err) {
      setError(errorMessage(err))
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <img className={styles.logoImg} src="/mtmicon.png" alt="MTM Analytics" width={104} height={104} />
          <h1 className={styles.title}>Сброс пароля</h1>
        </div>

        {done ? (
          <div className={styles.centerCard}>
            <div className={styles.successBanner}>
              <span>Если аккаунт с адресом <strong>{email.trim()}</strong> существует — мы отправили ссылку для сброса пароля. Ссылка действует 1 час.</span>
            </div>
            <Link to="/login"><Button variant="outline" size="lg" fullWidth>К входу</Button></Link>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input label="Email" type="email" placeholder="you@example.com"
              value={email} onChange={e => { setEmail(e.target.value); setError('') }}
              disabled={isLoading} autoComplete="email" autoFocus />

            {error && (
              <div className={styles.errorBanner} role="alert">
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth
              loading={isLoading} disabled={!email.trim() || isLoading}>
              Отправить ссылку
            </Button>

            <div className={styles.links}>
              <Link to="/login">Вспомнили пароль? Войти</Link>
            </div>
          </form>
        )}
      </div>
      <ThemeToggle />
    </div>
  )
}
