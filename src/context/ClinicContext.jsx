import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { clinics } from '../data/siteData.js'

const ClinicContext = createContext(null)

export function ClinicProvider({ children }) {
  // 'tullamore' or 'kildare' — the active clinic for hero + booking
  const [activeClinicKey, setActiveClinicKey] = useState('tullamore')

  // Which clinic the user is currently booking for (null = booking section hidden).
  // Set when a hero/header clinic tab is clicked — reveals the #booking section.
  const [bookingOpenFor, setBookingOpenForKey] = useState(null)

  // When set, the BookingForm is LOCKED to this clinic and cannot be switched.
  // Always set together with bookingOpenFor (see setBookingOpenFor below).
  const [lockedClinic, setLockedClinic] = useState(null)

  const activeClinic = clinics[activeClinicKey]

  // Persist the last chosen clinic across reloads
  useEffect(() => {
    const saved = localStorage.getItem('twl_active_clinic')
    if (saved && clinics[saved]) setActiveClinicKey(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('twl_active_clinic', activeClinicKey)
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
