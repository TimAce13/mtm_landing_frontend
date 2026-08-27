import type { ReactNode } from 'react'

/**
 * Иконки модулей — inline SVG в стиле рейки приложения (24×24, stroke 1.7).
 * Ключ = code модуля из БД; неизвестный код получает нейтральную иконку.
 */
const ICONS: Record<string, ReactNode> = {
  analytics: (
    <>
      <path d="M4 19V10M9.5 19V5M15 19v-6M20.5 19v-9" strokeLinecap="round" />
    </>
  ),
  planner: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.5h17M8 3.5V6M16 3.5V6" strokeLinecap="round" />
      <path d="M8 13.5h4" strokeLinecap="round" />
    </>
  ),
  'unit-economics': (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v10M14.5 9.5c0-1.1-1.1-1.8-2.5-1.8s-2.5.7-2.5 1.8 1 1.6 2.5 1.9 2.6.9 2.6 2-1.2 1.9-2.6 1.9-2.6-.8-2.6-1.9" strokeLinecap="round" />
    </>
  ),
  monitoring: (
    <>
      <path d="M3.5 12.5h4l2.5-6 3 12 2.5-6h5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="2" />
    </>
  ),
  'design-processor': (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="M4 16.5l4.5-4 3.5 3 3-2.5 5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
}

const FALLBACK: ReactNode = (
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8v4.5l3 2" strokeLinecap="round" />
  </>
)

export function ModuleIcon({ code, size = 22 }: { code: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      {ICONS[code] ?? FALLBACK}
    </svg>
  )
}
