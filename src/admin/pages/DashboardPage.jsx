import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../../lib/adminApi.js'
import AppointmentDetail from '../components/AppointmentDetail.jsx'
import { useNewBooking } from '../context/NewBookingContext.jsx'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)   // appointment detail drawer
  const { refreshedAt } = useNewBooking()

  const load = () => {
    setLoading(true)
    dashboardApi.get().then(res => {
      if (res.ok) setData(res.data.data)
      setLoading(false)
    })
  }

  // Reruns automatically when NewBookingProvider detects a fresh booking,
  // so the dashboard updates without the admin having to refresh the page.
  useEffect(() => { load() }, [refreshedAt])

  if (loading) return <div className="loading"><div className="spinner-lg" />Loading…</div>
  if (!data) return <div className="empty">Could not load dashboard.</div>

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <div className="stat-grid">
        <Link to={`/admin/appointments?from=${today}&to=${today}`} className="stat-tile">
          <div className="num">{data.new_today}</div>
          <div className="label">New / active today</div>
        </Link>
        {data.by_status?.slice(0, 3).map(s => (
          <Link to={`/admin/appointments?status=${s.status}`} className="stat-tile" key={s.status}>
            <div className="num">{s.count}</div>
            <div className="label">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="admin-card">
        <h2>Clinics</h2>
        <p className="card-sub">Live booking status for each location.</p>
        <table className="admin-table">
          <thead>
            <tr><th>Clinic</th><th>Bookings</th><th>Status</th></tr>
          </thead>
          <tbody>
            {data.clinics?.map(c => (
              <tr key={c.slug}>
                <td><strong>{c.name}</strong><br /><small className="muted">{c.slug}</small></td>
                <td>{c.pending} pending</td>
                <td><span className={`badge ${c.bookings_enabled ? 'badge-on' : 'badge-off'}`}>
                  {c.bookings_enabled ? 'Open' : 'Disabled'}
                </span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ margin: 0 }}>Upcoming appointments</h2>
            <p className="card-sub" style={{ margin: 0 }}>Click any row to view details and manage the booking.</p>
          </div>
          <Link to="/admin/appointments" className="btn btn-outline btn-sm">Manage all appointments →</Link>
        </div>

        {data.upcoming?.length ? (
          <table className="admin-table" style={{ marginTop: 14 }}>
            <thead>
              <tr><th>Reference</th><th className="hide-mobile">Patient</th><th>Clinic</th><th>When</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {data.upcoming.map(a => (
                <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(a.id)}>
                  <td className="ref">{a.reference}</td>
                  <td className="patient hide-mobile"><strong>{a.patient}</strong><small>{a.service}</small></td>
                  <td>{a.clinic}</td>
                  <td>{fmtDate(a.date)}<br /><small className="muted">{a.time}</small></td>
                  <td><span className={`badge badge-${a.status}`}>{label(a.status)}</span></td>
                  <td><button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); setSelected(a.id) }}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No upcoming appointments.</div>
        )}
      </div>

      {selected && (
        <AppointmentDetail id={selected} onClose={() => setSelected(null)} onChanged={load} />
      )}
    </>
  )
}

function label(status) {
  return ({ new: 'New', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No-show' })[status] || status
}
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })
}
