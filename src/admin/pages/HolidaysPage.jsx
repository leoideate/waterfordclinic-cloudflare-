import { useEffect, useState } from 'react'
import { holidaysApi } from '../../lib/adminApi.js'

// Matches the single option in App\Models\Holiday::SCOPES on the backend.
// A multi-clinic client would list one entry per clinic plus a combined
// "both/all" option here.
const SCOPES = [
  { value: 'both', label: 'Waterford Clinic' },
]
const emptyForm = { name: '', date: '', scope: 'both', is_full_day: true, start_time: '', end_time: '', notes: '' }

export default function HolidaysPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const res = await holidaysApi.list()
    if (res.ok) setItems(res.data.data)
  }
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setSaving(true)
    const res = await holidaysApi.create(form)
    setSaving(false)
    if (res.ok) { setForm(emptyForm); setNotice('Holiday added.'); load(); setTimeout(() => setNotice(''), 2500) }
    else setError(res.error)
  }

  const remove = async (id) => { if (confirm('Delete this holiday?')) { await holidaysApi.remove(id); load() } }

  return (
    <>
      {notice && <div className="notice notice-ok">{notice}</div>}

      <div className="admin-card">
        <h2>Add a public holiday / closure</h2>
        <p className="card-sub">Blocks the date (full day or a time window) on the public booking form for the chosen clinic(s).</p>
        {error && <div className="notice notice-err">{error}</div>}
        <form onSubmit={submit}>
          <div className="admin-row">
            <div className="admin-field">
              <label>Holiday name <span className="req">*</span></label>
              <input className="admin-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. St. Patrick's Day" required />
            </div>
            <div className="admin-field">
              <label>Date <span className="req">*</span></label>
              <input type="date" className="admin-input" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e => set('date', e.target.value)} required />
            </div>
          </div>
          <div className="admin-row-3">
            <div className="admin-field">
              <label>Clinic affected</label>
              <select className="admin-select" value={form.scope} onChange={e => set('scope', e.target.value)}>
                {SCOPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>Duration</label>
              <select className="admin-select" value={form.is_full_day ? '1' : '0'} onChange={e => set('is_full_day', e.target.value === '1')}>
                <option value="1">Full day</option>
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
          </div>
          <div className="admin-field">
            <label>Notes (optional)</label>
            <input className="admin-input" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Adding…' : 'Add Closure'}</button>
        </form>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div style={{ padding: '18px 18px 0' }}><h2 style={{ margin: 0 }}>Blocked holidays</h2></div>
        {items.length === 0 ? <div className="empty">No holidays set.</div> : (
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Date</th><th>Clinic</th><th>Duration</th><th></th></tr></thead>
            <tbody>
              {items.map(h => (
                <tr key={h.id}>
                  <td><strong>{h.name}</strong>{h.notes && <><br /><small className="muted">{h.notes}</small></>}</td>
                  <td>{fmtDate(h.date)}</td>
                  <td>{scopeLabel(h.scope)}</td>
                  <td>{h.is_full_day ? 'Full day' : `${fmtTime(h.start_time)} – ${fmtTime(h.end_time)}`}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => remove(h.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

function scopeLabel(v) { return (SCOPES.find(s => s.value === v)?.label) || v }
function fmtTime(t) { return t ? String(t).slice(0, 5) : '—' }
function fmtDate(iso) { return new Date(iso + 'T00:00:00').toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) }
