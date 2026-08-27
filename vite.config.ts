import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Биллинг-фронт живёт на одном origin с биллинг-API (mtmanalytic.ru + /api),
// поэтому в dev прокси только /api → локальный MTMBilling.Api (5290).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5291,
    proxy: {
      '/api': {
        target: 'http://localhost:5290',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
