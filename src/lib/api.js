/* =====================================================================
   Waterford Walk In Clinic — tiny API client
   ---------------------------------------------------------------------
   - In dev, Vite proxies "/api/*" to the Laravel server (see vite.config.js),
     so the frontend just calls "/api/...".
   - In production, set VITE_API_BASE (e.g. https://api.waterfordclinic.ie) and the
     same code points there.
   ===================================================================== */

export const API_BASE = import.meta.env.VITE_API_BASE || ''

/**
 * Submit an appointment booking to the backend.
 *
 * @param {object} payload  Fields matching the Laravel StoreAppointmentRequest
 *   { clinic, firstName, lastName, phone, email, dob, isExisting,
 *     service, date, time, notes, consent }
 * @returns {Promise<{ok: boolean, status: number, data?: any, error?: string}>}
 */
export async function createAppointment(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    })

    const data = await res.json().catch(() => null)

    if (res.ok) {
      return { ok: true, status: res.status, data }
    }

    // 422 = validation errors from Laravel
    return {
      ok: false,
      status: res.status,
      data,
      error:
        data?.message ||
        extractFirstError(data?.errors) ||
        `Request failed (${res.status})`
    }
  } catch (err) {
    // Network/CORS/timeout — backend not reachable
    return {
      ok: false,
      status: 0,
      error: err?.message || 'Network error — could not reach the server.'
    }
  }
}

/** Fetch all clinics (optional helper). */
export async function fetchClinics() {
  const res = await fetch(`${API_BASE}/api/clinics`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Could not load clinics (${res.status})`)
  const json = await res.json()
  return json.data
}

/**
 * Fetch availability for a clinic on a date. The backend applies the full
 * rules engine (open hours, Sundays, holidays, closures, breaks, capacity).
 *
 * Returns { ok, available, reason, slots } or { ok:false } if unreachable.
 * On failure the caller should fall back to the static slot list.
 */
export async function fetchAvailability(clinic, date) {
  try {
    const url = `${API_BASE}/api/availability?clinic=${encodeURIComponent(clinic)}&date=${encodeURIComponent(date)}`
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      credentials: 'include'
    })
    if (!res.ok) return { ok: false }
    const json = await res.json()
    return { ok: true, ...json.data }
  } catch {
    return { ok: false }
  }
}

function extractFirstError(errors) {
  if (!errors || typeof errors !== 'object') return null
  for (const key of Object.keys(errors)) {
    const v = errors[key]
    if (Array.isArray(v) && v.length) return v[0]
    if (typeof v === 'string') return v
  }
  return null
}
