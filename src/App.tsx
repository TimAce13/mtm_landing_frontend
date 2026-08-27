import { useLocation, useRoutes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { routes } from './router'

export default function App() {
  const location = useLocation()
  const element = useRoutes(routes)

  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary resetKey={location.pathname}>
          {element}
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  )
}
