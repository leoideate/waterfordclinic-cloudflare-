import { useEffect, useState } from 'react'
import { breaksApi } from '../../lib/adminApi.js'
import { clinicsApi } from '../../lib/adminApi.js'

const REASONS = [
  { value: 'lunch', label: 'Lunch break' },
  { value: 'doctor_unavailable', label: 'Doctor unavailable' },
  { value: 'emergency', label: 'Emergency break' },
  { value: 'staff_meeting', label: 'Staff meeting' },
  { value: 'training', label: 'Training' },
  { value: 'custom', label: 'Custom reason' },
]
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const emptyForm = { clinic_id: '', weekday: '1', date: '', start_time: '13:00', end_time: '14:00', reason: 'lunch', custom_reason: '', recurrence: 'weekly', notes: '' }

export default function BreakTimesPage() {
  const [items, setItems] = useState([])
  const [clinics, setClinics] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [br, cl] = await Promise.all([breaksApi.list(), clinicsApi.list()])
    if (br.ok) setItems(br.data.data)
    if (cl.ok) setClinics(cl.data.data)
  }
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setSaving(true)
    // weekly → need weekday; once → need date
    if (form.recurrence === 'weekly' && form.weekday === '') { setError('Pick a weekday for weekly breaks.'); setSaving(false); return }
    if (form.recurrence === 'once' && !form.date) { setError('Pick a date for one-off breaks.'); setSaving(false); return }

    const payload = { ...form }
    if (form.recurrence === 'weekly') payload.date = null
    else payload.weekday = null
    payload.clinic_id = payload.clinic_id || null

    const res = await breaksApi.create(payload)
    setSaving(false)
    if (res.ok) { setForm(emptyForm); setNotice('Break added.'); load(); setTimeout(() => setNotice(''), 2500) }
    else setError(res.error)
  }

  const remove = async (id) => {
    if (!confirm('Delete this break?')) return
    await breaksApi.remove(id); load()
  }

  return (
    <>
      {notice && <div className="notice notice-ok">{notice}</div>}

      <div className="admin-card">
        <h2>Add a break time</h2>
        <p className="card-sub">Blocks appointment slots for a clinic (or both), either weekly or as a one-off.</p>
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
              <label>Recurrence</label>
              <select className="admin-select" value={form.recurrence} onChange={e => set('recurrence', e.target.value)}>
                <option value="weekly">Apply weekly</option>
                <option value="once">Apply once</option>
              </select>
            </div>
            <div className="admin-field">
              <label>{form.recurrence === 'weekly' ? 'Weekday' : 'Date'}</label>
              {form.recurrence === 'weekly' ? (
                <select className="admin-select" value={form.weekday} onChange={e => set('weekday', e.target.value)}>
                  {WEEKDAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              ) : (
                <input type="date" className="admin-input" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e => set('date', e.target.value)} />
              )}
            </div>
          </div>
          <div className="admin-row-3">
            <div className="admin-field">
              <label>Start time</label>
              <input type="time" className="admin-input" value={form.start_time} onChange={e => set('start_time', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>End time</label>
              <input type="time" className="admin-input" value={form.end_time} onChange={e => set('end_time', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>Reason</label>
              <select className="admin-select" value={form.reason} onChange={e => set('reason', e.target.value)}>
                {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
          {form.reason === 'custom' && (
            <div className="admin-field">
              <label>Custom reason</label>
              <input className="admin-input" value={form.custom_reason} onChange={e => set('custom_reason', e.target.value)} placeholder="e.g. CPD training" />
            </div>
          )}
          <div className="admin-field">
            <label>Notes (optional)</label>
            <input className="admin-input" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Adding…' : 'Add Break'}</button>
        </form>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div style={{ padding: '18px 18px 0' }}><h2 style={{ margin: 0 }}>Current break times</h2></div>
        {items.length === 0 ? (
          <div className="empty">No break times set.</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Clinic</th><th>When</th><th>Time</th><th>Reason</th><th>Recurrence</th><th></th></tr></thead>
            <tbody>
              {items.map(b => (
                <tr key={b.id}>
                  <td>{b.clinic?.name || 'Both clinics'}</td>
                  <td>{b.recurrence === 'weekly' ? WEEKDAYS[b.weekday] : (b.date ? fmtDate(b.date) : '—')}</td>
                  <td>{fmtTime(b.start_time)} – {fmtTime(b.end_time)}</td>
                  <td>{b.custom_reason || reasonLabel(b.reason)}</td>
                  <td>{b.recurrence === 'weekly' ? 'Weekly' : 'Once'}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => remove(b.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

function reasonLabel(v) { return (REASONS.find(r => r.value === v)?.label) || v }
function fmtTime(t) { return t ? String(t).slice(0, 5) : '—' }
function fmtDate(iso) { return new Date(iso + 'T00:00:00').toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' }) }
