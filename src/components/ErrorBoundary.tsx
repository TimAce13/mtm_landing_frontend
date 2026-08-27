import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode; resetKey?: string }
interface State { error: Error | null }

/**
 * Ловит ошибки рендера, чтобы вместо «тупого белого экрана» показать
 * читаемое сообщение + кнопки. Особенно важно в демо-режиме, где раньше
 * любой сбой страницы обнулял весь UI без следа.
 * resetKey (путь маршрута) сбрасывает ошибку при переходе на другую страницу —
 * иначе один упавший экран «залипал» бы на всё приложение.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Ошибка рендера:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: 'var(--color-surface-base, #0f1115)', color: 'var(--color-text-primary, #e6e6e6)',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      }}>
        <div style={{
          maxWidth: 560, width: '100%', padding: 24, borderRadius: 12,
          background: 'var(--color-surface-card, #191c22)', border: '1px solid var(--color-border, #2a2e37)',
        }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Что-то пошло не так</h1>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--color-text-secondary, #9aa0aa)', lineHeight: 1.5 }}>
            Страница упала с ошибкой. Это не белый экран — можно перезагрузить или вернуться на главную.
          </p>
          <pre style={{
            margin: '0 0 16px', padding: 12, borderRadius: 8, fontSize: 12, overflow: 'auto', maxHeight: 200,
            background: 'var(--color-surface-elevated, #0f1115)', color: 'var(--color-error, #ff6b6b)',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>{error.message || String(error)}</pre>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => { this.setState({ error: null }); window.location.reload() }}
              style={{ padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: 'var(--color-accent, #4f8cff)', color: '#fff' }}
            >
              Перезагрузить
            </button>
            <button
              type="button"
              onClick={() => { this.setState({ error: null }); window.location.assign('/app') }}
              style={{ padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: 'transparent', color: 'var(--color-text-primary, #e6e6e6)', border: '1px solid var(--color-border, #2a2e37)' }}
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    )
  }
}
