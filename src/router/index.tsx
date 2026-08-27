import { Navigate, type RouteObject } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import AppLoader from '../components/ui/AppLoader'
import PublicLayout from '../layouts/PublicLayout'
import HomePage from '../pages/public/HomePage'
import FeaturesPage from '../pages/public/FeaturesPage'
import PricingPage from '../pages/public/PricingPage'
import GuidesPage from '../pages/public/GuidesPage'
import FaqPage from '../pages/public/FaqPage'
import DevlogPage from '../pages/public/DevlogPage'
import LegalPage from '../pages/public/LegalPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPage from '../pages/auth/ForgotPage'
import LkLayout from '../layouts/LkLayout'
import SubscriptionPage from '../pages/lk/SubscriptionPage'
import SubUsersPage from '../pages/lk/SubUsersPage'
import GuidesLkPage from '../pages/lk/GuidesLkPage'
import SettingsPage from '../pages/lk/SettingsPage'
import AdminPage from '../pages/lk/AdminPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth()
  if (isInitializing) return <AppLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireGuest({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth()
  if (isInitializing) return <AppLoader />
  if (isAuthenticated) return <Navigate to="/lk" replace />
  return <>{children}</>
}

export const routes: RouteObject[] = [
  // Публичная часть — единая шапка и подвал на всех страницах.
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/features', element: <FeaturesPage /> },
      { path: '/pricing', element: <PricingPage /> },
      { path: '/guides', element: <GuidesPage /> },
      { path: '/faq', element: <FaqPage /> },
      { path: '/devlog', element: <DevlogPage /> },
      { path: '/legal/:doc', element: <LegalPage /> },
    ],
  },

  // Аутентификация — отдельные центрированные экраны без шапки.
  { path: '/login', element: <RequireGuest><LoginPage /></RequireGuest> },
  { path: '/register', element: <RequireGuest><RegisterPage /></RequireGuest> },
  { path: '/forgot', element: <ForgotPage /> },

  // Личный кабинет.
  {
    path: '/lk',
    element: <RequireAuth><LkLayout /></RequireAuth>,
    children: [
      { index: true, element: <Navigate to="/lk/subscription" replace /> },
      { path: 'subscription', element: <SubscriptionPage /> },
      { path: 'subusers', element: <SubUsersPage /> },
      { path: 'guides', element: <GuidesLkPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]
