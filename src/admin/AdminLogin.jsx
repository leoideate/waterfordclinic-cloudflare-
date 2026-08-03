import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { site } from '../config/site.js'
import { useAuth } from './context/AuthContext.jsx'
import { adminRequest } from '../lib/adminApi.js'

export default function AdminLogin() {
  const { user, login, loading } = useAuth()
  const nav = useNavigate()
  const [emailOrUser, setEmailOrUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dbStatus, setDbStatus] = useState(null)   // {ok, message}

  // Already logged in → straight to dashboard
  useEffect(() => {
    if (!loading && user) nav('/admin', { replace: true })
  }, [user, loading, nav])

  // Check backend DB readiness once on mount → show setup guidance if needed
  useEffect(() => {
    adminRequest('GET', '/api/admin/health').then(res => {
      if (res.ok) setDbStatus({ ok: true, seeded: res.data?.admin_user_seeded })
      else if (res.status === 0) setDbStatus({ ok: false, kind: 'backend_down' })
      else setDbStatus({ ok: false, kind: 'db', message: res.data?.message })
    })
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    const res = await login(emailOrUser.trim(), password)
    setSubmitting(false)
    if (res.ok) {
      nav('/admin', { replace: true })
    } else if (res.status === 503 || res.data?.reason_code === 'database_not_configured') {
      // Backend is up but the DB isn't ready — show actionable guidance
      setError(res.data?.message || res.error || 'Database not configured. Please run migrations and seed admin user.')
    } else if (res.status === 0) {
      setError('Cannot reach the backend server. Is Laravel running on http://127.0.0.1:8000 ? (Start it with: php artisan serve)')
    } else if (res.status === 401 || res.data?.success === false) {
      // Clean "invalid creds" message — never the raw Laravel CSRF/error output
      setError(res.data?.message || 'Invalid username or password.')
    } else if (res.status === 419) {
      // CSRF failure — shouldn't happen now (login is CSRF-exempt), but guard
      setError('Login request failed. Please refresh the page and try again.')
    } else {
      setError(res.error || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <div className="brand">
          <svg viewBox="0 0 32 32" width="40" height="40" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="var(--green-600)" />
            <path d="M16 6v20M6 16h20" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
          </svg>
          <div>
            <strong>{site.brand}</strong>
            <small>Admin Login</small>
          </div>
        </div>

        <h1>Sign in to the dashboard</h1>
        <p className="subtle">Manage appointments, availability and clinic settings.</p>

        {/* DB / backend setup guidance — shows when Laravel isn't ready */}
        {dbStatus && !dbStatus.ok && dbStatus.kind === 'backend_down' && (
          <div className="alert-error" role="alert">
            <strong>Backend server not running.</strong><br />
            Start Laravel from the project root:<br />
            <code>php artisan serve</code>
          </div>
        )}
        {dbStatus && !dbStatus.ok && dbStatus.kind === 'db' && (
          <div className="alert-error" role="alert">
            <strong>Database not configured.</strong><br />
            {dbStatus.message}<br /><br />
            <strong>To fix, run from the project root:</strong><br />
            <code>php artisan migrate --seed</code>
          </div>
        )}

        {error && <div className="alert-error" role="alert">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="admin-field">
            <label htmlFor="email">Username or email</label>
            <input id="email" className="admin-input" type="text"
              value={emailOrUser} onChange={e => setEmailOrUser(e.target.value)}
              placeholder="admin" autoComplete="username" required autoFocus />
          </div>
          <div className="admin-field">
            <label htmlFor="pw">Password</label>
            <input id="pw" className="admin-input" type="password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" required />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="admin-hint" style={{ marginTop: 20, textAlign: 'center' }}>
          Staff only. <a href="/">← Back to website</a>
        </p>
      </div>
    </div>
  )
}
