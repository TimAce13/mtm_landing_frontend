import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Input.module.css'

// ============================================================
// Input — matches MAUI Entry + Border pattern
// ============================================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  suffix?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, suffix, className = '', id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={styles.wrapper}>
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        )}
        <div className={`${styles.inputWrap} ${error ? styles.hasError : ''}`}>
          <input
            ref={ref}
            id={inputId}
            className={`${styles.input} ${className}`}
            {...rest}
          />
          {suffix && <span className={styles.suffix}>{suffix}</span>}
        </div>
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

// ============================================================
// PasswordInput — Input with show/hide toggle
// ============================================================

interface PasswordInputProps extends Omit<InputProps, 'type' | 'suffix'> {}

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      suffix={
        <button
          type="button"
          className={styles.eyeBtn}
          onClick={() => setVisible(v => !v)}
          tabIndex={-1}
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
        >
          {visible ? (
            // Eye open
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          ) : (
            // Eye closed
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          )}
        </button>
      }
    />
  )
}

export default Input
