import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// ── Clickjacking protection (как в MTM app) ────────────────────
// Отказываемся работать во «чужом» iframe до маунта React.
if (window.self !== window.top) {
  try {
    window.top!.location.href = window.self.location.href
  } catch {
    document.documentElement.style.display = 'none'
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
