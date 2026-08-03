import { useEffect, useState } from 'react'
import { usersApi } from '../../lib/adminApi.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminUsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Add-user form
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  // Change-password form (for the logged-in user)
  const [pw, setPw] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [pwError, setPwError] = useState('')
  const [pwNotice, setPwNotice] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  const load = async () => {
    const res = await usersApi.list()
    if (res.ok) setUsers(res.data.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addUser = async (e) => {
    e.preventDefault()
    setError(''); setSaving(true)
    const res = await usersApi.create(form)
    setSaving(false)
    if (res.ok) {
      setForm({ name: '', email: '', username: '', password: '', password_confirmation: '' })
      setNotice('Admin user added.')
      load()
      setTimeout(() => setNotice(''), 3000)
    } else setError(res.error)
  }

  const toggleActive = async (u) => {
    if (u.id === me.id) { alert("You can't disable your own account."); return }
    if (u.is_active) {
      if (!confirm(`Disable ${u.name}? They won't be able to log in.`)) return
      const res = await usersApi.remove(u.id)
      if (!res.ok) alert(res.error)
    } else {
      await usersApi.update(u.id, { is_active: true })
    }
    load()
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setPwError(''); setPwSaving(true)
    const res = await usersApi.password(me.id, pw)
    setPwSaving(false)
    if (res.ok) {
      setPw({ current_password: '', password: '', password_confirmation: '' })
      setPwNotice(res.data.message || 'Password changed successfully.')
      setTimeout(() => setPwNotice(''), 4000)
    } else setPwError(res.error)
  }

  if (loading) return <div className="loading"><div className="spinner-lg" />Loading…</div>

  return (
    <>
      {/* Change own password */}
      <div className="admin-card">
        <h2>Change your password</h2>
        <p className="card-sub">
          Requires your current password. New password must be at least 8 characters with upper &amp; lower case,
          a number, and a special character.
        </p>
        {pwNotice && <div className="notice notice-ok">{pwNotice}</div>}
        {pwError && <div className="notice notice-err">{pwError}</div>}
        <form onSubmit={changePassword}>
          <div className="admin-row-3">
            <div className="admin-field">
              <label>Current password <span className="req">*</span></label>
              <input type="password" className="admin-input" value={pw.current_password} onChange={e => setPw(p => ({ ...p, current_password: e.target.value }))} required autoComplete="current-password" />
            </div>
            <div className="admin-field">
              <label>New password <span className="req">*</span></label>
              <input type="password" className="admin-input" value={pw.password} onChange={e => setPw(p => ({ ...p, password: e.target.value }))} required autoComplete="new-password" />
            </div>
            <div className="admin-field">
              <label>Confirm new password <span className="req">*</span></label>
              <input type="password" className="admin-input" value={pw.password_confirmation} onChange={e => setPw(p => ({ ...p, password_confirmation: e.target.value }))} required autoComplete="new-password" />
            </div>
          </div>
          <button className="btn btn-primary" disabled={pwSaving}>{pwSaving ? 'Changing…' : 'Change Password'}</button>
        </form>
      </div>

      {/* Add admin */}
      <div className="admin-card">
        <h2>Add another admin</h2>
        {notice && <div className="notice notice-ok">{notice}</div>}
        {error && <div className="notice notice-err">{error}</div>}
        <form onSubmit={addUser}>
          <div className="admin-row">
            <div className="admin-field">
              <label>Name <span className="req">*</span></label>
              <input className="admin-input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="admin-field">
              <label>Email <span className="req">*</span></label>
              <input type="email" className="admin-input" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
          </div>
          <div className="admin-row">
            <div className="admin-field">
              <label>Username (optional)</label>
              <input className="admin-input" value={form.username} onChange={e => set('username', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>Temporary password <span className="req">*</span></label>
              <input type="password" className="admin-input" value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>
          </div>
          <div className="admin-field">
            <label>Confirm temporary password <span className="req">*</span></label>
            <input type="password" className="admin-input" value={form.password_confirmation} onChange={e => set('password_confirmation', e.target.value)} required />
          </div>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Adding…' : 'Add Admin'}</button>
        </form>
      </div>

      {/* List */}
      <div className="admin-card" style={{ padding: 0 }}>
        <div style={{ padding: '18px 18px 0' }}><h2 style={{ margin: 0 }}>All admin users</h2></div>
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Last login</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong>{u.id === me.id && <span className="badge badge-on" style={{ marginLeft: 8 }}>You</span>}</td>
                <td>{u.email}<br /><small className="muted">@{u.username || '—'}</small></td>
                <td>{u.last_login_at ? new Date(u.last_login_at).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}</td>
                <td><span className={`badge ${u.is_active ? 'badge-on' : 'badge-off'}`}>{u.is_active ? 'Active' : 'Disabled'}</span></td>
                <td>
                  {u.id !== me.id && (
                    <button className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleActive(u)}>
                      {u.is_active ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
