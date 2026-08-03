import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { appointmentsApi } from '../../lib/adminApi.js'
import AppointmentDetail from '../components/AppointmentDetail.jsx'
import { useNewBooking } from '../context/NewBookingContext.jsx'

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No-show' },
]
// Must match the clinic slugs seeded in database/seeders/ClinicSeeder.php.
// A single-clinic site only needs the "All" option — filtering by clinic is
// meaningless with one location, but it's kept as a no-op filter rather than
// removed, so this list is exactly what a second location would extend.
const CLINICS = [
  { value: '', label: 'All appointments' },
]

export default function AppointmentsPage() {
  // Dashboard stat tiles link here with ?status=... or ?from=...&to=...
  // (e.g. "Confirmed" -> ?status=confirmed) — read once on mount so the
  // filter is already applied when the page loads.
  const [searchParams] = useSearchParams()
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [clinic, setClinic] = useState(() => searchParams.get('clinic') || '')
  const [status, setStatus] = useState(() => searchParams.get('status') || '')
  const [from, setFrom] = useState(() => searchParams.get('from') || '')
  const [to, setTo] = useState(() => searchParams.get('to') || '')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)   // detail view
  const { refreshedAt } = useNewBooking()

  const load = useCallback(async () => {
    setLoading(true); setError('')
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (clinic) params.set('clinic', clinic)
    if (status) params.set('status', status)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    params.set('page', page)
    const res = await appointmentsApi.list(params.toString())
    if (res.ok) {
      // Defensive: never crash if the server returned an unexpected shape.
      const list = Array.isArray(res.data?.data) ? res.data.data : []
      const safeMeta = res.data?.meta && typeof res.data.meta === 'object'
        ? res.data.meta
        : { total: list.length, current_page: 1, last_page: 1 }
      setRows(list)
      setMeta(safeMeta)
    } else {
      // 401 = session expired → bounce to login via auth refresh on next call
      if (res.status === 401) {
        setError('Your session has expired. Please refresh and log in again.')
      } else if (res.status === 0) {
        setError('Cannot reach the backend server.')
      } else {
        setError(res.error || `Could not load appointments (HTTP ${res.status}).`)
      }
    }
    setLoading(false)
  }, [search, clinic, status, from, to, page])

  // Also reruns when NewBookingProvider detects a fresh booking, so the
  // list updates live without the admin having to refresh the page.
  useEffect(() => { load() }, [load, refreshedAt])

  const onSearch = (e) => { e.preventDefault(); setPage(1); load() }
  const exportCsv = () => {
    const params = new URLSearchParams()
    if (clinic) params.set('clinic', clinic)
    if (status) params.set('status', status)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    // The export endpoint returns CSV directly → open in a new tab
    const base = import.meta.env.VITE_API_BASE || ''
    window.open(`${base}/api/admin/appointments/export?${params}`, '_blank')
  }

  return (
    <>
      <div className="admin-card">
        <form className="admin-toolbar" onSubmit={onSearch}>
          <div className="admin-field field-grow" style={{ margin: 0 }}>
            <input className="admin-input" placeholder="Search name, phone, email, reference…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="admin-field" style={{ margin: 0 }}>
            <select className="admin-select" value={clinic} onChange={e => { setClinic(e.target.value); setPage(1) }}>
              {CLINICS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="admin-field" style={{ margin: 0 }}>
            <select className="admin-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="admin-field" style={{ margin: 0 }}>
            <input type="date" className="admin-input" value={from} onChange={e => { setFrom(e.target.value); setPage(1) }} title="From date" />
          </div>
          <div className="admin-field" style={{ margin: 0 }}>
            <input type="date" className="admin-input" value={to} onChange={e => { setTo(e.target.value); setPage(1) }} title="To date" />
          </div>
          <button className="btn btn-primary btn-sm" type="submit">Search</button>
          <button className="btn btn-outline btn-sm" type="button" onClick={exportCsv}>⬇ Export CSV</button>
        </form>
      </div>

      {error && (
        <div className="admin-card" role="alert">
          <div className="alert-error">{error}</div>
        </div>
      )}

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading"><div className="spinner-lg" />Loading…</div>
        ) : error ? (
          <div className="empty">Could not load appointments. See the message above.</div>
        ) : rows.length === 0 ? (
          <div className="empty">No appointments match your filters.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th><th>Patient</th><th className="hide-mobile">Clinic</th>
                <th>Date / Time</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(a => (
                <tr key={a.id}>
                  <td className="ref">{a.reference}</td>
                  <td className="patient">
                    <strong>{a.firstName} {a.lastName}</strong>
                    <small>{a.service}</small>
                  </td>
                  <td className="hide-mobile">{a.clinic?.name}</td>
                  <td>{fmtDate(a.preferredDate)}<br /><small className="muted">{fmtTime(a.preferredTime)}</small></td>
                  <td><span className={`badge badge-${a.status}`}>{label(a.status)}</span></td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => setSelected(a.id)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {meta.last_page > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid #f1f4f1', fontSize: '0.88rem' }}>
            <span>Showing {rows.length} of {meta.total}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" disabled={meta.current_page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ alignSelf: 'center' }}>Page {meta.current_page} / {meta.last_page}</span>
              <button className="btn btn-outline btn-sm" disabled={meta.current_page >= meta.last_page} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {selected && <AppointmentDetail id={selected} onClose={() => setSelected(null)} onChanged={load} />}
    </>
  )
}

/* ---- helpers (also defined in AppointmentDetail.jsx for its own use) ---- */
function label(status) {
  return ({ new: 'New', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No-show' })[status] || status
}
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtTime(t) { return t || '—' }
