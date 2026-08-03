import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { clinics } from '../data/siteData.js'

const ClinicContext = createContext(null)

/** Keys in declaration order — the first is the default. Derived rather than
 *  hardcoded so this works for a single-location clinic as well as several. */
export const clinicKeys = Object.keys(clinics)
const DEFAULT_CLINIC_KEY = clinicKeys[0]
export const isSingleClinic = clinicKeys.length === 1

export function ClinicProvider({ children }) {
  const [activeClinicKey, setActiveClinicKey] = useState(DEFAULT_CLINIC_KEY)

  // Which clinic the user is currently booking for (null = booking section hidden).
  // Set when a hero/header clinic tab is clicked — reveals the #booking section.
  const [bookingOpenFor, setBookingOpenForKey] = useState(null)

  // When set, the BookingForm is LOCKED to this clinic and cannot be switched.
  // Always set together with bookingOpenFor (see setBookingOpenFor below).
  const [lockedClinic, setLockedClinic] = useState(null)

  const activeClinic = clinics[activeClinicKey]

  // Persist the last chosen clinic across reloads. Pointless with one
  // location, so skip it entirely rather than write a constant to storage.
  useEffect(() => {
    if (isSingleClinic) return
    const saved = localStorage.getItem('wc_active_clinic')
    if (saved && clinics[saved]) setActiveClinicKey(saved)
  }, [])

  useEffect(() => {
    if (isSingleClinic) return
    localStorage.setItem('wc_active_clinic', activeClinicKey)
  }, [activeClinicKey])

  /**
   * Single action hero/header tabs call when the user picks a clinic to book.
   * Sets three things atomically so they can never drift apart:
   *   - activeClinicKey  (which clinic is "selected" across the site)
   *   - bookingOpenFor   (reveals the #booking section)
   *   - lockedClinic     (locks the form to this clinic — no switching)
   *
   * Pass null to close/hide the booking section again.
   */
  const setBookingOpenFor = useCallback((key) => {
    if (key === null) {
      setBookingOpenForKey(null)
      setLockedClinic(null)
      return
    }
    setActiveClinicKey(key)
    setBookingOpenForKey(key)
    setLockedClinic(key)
  }, [])

  // Deep-link support: ?clinic=kildare (from the standalone /kildare SEO
  // page's "Book Now" links) opens the booking form pre-locked to that
  // clinic and scrolls it into view.
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get('clinic')
    if (key && clinics[key]) {
      setBookingOpenFor(key)
      setTimeout(() => {
        document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ClinicContext.Provider value={{
      activeClinicKey, setActiveClinicKey, activeClinic, clinics,
      bookingOpenFor, setBookingOpenFor,
      lockedClinic, setLockedClinic,
    }}>
      {children}
    </ClinicContext.Provider>
  )
}

export function useClinic() {
  const ctx = useContext(ClinicContext)
  if (!ctx) throw new Error('useClinic must be used inside <ClinicProvider>')
  return ctx
}
