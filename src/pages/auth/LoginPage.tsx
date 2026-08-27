import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { startSsoLogin } from '../../api/billing'
import Button from '../../components/ui/Button'
import styles from './AuthPages.module.css'

/**
 * Вход без промежуточного экрана: сразу уводим человека аутентифицироваться и молча
 * возвращаем обратно. Устройство контура (пароль живёт в приложении, обмен одноразовым
 * кодом) — наша внутренняя кухня, пользователю о ней знать незачем: для него это один
 * домен и одна учётная запись.
 *
 * Экран показываем ТОЛЬКО при отказе — иначе на ошибке получился бы цикл редиректов.
 */
const SSO_ERRORS: Record<string, string> = {
  invalid_code: 'Время ссылки истекло. Попробуйте войти ещё раз.',
  account_not_found: 'Для этой учётной записи нет кабинета подписки. Зарегистрируйтесь.',
  sub_user_has_no_billing_account:
    'Это учётная запись сотрудника — кабинет подписки доступен только владельцу.',
  account_blocked: 'Кабинет заблокирован. Напишите в поддержку.',
  email_not_confirmed: 'Сначала задайте пароль по ссылке из письма.',
  sso_not_started: 'Вход нужно начинать с этой страницы. Нажмите кнопку ниже.',
  sso_state_mismatch: 'Ссылка входа не подходит к этой попытке. Начните заново.',
}

export default function LoginPage() {
  const [params] = useSearchParams()
  const errorCode = params.get('error')
  const [isLeaving, setIsLeaving] = useState(!errorCode)

  useEffect(() => {
    if (errorCode) return
    startSsoLogin()
  }, [errorCode])

  if (!errorCode) {
    return (
      <div className={styles.page}>
        <div className={styles.centerCard}>
          <div className={styles.container}>
            <div className={styles.header}>
              <img className={styles.logoImg} src="/mtmicon.png" alt="MTM Analytics" width={104} height={104} />
            </div>
            <p className={styles.hint}>{isLeaving ? 'Входим…' : ''}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.centerCard}>
        <div className={styles.container}>
          <div className={styles.header}>
            <img className={styles.logoImg} src="/mtmicon.png" alt="MTM Analytics" width={104} height={104} />
            <h1 className={styles.title}>Не удалось войти</h1>
          </div>

          <div className={styles.errorBanner} role="alert">
            {SSO_ERRORS[errorCode] ?? 'Попробуйте ещё раз.'}
          </div>

          <Button type="button" onClick={() => { setIsLeaving(true); startSsoLogin() }} disabled={isLeaving}>
            {isLeaving ? 'Входим…' : 'Попробовать снова'}
          </Button>
        </div>
      </div>
    </div>
  )
}
