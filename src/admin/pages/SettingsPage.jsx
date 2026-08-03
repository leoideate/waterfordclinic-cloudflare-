import { useEffect, useState } from 'react'
import { settingsApi, clinicsApi } from '../../lib/adminApi.js'

export default function SettingsPage() {
  const [settings, setSettings] = useState(null)
  const [clinics, setClinics] = useState([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('global')   // global | clinics

  // Per-clinic editable fields
  const [clinicEdits, setClinicEdits] = useState({})

  useEffect(() => {
    Promise.all([settingsApi.get(), clinicsApi.list()]).then(([s, c]) => {
      if (s.ok) setSettings(s.data.data)
      if (c.ok) {
        setClinics(c.data.data)
        const edits = {}
        c.data.data.forEach(cl => { edits[cl.id] = { name: cl.name, address: cl.address, phone: cl.phone, email: cl.email, notification_email: cl.settings?.notification_email || '', confirmation_message: cl.settings?.confirmation_message || '', unavailable_message: cl.settings?.unavailable_message || '' } })
        setClinicEdits(edits)
      }
    })
  }, [])

  const saveGlobal = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    const res = await settingsApi.update(settings)
    setSaving(false)
    if (res.ok) { setSettings(res.data.data); setNotice('Global settings saved.'); setTimeout(() => setNotice(''), 3000) }
    else setError(res.error)
  }

  const saveClinic = async (clinicId) => {
    const edits = clinicEdits[clinicId]
    setSaving(true); setError('')
    // Save base fields + booking settings in two calls
    const base = await clinicsApi.update(clinicId, { name: edits.name, address: edits.address, phone: edits.phone, email: edits.email })
    const book = await clinicsApi.booking(clinicId, {
      notification_email: edits.notification_email || null,
      confirmation_message: edits.confirmation_message || null,
      unavailable_message: edits.unavailable_message || null,
      bookings_enabled: clinics.find(c => c.id === clinicId).settings.bookings_enabled, // preserve
    })
    setSaving(false)
    if (base.ok && book.ok) { setNotice('Clinic saved.'); setTimeout(() => setNotice(''), 3000); const cl = await clinicsApi.list(); if (cl.ok) setClinics(cl.data.data) }
    else setError(base.error || book.error)
  }

  if (!settings) return <div className="loading"><div className="spinner-lg" />Loading…</div>

  return (
    <>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '2px solid #eef2ee' }}>
        <button className={`btn btn-sm ${tab === 'global' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('global')}>Global defaults</button>
        <button className={`btn btn-sm ${tab === 'clinics' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('clinics')}>Clinic details</button>
      </div>

      {notice && <div className="notice notice-ok">{notice}</div>}
      {error && <div className="notice notice-err">{error}</div>}

      {tab === 'global' && (
        <form className="admin-card" onSubmit={saveGlobal}>
          <h2>Global defaults</h2>
          <p className="card-sub">App-wide defaults applied when a clinic doesn't override them.</p>
          <div className="admin-row">
            <div className="admin-field">
              <label>Default slot duration (minutes)</label>
              <select className="admin-select" value={settings.default_slot_minutes} onChange={e => setSettings(s => ({ ...s, default_slot_minutes: parseInt(e.target.value) }))}>
                {[15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>Admin notification email</label>
              <input type="email" className="admin-input" value={settings.admin_notification_email || ''} onChange={e => setSettings(s => ({ ...s, admin_notification_email: e.target.value }))} placeholder="reception@walkingp.ie" />
            </div>
          </div>
          <div className="admin-field">
            <label>Default confirmation message</label>
            <textarea className="admin-textarea" value={settings.default_confirmation} onChange={e => setSettings(s => ({ ...s, default_confirmation: e.target.value }))} />
          </div>
          <div className="admin-field">
            <label>Default unavailable message</label>
            <textarea className="admin-textarea" value={settings.default_unavailable} onChange={e => setSettings(s => ({ ...s, default_unavailable: e.target.value }))} />
          </div>
          <button className="btn btn-primary" disabled={saving}>Save Settings</button>
        </form>
      )}

      {tab === 'clinics' && clinics.map(cl => (
        <div className="admin-card" key={cl.id}>
          <h2>{cl.name}</h2>
          <p className="card-sub">Edit contact details and the messages shown on this clinic's booking form.</p>
          <div className="admin-row">
            <div className="admin-field">
              <label>Clinic name</label>
              <input className="admin-input" value={clinicEdits[cl.id]?.name || ''} onChange={e => setClinicEdits(p => ({ ...p, [cl.id]: { ...p[cl.id], name: e.target.value } }))} />
            </div>
            <div className="admin-field">
              <label>Phone</label>
              <input className="admin-input" value={clinicEdits[cl.id]?.phone || ''} onChange={e => setClinicEdits(p => ({ ...p, [cl.id]: { ...p[cl.id], phone: e.target.value } }))} />
            </div>
          </div>
          <div className="admin-row">
            <div className="admin-field">
              <label>Email</label>
              <input type="email" className="admin-input" value={clinicEdits[cl.id]?.email || ''} onChange={e => setClinicEdits(p => ({ ...p, [cl.id]: { ...p[cl.id], email: e.target.value } }))} />
            </div>
            <div className="admin-field">
              <label>Notification email (where new bookings are sent)</label>
              <input type="email" className="admin-input" value={clinicEdits[cl.id]?.notification_email || ''} onChange={e => setClinicEdits(p => ({ ...p, [cl.id]: { ...p[cl.id], notification_email: e.target.value } }))} />
            </div>
          </div>
          <div className="admin-field">
            <label>Address</label>
            <input className="admin-input" value={clinicEdits[cl.id]?.address || ''} onChange={e => setClinicEdits(p => ({ ...p, [cl.id]: { ...p[cl.id], address: e.target.value } }))} />
          </div>
          <div className="admin-field">
            <label>Confirmation message</label>
            <textarea className="admin-textarea" value={clinicEdits[cl.id]?.confirmation_message || ''} onChange={e => setClinicEdits(p => ({ ...p, [cl.id]: { ...p[cl.id], confirmation_message: e.target.value } }))} />
          </div>
          <div className="admin-field">
            <label>Unavailable message</label>
            <textarea className="admin-textarea" value={clinicEdits[cl.id]?.unavailable_message || ''} onChange={e => setClinicEdits(p => ({ ...p, [cl.id]: { ...p[cl.id], unavailable_message: e.target.value } }))} />
          </div>
          <button className="btn btn-primary" disabled={saving} onClick={() => saveClinic(cl.id)}>Save {cl.name}</button>
        </div>
      ))}
    </>
  )
}
