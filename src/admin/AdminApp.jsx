import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { NewBookingProvider } from './context/NewBookingContext.jsx'
import AdminLayout from './AdminLayout.jsx'
import AdminLogin from './AdminLogin.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AppointmentsPage from './pages/AppointmentsPage.jsx'
import AvailabilityPage from './pages/AvailabilityPage.jsx'
import BreakTimesPage from './pages/BreakTimesPage.jsx'
import HolidaysPage from './pages/HolidaysPage.jsx'
import ClosuresPage from './pages/ClosuresPage.jsx'
import AdminUsersPage from './pages/AdminUsersPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import '../styles/admin.css'

/** Guard: redirect to /admin/login if not authenticated. */
function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner-lg" />
        Loading admin…
      </div>
    )
  }
  if (!user) return <Navigate to="/admin/login" replace />
  return children
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route path="/*" element={
          <Protected>
            <NewBookingProvider>
              <AdminLayout>
                <Routes>
                  <Route index element={<DashboardPage />} />
                  <Route path="appointments" element={<AppointmentsPage />} />
                  <Route path="availability" element={<AvailabilityPage />} />
                  <Route path="break-times" element={<BreakTimesPage />} />
                  <Route path="holidays" element={<HolidaysPage />} />
                  <Route path="closures" element={<ClosuresPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </AdminLayout>
            </NewBookingProvider>
          </Protected>
        } />
      </Routes>
    </AuthProvider>
  )
}
