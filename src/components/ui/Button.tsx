import { forwardRef, type ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

// ============================================================
// Button — matches MAUI PrimaryButton / OutlineButton styles
// ============================================================

export type ButtonVariant = 'primary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const classes = [
      styles.btn,
      styles[variant],
      styles[size],
      fullWidth ? styles.fullWidth : '',
      loading ? styles.loading : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...rest}
      >
        {loading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : null}
        <span className={loading ? styles.loadingText : ''}>{children}</span>
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
