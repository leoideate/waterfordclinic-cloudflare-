import { useEffect, useState } from 'react'
import { clinicsApi } from '../../lib/adminApi.js'

export default function AvailabilityPage() {
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  const load = async () => {
    const res = await clinicsApi.list()
    if (res.ok) setClinics(res.data.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 2500) }

  if (loading) return <div className="loading"><div className="spinner-lg" />Loading…</div>

  return (
    <>
      {notice && <div className="notice notice-ok">{notice}</div>}

      <div className="admin-card">
        <h2>Booking on/off</h2>
        <p className="card-sub">Master switch per clinic. When off, the public form shows the "currently unavailable" message for that clinic.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {clinics.map(c => (
            <BookingToggle key={c.id} clinic={c} onSaved={() => { flash(`${c.name} updated.`); load() }} />
          ))}
        </div>
      </div>

      {clinics.map(c => (
        <ClinicScheduleCard key={c.id} clinic={c} onSaved={() => { flash(`${c.name} schedule saved.`); load() }} />
      ))}
    </>
  )
}

/* ---- Master enable/disable toggle ---- */
function BookingToggle({ clinic, onSaved }) {
  const [enabled, setEnabled] = useState(clinic.settings.bookings_enabled)
  const [saving, setSaving] = useState(false)

  useEffect(() => setEnabled(clinic.settings.bookings_enabled), [clinic.settings.bookings_enabled])

  const toggle = async () => {
    setSaving(true)
    const next = !enabled
    setEnabled(next)
    const res = await clinicsApi.booking(clinic.id, { bookings_enabled: next })
    setSaving(false)
    if (!res.ok) { setEnabled(!next); alert(res.error) }
    else onSaved()
  }

  return (
    <div style={{ flex: '1 1 220px', border: '1px solid #eef2ee', borderRadius: 12, padding: 16, background: '#fafdfb' }}>
      <strong>{clinic.name}</strong>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <span className={`badge ${enabled ? 'badge-on' : 'badge-off'}`}>{enabled ? 'Open for bookings' : 'Disabled'}</span>
        <button className={`btn btn-sm ${enabled ? 'btn-danger' : 'btn-success'}`} disabled={saving} onClick={toggle}>
          {saving ? '…' : (enabled ? 'Disable bookings' : 'Enable bookings')}
        </button>
      </div>
    </div>
  )
}

/* ---- Weekly schedule editor (Mon–Sun, incl. Sunday toggle) ---- */
function ClinicScheduleCard({ clinic, onSaved }) {
  const [schedule, setSchedule] = useState(clinic.schedule)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => setSchedule(clinic.schedule), [clinic.schedule])

  const update = (weekday, field, value) => {
    setSchedule(prev => prev.map(row => row.weekday === weekday ? { ...row, [field]: value } : row))
  }

  const save = async () => {
    setSaving(true); setError('')
    const res = await clinicsApi.schedule(clinic.id, schedule)
    setSaving(false)
    if (res.ok) onSaved()
    else setError(res.error)
  }

  return (
    <div className="admin-card">
      <h2>{clinic.name} — weekly schedule</h2>
      <p className="card-sub">
        Set opening hours per weekday. Toggle <strong>Sunday</strong> on to allow Sunday bookings;
        when off, Sundays are not selectable on the public form for this clinic.
      </p>

      <table className="admin-table" style={{ marginBottom: 14 }}>
        <thead>
          <tr><th>Day</th><th>Open?</th><th>Open</th><th>Close</th><th>Slot (min)</th><th>Max / slot</th></tr>
        </thead>
        <tbody>
          {schedule.map(row => (
            <tr key={row.weekday} style={{ background: row.weekday === 0 ? '#fffbe6' : undefined }}>
              <td><strong>{row.weekday_name}</strong>{row.weekday === 0 && <span className="badge badge-off" style={{ marginLeft: 8 }}>Sunday</span>}</td>
              <td>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.is_open} onChange={e => update(row.weekday, 'is_open', e.target.checked)} />
                  {row.is_open ? 'Open' : 'Closed'}
                </label>
              </td>
              <td><input type="time" className="admin-input" value={row.open_time} disabled={!row.is_open} onChange={e => update(row.weekday, 'open_time', e.target.value)} style={{ width: 110 }} /></td>
              <td><input type="time" className="admin-input" value={row.close_time} disabled={!row.is_open} onChange={e => update(row.weekday, 'close_time', e.target.value)} style={{ width: 110 }} /></td>
              <td>
                <select className="admin-select" value={row.slot_minutes} disabled={!row.is_open} onChange={e => update(row.weekday, 'slot_minutes', parseInt(e.target.value))} style={{ width: 90 }}>
                  {[15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </td>
              <td>
                <input type="number" min="1" max="20" className="admin-input" value={row.max_per_slot} disabled={!row.is_open} onChange={e => update(row.weekday, 'max_per_slot', parseInt(e.target.value))} style={{ width: 70 }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {error && <div className="notice notice-err">{error}</div>}
      <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save Settings'}</button>
    </div>
  )
}
