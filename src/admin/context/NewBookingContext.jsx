import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { appointmentsApi } from '../../lib/adminApi.js'
import { playChime } from '../lib/chime.js'

const NewBookingContext = createContext(null)

const POLL_MS = 20000

/**
 * Polls for new appointments while any admin page is open (mounted once,
 * at the AdminApp level, so it keeps working no matter which page is
 * active). On a new booking: plays a chime, shows a toast, and bumps
 * `refreshedAt` so pages watching it know to reload their own lists —
 * this is what replaces "refresh the browser to see the new booking".
 */
export function NewBookingProvider({ children }) {
  const [refreshedAt, setRefreshedAt] = useState(0)
  const [toast, setToast] = useState(null)
  const lastSeenId = useRef(null)      // id of the newest appointment as of the last poll (null = none exist)
  const initialized = useRef(false)    // separate from lastSeenId so "zero appointments" isn't mistaken for "not polled yet"
  const toastTimer = useRef(null)

  const poll = useCallback(async () => {
    const res = await appointmentsApi.list('per_page=1')
    if (!res.ok) return   // network hiccup or session expired — just skip this tick
    const latest = Array.isArray(res.data?.data) ? res.data.data[0] : null

    if (!initialized.current) {
      // First poll after login/page load — record the baseline (even if
      // there are zero appointments right now), don't alert yet.
      initialized.current = true
      lastSeenId.current = latest?.id ?? null
      return
    }

    if (latest && latest.id !== lastSeenId.current) {
      lastSeenId.current = latest.id
      playChime()
      setToast({
        reference: latest.reference,
        name: `${latest.firstName} ${latest.lastName}`,
        clinic: latest.clinic?.name || '',
      })
      clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 8000)
      setRefreshedAt(Date.now())
    }
  }, [])

  useEffect(() => {
    poll()
    const id = setInterval(poll, POLL_MS)
    return () => { clearInterval(id); clearTimeout(toastTimer.current) }
  }, [poll])

  return (
    <NewBookingContext.Provider value={{ refreshedAt }}>
      {children}
      {toast && (
        <div className="new-booking-toast" role="status" onClick={() => setToast(null)}>
          <span className="nbt-icon" aria-hidden="true">🔔</span>
          <div>
            <strong>New booking: {toast.name}</strong>
            <span>{toast.clinic} · {toast.reference}</span>
          </div>
        </div>
      )}
      <style>{`
        .new-booking-toast {
          position: fixed; top: 18px; right: 18px; z-index: 500;
          display: flex; align-items: center; gap: 10px;
          background: var(--green-900, #14532d); color: #fff;
          padding: 14px 18px; border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          cursor: pointer; max-width: 320px;
          animation: nbt-in 0.25s ease;
        }
        .new-booking-toast .nbt-icon { font-size: 1.4rem; }
        .new-booking-toast strong { display: block; font-size: 0.92rem; }
        .new-booking-toast span { font-size: 0.8rem; opacity: 0.85; }
        @keyframes nbt-in { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </NewBookingContext.Provider>
  )
}

export function useNewBooking() {
  const ctx = useContext(NewBookingContext)
  if (!ctx) throw new Error('useNewBooking must be used inside <NewBookingProvider>')
  return ctx
}
