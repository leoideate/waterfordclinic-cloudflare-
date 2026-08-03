import { useEffect, useState } from 'react'
import { closuresApi, clinicsApi } from '../../lib/adminApi.js'

const emptyForm = { clinic_id: '', start_date: '', end_date: '', is_full_day: true, start_time: '', end_time: '', reason: '', notes: '' }

export default function ClosuresPage() {
  const [items, setItems] = useState([])
  const [clinics, setClinics] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [cr, cl] = await Promise.all([closuresApi.list(), clinicsApi.list()])
    if (cr.ok) setItems(cr.data.data)
    if (cl.ok) setClinics(cl.data.data)
  }
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setSaving(true)
    if (!form.start_date) { setError('Pick a start date.'); setSaving(false); return }
    const payload = { ...form, clinic_id: form.clinic_id || null, end_date: form.end_date || null }
    const res = await closuresApi.create(payload)
    setSaving(false)
    if (res.ok) { setForm(emptyForm); setNotice('Closure added.'); load(); setTimeout(() => setNotice(''), 2500) }
    else setError(res.error)
  }

  const remove = async (id) => { if (confirm('Delete this closure?')) { await closuresApi.remove(id); load() } }

  return (
    <>
      {notice && <div className="notice notice-ok">{notice}</div>}

      <div className="admin-card">
        <h2>Add a temporary closure</h2>
        <p className="card-sub">
          Close a clinic (or both) for a full day, half day, custom date range, or specific time window.
          During the closed period the public form hides those slots and shows
          <em> "Appointments are not available during this time."</em>
        </p>
        {error && <div className="notice notice-err">{error}</div>}
        <form onSubmit={submit}>
          <div className="admin-row-3">
            <div className="admin-field">
              <label>Clinic</label>
              <select className="admin-select" value={form.clinic_id} onChange={e => set('clinic_id', e.target.value)}>
                <option value="">Both clinics</option>
                {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>Start date <span className="req">*</span></label>
              <input type="date" className="admin-input" value={form.start_date} min={new Date().toISOString().split('T')[0]} onChange={e => set('start_date', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>End date <span className="req">*</span> <small className="muted">(same as start for one day)</small></label>
              <input type="date" className="admin-input" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
            </div>
          </div>
          <div className="admin-row-3">
            <div className="admin-field">
              <label>Duration</label>
              <select className="admin-select" value={form.is_full_day ? '1' : '0'} onChange={e => set('is_full_day', e.target.value === '1')}>
                <option value="1">Full day(s)</option>
                <option value="0">Specific time window</option>
              </select>
            </div>
            {!form.is_full_day && (
              <div className="admin-field">
                <label>Time window</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="time" className="admin-input" value={form.start_time} onChange={e => set('start_time', e.target.value)} />
                  <input type="time" className="admin-input" value={form.end_time} onChange={e => set('end_time', e.target.value)} />
                </div>
              </div>
            )}
            <div className="admin-field">
              <label>Reason</label>
              <input className="admin-input" value={form.reason} onChange={e => set('reason', e.target.value)} placeholder="e.g. Doctor unavailable" />
            </div>
          </div>
          <div className="admin-field">
            <label>Internal notes (optional)</label>
            <input className="admin-input" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Adding…' : 'Add Closure'}</button>
        </form>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div style={{ padding: '18px 18px 0' }}><h2 style={{ margin: 0 }}>Current temporary closures</h2></div>
        {items.length === 0 ? <div className="empty">No temporary closures.</div> : (
          <table className="admin-table">
            <thead><tr><th>Clinic</th><th>Period</th><th>Time</th><th>Reason</th><th></th></tr></thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id}>
                  <td>{c.clinic?.name || 'Both clinics'}</td>
                  <td>{fmtDate(c.start_date)}{c.end_date && c.end_date !== c.start_date ? ` → ${fmtDate(c.end_date)}` : ''}</td>
                  <td>{c.is_full_day ? 'Full day' : `${fmtTime(c.start_time)} – ${fmtTime(c.end_time)}`}</td>
                  <td>{c.reason || '—'}{c.notes && <><br /><small className="muted">{c.notes}</small></>}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

function fmtTime(t) { return t ? String(t).slice(0, 5) : '—' }
function fmtDate(iso) { return new Date(iso + 'T00:00:00').toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' }) }
