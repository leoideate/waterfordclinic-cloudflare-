import { useEffect, useState, useCallback } from 'react'
import { appointmentsApi } from '../../lib/adminApi.js'

/**
 * Slide-in drawer showing full appointment details + management actions
 * (status changes, internal notes). Shared by the Appointments page and
 * the Dashboard so clicking any appointment row opens the same UI.
 *
 * Props:
 *   id        number  — appointment ID to load
 *   onClose   () => void
 *   onChanged () => void  — optional, called after status/notes change so
 *                           the parent list can refresh
 */
export default function AppointmentDetail({ id, onClose, onChanged }) {
  const [appt, setAppt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailError, setDetailError] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setDetailError('')
    const res = await appointmentsApi.get(id)
    if (res.ok && res.data?.data) {
      setAppt(res.data.data)
      setNotes(res.data.data.adminNotes || '')
    } else {
      setDetailError(res.error || `Could not load appointment (HTTP ${res.status}).`)
    }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const changeStatus = async (status) => {
    const res = await appointmentsApi.status(id, status)
    if (res.ok && res.data?.data) {
      setAppt(res.data.data)
      setNotice('Status updated.'); onChanged?.(); setTimeout(() => setNotice(''), 2500)
    } else {
      setNotice(''); setDetailError(res.error || 'Could not update status. Please try again.')
    }
  }
  const saveNotes = async () => {
    const res = await appointmentsApi.update(id, { admin_notes: notes })
    if (res.ok && res.data?.data) {
      setAppt(res.data.data); setEditingNotes(false); setNotice('Notes saved.'); onChanged?.()
    } else {
      setDetailError(res.error || 'Could not save notes. Please try again.')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}
         onClick={onClose}>
      <div style={{ width: 'min(480px, 100%)', background: '#fff', height: '100%', overflowY: 'auto', padding: 28, boxShadow: 'var(--shadow-lg)' }}
           onClick={e => e.stopPropagation()}>
        {loading ? <div className="loading"><div className="spinner-lg" /></div> : detailError ? (
          <div className="alert-error">{detailError}</div>
        ) : appt && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: '0 0 4px' }}>{appt.firstName} {appt.lastName}</h2>
                <span className={`badge badge-${appt.status}`}>{label(appt.status)}</span>{' '}
                <span className="ref">{appt.reference}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
            </div>

            {notice && <div className="notice notice-ok">{notice}</div>}

            <div className="admin-card" style={{ marginBottom: 16 }}>
              <h2>Contact</h2>
              <p style={{ marginBottom: 6 }}><strong>Phone:</strong> <a href={`tel:${appt.phone}`}>{appt.phone}</a></p>
              <p style={{ marginBottom: 6 }}><strong>Email:</strong> {appt.email ? <a href={`mailto:${appt.email}`}>{appt.email}</a> : '—'}</p>
              <p style={{ marginBottom: 6 }}><strong>Date of birth:</strong> {fmtDob(appt.dob)}</p>
              <p style={{ marginBottom: 0 }}><strong>Address:</strong> {appt.address || '—'}</p>
            </div>

            <div className="admin-card" style={{ marginBottom: 16 }}>
              <h2>Appointment</h2>
              <p style={{ marginBottom: 6 }}><strong>Clinic:</strong> {appt.clinic?.name}</p>
              <p style={{ marginBottom: 6 }}><strong>Date:</strong> {fmtDate(appt.preferredDate)}</p>
              <p style={{ marginBottom: 6 }}><strong>Time:</strong> {fmtTime(appt.preferredTime)}</p>
              <p style={{ marginBottom: 6 }}><strong>Service:</strong> {appt.service}</p>
              <p style={{ marginBottom: 6 }}><strong>Existing patient:</strong> {appt.isExistingPatient === null ? '—' : (appt.isExistingPatient ? 'Yes' : 'No')}</p>
              <p style={{ marginBottom: 0 }}><strong>Submitted:</strong> {fmtDateTime(appt.createdAt)}</p>
            </div>

            {appt.notes && (
              <div className="admin-card" style={{ marginBottom: 16 }}>
                <h2>Patient notes</h2>
                <p style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>{appt.notes}</p>
              </div>
            )}

            <div className="admin-card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h2 style={{ margin: 0 }}>Internal admin notes</h2>
                {!editingNotes && <button className="btn btn-outline btn-sm" onClick={() => setEditingNotes(true)}>Edit</button>}
              </div>
              {editingNotes ? (
                <>
                  <textarea className="admin-textarea" value={notes} onChange={e => setNotes(e.target.value)} rows={4} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={saveNotes}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditingNotes(false); setNotes(appt.adminNotes || '') }}>Cancel</button>
                  </div>
                </>
              ) : (
                <p style={{ whiteSpace: 'pre-wrap', marginBottom: 0, color: appt.adminNotes ? 'inherit' : 'var(--ink-300)' }}>
                  {appt.adminNotes || 'No internal notes yet.'}
                </p>
              )}
            </div>

            <div className="admin-card">
              <h2>Update status</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button className="btn btn-success btn-sm" onClick={() => changeStatus('confirmed')}>✓ Confirm</button>
                <button className="btn btn-outline btn-sm" onClick={() => changeStatus('completed')}>Mark completed</button>
                <button className="btn btn-outline btn-sm" onClick={() => changeStatus('no_show')}>No-show</button>
                <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Cancel this appointment?')) changeStatus('cancelled') }}>Cancel appointment</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ---- helpers ---- */
function label(status) {
  return ({ new: 'New', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No-show' })[status] || status
}
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtTime(t) { return t || '—' }
function fmtDob(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}
function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short' })
}
