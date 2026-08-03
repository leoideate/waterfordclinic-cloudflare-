/* =====================================================================
   Admin API client — wraps fetch with cookie auth, 401 handling, and
   Laravel 422 field-error extraction. Used by every admin page.
   ===================================================================== */

export const API_BASE = import.meta.env.VITE_API_BASE || ''

/**
 * Fetch the Sanctum CSRF cookie.
 *
 * NOTE: Not used. As of the CSRF exemption in bootstrap/app.php, all /api/*
 * routes bypass CSRF verification (the React SPA talks JSON to the API and
 * doesn't send the X-XSRF-TOKEN header). Kept here only as a helper in case
 * a future server-rendered Blade route needs it.
 */
export async function getCsrfCookie() {
  await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
    credentials: 'include'
  })
}

/**
 * Core request helper. Returns { ok, status, data, error }.
 * Throws nothing — callers handle outcomes.
 */
export async function adminRequest(method, path, body = null) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : null
    })

    const data = await res.json().catch(() => null)

    // Defensive: a 200 with non-JSON body (e.g. the SPA index.html being
    // served for an API path) is NOT a real success. Treat it as an error so
    // callers don't crash on res.data.data access.
    if (res.ok && data == null) {
      return {
        ok: false, status: res.status, data: null,
        error: `Unexpected response from server (${res.status}).`,
      }
    }
    if (res.ok) return { ok: true, status: res.status, data }
    return {
      ok: false, status: res.status, data,
      error: data?.message || extractFirstError(data?.errors) || `Request failed (${res.status})`,
      errors: data?.errors || {}
    }
  } catch (err) {
    return { ok: false, status: 0, error: err?.message || 'Network error.' }
  }
}

/* ---- Auth ---- */
export const authApi = {
  login: (email_or_username, password) => adminRequest('POST', '/api/admin/login', { email_or_username, password }),
  logout: () => adminRequest('POST', '/api/admin/logout'),
  me: () => adminRequest('GET', '/api/admin/me'),
}

/* ---- Appointments ---- */
export const appointmentsApi = {
  list: (params = '') => adminRequest('GET', `/api/admin/appointments${params ? '?' + params : ''}`),
  get: (id) => adminRequest('GET', `/api/admin/appointments/${id}`),
  update: (id, body) => adminRequest('PUT', `/api/admin/appointments/${id}`, body),
  status: (id, status) => adminRequest('PATCH', `/api/admin/appointments/${id}/status`, { status }),
}

/* ---- Dashboard ---- */
export const dashboardApi = {
  get: () => adminRequest('GET', '/api/admin/dashboard'),
}

/* ---- Clinics / schedules / booking ---- */
export const clinicsApi = {
  list: () => adminRequest('GET', '/api/admin/clinics'),
  update: (id, body) => adminRequest('PUT', `/api/admin/clinics/${id}`, body),
  schedule: (id, schedule) => adminRequest('PUT', `/api/admin/clinics/${id}/schedule`, { schedule }),
  booking: (id, body) => adminRequest('PUT', `/api/admin/clinics/${id}/booking`, body),
}

/* ---- Breaks / Holidays / Closures ---- */
export const breaksApi = {
  list: () => adminRequest('GET', '/api/admin/break-times'),
  create: (body) => adminRequest('POST', '/api/admin/break-times', body),
  update: (id, body) => adminRequest('PUT', `/api/admin/break-times/${id}`, body),
  remove: (id) => adminRequest('DELETE', `/api/admin/break-times/${id}`),
}
export const holidaysApi = {
  list: () => adminRequest('GET', '/api/admin/holidays'),
  create: (body) => adminRequest('POST', '/api/admin/holidays', body),
  update: (id, body) => adminRequest('PUT', `/api/admin/holidays/${id}`, body),
  remove: (id) => adminRequest('DELETE', `/api/admin/holidays/${id}`),
}
export const closuresApi = {
  list: () => adminRequest('GET', '/api/admin/temporary-closures'),
  create: (body) => adminRequest('POST', '/api/admin/temporary-closures', body),
  update: (id, body) => adminRequest('PUT', `/api/admin/temporary-closures/${id}`, body),
  remove: (id) => adminRequest('DELETE', `/api/admin/temporary-closures/${id}`),
}

/* ---- Admin users ---- */
export const usersApi = {
  list: () => adminRequest('GET', '/api/admin/users'),
  create: (body) => adminRequest('POST', '/api/admin/users', body),
  update: (id, body) => adminRequest('PUT', `/api/admin/users/${id}`, body),
  password: (id, body) => adminRequest('PATCH', `/api/admin/users/${id}/password`, body),
  remove: (id) => adminRequest('DELETE', `/api/admin/users/${id}`),
}

/* ---- Settings ---- */
export const settingsApi = {
  get: () => adminRequest('GET', '/api/admin/settings'),
  update: (body) => adminRequest('PUT', '/api/admin/settings', body),
}

/* ---- helper ---- */
function extractFirstError(errors) {
  if (!errors || typeof errors !== 'object') return null
  for (const key of Object.keys(errors)) {
    const v = errors[key]
    if (Array.isArray(v) && v.length) return v[0]
    if (typeof v === 'string') return v
  }
  return null
}
