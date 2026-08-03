import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

const NAV = [
  { to: '/admin',                label: 'Dashboard',        icon: '📊', end: true },
  { to: '/admin/appointments',   label: 'Appointments',     icon: '🗓️' },
  { to: '/admin/availability',   label: 'Availability',     icon: '🕐' },
  { to: '/admin/break-times',    label: 'Break Times',      icon: '☕' },
  { to: '/admin/holidays',       label: 'Holidays / Closures', icon: '📅' },
  { to: '/admin/closures',       label: 'Temporary Closures', icon: '🚧' },
  { to: '/admin/users',          label: 'Admin Users',      icon: '👥' },
  { to: '/admin/settings',       label: 'Settings',         icon: '⚙️' },
]

const TITLES = {
  '/admin': 'Dashboard',
  '/admin/appointments': 'Appointments',
  '/admin/availability': 'Clinic Availability',
  '/admin/break-times': 'Doctor Break Times',
  '/admin/holidays': 'Public Holidays',
  '/admin/closures': 'Temporary Closures',
  '/admin/users': 'Admin Users',
  '/admin/settings': 'Settings',
}

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const loc = useLocation()
  const title = TITLES[loc.pathname] || 'Walk In GP Admin'

  // Escape closes the mobile drawer
  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sidebarOpen])

  const handleLogout = async () => {
    if (confirm('Log out of the admin dashboard?')) await logout()
  }

  return (
    <div className="admin-layout">
      {/* Mobile top bar with menu toggle */}
      <div className="admin-mobile-bar" style={{ gridColumn: '1 / -1' }}>
        <button onClick={() => setSidebarOpen(o => !o)}>☰ Menu</button>
        <strong>Walk In GP Admin</strong>
      </div>

      {/* Tapping outside the drawer closes it — on a phone the sidebar covers
          the page and the only other way out was picking a nav item. */}
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={sidebarOpen ? 0 : -1}
        className={`admin-sidebar-backdrop ${sidebarOpen ? 'is-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="var(--green-500)" />
            <path d="M16 6v20M6 16h20" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
          </svg>
          <div>
            <strong>Walk In GP</strong>
            <small>Admin Dashboard</small>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span className="nav-icon">{item.icon}</span> {item.label}
            </NavLink>
          ))}
          <div className="divider" />
          <NavLink to="/" className="back-public">← View public site</NavLink>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLogout() }} className="back-public">⏻ Logout</a>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <h1>{title}</h1>
          <div className="topbar-right">
            <span>Signed in as <strong>{user?.name || 'Admin'}</strong></span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <main className="admin-content">
          <div className="page">{children}</div>
        </main>
      </div>
    </div>
  )
}
