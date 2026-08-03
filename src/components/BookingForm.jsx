import { useState, useEffect } from 'react'
import { useClinic } from '../context/ClinicContext.jsx'
import { site } from '../config/site.js'
import { services_dropdown, timeSlots } from '../data/siteData.js'
import { createAppointment, fetchAvailability } from '../lib/api.js'
import { track } from '../lib/analytics.js'

const empty = {
  firstName: '', lastName: '', dob: '', dobDay: '', dobMonth: '', dobYear: '',
  phone: '', email: '', address: '',
  service: '', date: '', dateDay: '', dateMonth: '', dateYear: '', time: '', notes: '',
  isExisting: '', consent: false
}

const DOB_MONTHS = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' }, { value: '04', label: 'April' },
  { value: '05', label: 'May' }, { value: '06', label: 'June' },
  { value: '07', label: 'July' }, { value: '08', label: 'August' },
  { value: '09', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
]
const DOB_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
const DOB_YEARS = (() => {
  const nowYear = new Date().getFullYear()
  return Array.from({ length: 121 }, (_, i) => nowYear - i)
})()
// Appointment date uses the same Day/Month/Year picker style as DOB, but
// only offers the current year and next (a walk-in clinic doesn't take
// bookings far in advance, and it keeps the dropdown short).
const APPT_DATE_YEARS = (() => {
  const nowYear = new Date().getFullYear()
  return [nowYear, nowYear + 1]
})()

/**
 * The booking form. Reads the active clinic from context so it always
 * matches whichever clinic the user picked.
 *
 * Props:
 *   compact  — when true (used inside the hero), hides the form's own
 *              clinic tabs (the hero supplies them) and uses a tighter
 *              single-column field layout.
 *
 * Submission flow:
 *   1. Validate client-side.
 *   2. POST to /api/appointments (Laravel).
 *      - On success: show the confirmation screen with the server reference.
 *      - On 422: map server validation errors back to fields.
 *      - On network failure: fall back to a mailto: email draft so the
 *        patient can still send their request manually.
 */
export default function BookingForm({ compact = false, lockClinic = null }) {
  const { activeClinicKey, setActiveClinicKey, activeClinic, clinics } = useClinic()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [submitted, setSubmitted] = useState(null) // confirmed booking object
  const [usedFallback, setUsedFallback] = useState(false) // true = mailto was used

  // ---- Live availability from the backend (with static fallback) ----
  const [availability, setAvailability] = useState(null) // { available, reason, slots }
  const [availLoading, setAvailLoading] = useState(false)
  const [availError, setAvailError] = useState('')      // shown when whole day is unavailable

  // Once a time is picked, the slot grid collapses down to a compact summary
  // instead of staying open as a tall scrollable box. "Change" re-expands it.
  const [timeGridOpen, setTimeGridOpen] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  // Refetch availability whenever clinic or date changes. On API failure
  // we fall back to the static slot list so the form keeps working.
  useEffect(() => {
    if (!form.date) { setAvailability(null); setAvailError(''); return }
    let cancelled = false
    setAvailLoading(true); setAvailError('')
    fetchAvailability(activeClinicKey, form.date).then(res => {
      if (cancelled) return
      setAvailLoading(false)
      if (res.ok) {
        setAvailability(res)
        if (res.available === false) {
          setAvailError(res.reason || 'Appointments are not available on this day.')
          setForm(f => ({ ...f, time: '' }))   // clear any chosen time
        }
      } else {
        // Backend unreachable — fall back to static slots (demo mode)
        setAvailability({
          available: true, reason: null,
          slots: timeSlots.map(t => ({ time: t, label: fmtLabel(t), available: true, reason: null }))
        })
      }
    })
    return () => { cancelled = true }
  }, [activeClinicKey, form.date])

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
    setServerError('')
  }

  // Combines the Day/Month/Year selects into form.dob (ISO yyyy-mm-dd),
  // rejecting impossible combinations (e.g. 31 February) instead of
  // letting the Date constructor silently roll them into the next month.
  const setDobPart = (part, value) => {
    setForm(f => {
      const next = { ...f, [part]: value }
      const { dobDay, dobMonth, dobYear } = next
      if (dobDay && dobMonth && dobYear) {
        const iso = `${dobYear}-${dobMonth}-${dobDay}`
        const d = new Date(iso + 'T00:00:00')
        const valid = d.getFullYear() === Number(dobYear) &&
          d.getMonth() + 1 === Number(dobMonth) && d.getDate() === Number(dobDay)
        next.dob = valid ? iso : ''
      } else {
        next.dob = ''
      }
      return next
    })
    setErrors(e => ({ ...e, dob: undefined }))
    setServerError('')
  }

  // Same Day/Month/Year composition as setDobPart, but the appointment date
  // additionally has to be today or later — clearing form.time too when the
  // date changes, since a slot from the old date won't be valid for the new one.
  const setDatePart = (part, value) => {
    setForm(f => {
      const next = { ...f, [part]: value, time: '' }
      const { dateDay, dateMonth, dateYear } = next
      if (dateDay && dateMonth && dateYear) {
        const iso = `${dateYear}-${dateMonth}-${dateDay}`
        const d = new Date(iso + 'T00:00:00')
        const validCalendarDate = d.getFullYear() === Number(dateYear) &&
          d.getMonth() + 1 === Number(dateMonth) && d.getDate() === Number(dateDay)
        next.date = (validCalendarDate && iso >= today) ? iso : ''
      } else {
        next.date = ''
      }
      return next
    })
    setErrors(e => ({ ...e, date: undefined, time: undefined }))
    setServerError('')
  }

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (!/^[0-9 +()-]{7,}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.dobDay || !form.dobMonth || !form.dobYear) e.dob = 'Please enter your date of birth'
    else if (!form.dob) e.dob = 'Please enter a valid date of birth'
    else if (form.dob > today) e.dob = 'Date of birth cannot be in the future'
    if (!form.address.trim()) e.address = 'Please enter your address'
    if (!form.dateDay || !form.dateMonth || !form.dateYear) e.date = 'Choose a date'
    else if (!form.date) e.date = 'Please choose a valid, upcoming date'
    if (!form.time) e.time = 'Choose a time'
    if (!form.consent) e.consent = 'Please accept to continue'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setServerError('')

    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      const first = document.querySelector('[data-error="true"]')
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)

    const payload = {
      clinic: activeClinicKey,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      dob: form.dob || null,
      address: form.address.trim(),
      isExisting: form.isExisting || null,
      service: form.service,
      date: form.date,
      time: form.time,
      notes: form.notes.trim() || null,
      consent: form.consent
    }

    // 📊 Fire the form_submit event once validation passes (before request)
    track.formSubmit(activeClinicKey, form.service)

    const result = await createAppointment(payload)

    // ---- Success ----
    if (result.ok) {
      const ref = result.data?.data?.reference || ('WC-' + Date.now().toString().slice(-6))
      setSubmitted({
        ...form,
        clinic: activeClinic,
        ref,
        confirmedViaApi: true
      })
      // 📊 analytics: confirmed booking via API
      track.bookingSuccess({
        clinic: activeClinicKey, reference: ref, service: form.service,
        method: 'api', source: 'website'
      })
      setSubmitting(false)
      return
    }

    // ---- Validation errors from server (422) → map to fields ----
    if (result.status === 422 && result.data?.errors) {
      const mapped = {}
      const serverMap = {
        clinic: 'clinic', firstName: 'first_name', lastName: 'last_name',
        phone: 'phone', email: 'email', dob: 'dob', address: 'address', isExisting: 'is_existing_patient',
        service: 'service', date: 'preferred_date', time: 'preferred_time',
        notes: 'notes', consent: 'consent'
      }
      for (const [serverKey, msgs] of Object.entries(result.data.errors)) {
        // find the matching local field
        const localKey = Object.keys(serverMap).find(k => serverMap[k] === serverKey) || serverKey
        mapped[localKey] = Array.isArray(msgs) ? msgs[0] : String(msgs)
      }
      setErrors(prev => ({ ...prev, ...mapped }))
      setSubmitting(false)
      const first = document.querySelector('[data-error="true"]')
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // ---- Network/unreachable → fall back to a mailto draft ----
    if (result.status === 0) {
      const ref = 'WC-' + Date.now().toString().slice(-6)
      setUsedFallback(true)
      setSubmitted({
        ...form,
        clinic: activeClinic,
        ref,
        confirmedViaApi: false,
        fallbackNote: result.error
      })
      // 📊 analytics: booking "completed" via email fallback (still a lead)
      track.bookingSuccess({
        clinic: activeClinicKey, reference: ref, service: form.service,
        method: 'mailto_fallback', source: 'website'
      })
      setSubmitting(false)
      return
    }

    // ---- Backend not ready (DB / migrations) → clear friendly message ----
    if (result.status === 503 || result.data?.reason_code === 'database_not_configured') {
      setServerError(
        result.data?.message ||
        'Our booking system is being set up. Please call the clinic to book, or try again shortly.'
      )
      setSubmitting(false)
      return
    }

    // ---- CSRF / session expired → ask user to refresh ----
    if (result.status === 419) {
      setServerError('Your session expired. Please refresh the page and try again.')
      setSubmitting(false)
      return
    }

    // ---- Any other server error ----
    setServerError(
      result.data?.message ||
      result.error ||
      'Something went wrong. Please try again or call us.'
    )
    setSubmitting(false)
  }

  const reset = () => {
    setForm(empty); setErrors({}); setSubmitted(null)
    setServerError(''); setUsedFallback(false); setSubmitting(false)
  }

  /* ============== Success / confirmation screen ============== */
  if (submitted) {
    const mailSubject = encodeURIComponent(`Appointment - ${submitted.clinic.name} - ${submitted.firstName} ${submitted.lastName}`)
    const mailBody = encodeURIComponent(
`${site.brand} Appointment

Clinic:       ${submitted.clinic.name} (${submitted.clinic.fullName})
Preferred:    ${submitted.date} at ${submitted.time}
Service:      ${submitted.service || '—'}
Reference:    ${submitted.ref}

Patient
--------
Name:         ${submitted.firstName} ${submitted.lastName}
Phone:        ${submitted.phone}
Email:        ${submitted.email || '—'}
Date of birth:${submitted.dob || '—'}
Address:      ${submitted.address || '—'}
Existing pt:  ${submitted.isExisting || '—'}

Notes:
${submitted.notes || '—'}
`)
    const mailto = `mailto:${submitted.clinic.email}?subject=${mailSubject}&body=${mailBody}`

    const showEmailHint = !submitted.confirmedViaApi // fallback path

    return (
      <div className="booking-success" key={submitted.ref}>
        <div className="success-card">
          <div className={`success-check ${showEmailHint ? 'is-warn' : ''}`} aria-hidden="true">
            {showEmailHint ? '!' : '✓'}
          </div>
          <h3>
            {showEmailHint ? 'Almost there, please send your email' : 'Appointment confirmed'}
          </h3>

          {!showEmailHint && (
            <p className="muted">
              Thank you, <strong>{submitted.firstName}</strong>. Your appointment at the
              <strong>{submitted.clinic.name}</strong> clinic is confirmed. Your reference is
            </p>
          )}
          {showEmailHint && (
            <p className="muted">
              We couldn't reach our booking server right now
              {submitted.fallbackNote ? ` (${submitted.fallbackNote})` : ''}.
              Your details are ready below, click <strong>“Send my request by email”</strong> and
              we'll take it from there. Your reference is
            </p>
          )}

          <div className={`ref-box ${showEmailHint ? 'is-warn' : ''}`}>{submitted.ref}</div>

          <div className="confirm-grid">
            <div><small>Clinic</small><strong>{submitted.clinic.name}</strong></div>
            <div><small>Date</small><strong>{fmtDate(submitted.date)}</strong></div>
            <div><small>Time</small><strong>{submitted.time}</strong></div>
            {submitted.service && <div><small>Service</small><strong>{submitted.service}</strong></div>}
          </div>

          {submitted.confirmedViaApi && submitted.email && (
            <p className="muted" style={{ marginTop: 8 }}>
              📧 A confirmation email is on its way to <strong>{submitted.email}</strong>.
            </p>
          )}

          <div className="success-actions">
            {showEmailHint && (
              <a href={mailto} className="btn btn-primary"
                 onClick={() => track.emailClick(submitted.clinic.email, submitted.clinic.key, 'success_fallback_email')}>
                📧 Send my request by email
              </a>
            )}
            <a href={`tel:${submitted.clinic.phone.replace(/\s/g, '')}`} className="btn btn-outline"
               onClick={() => track.phoneClick(submitted.clinic.phone, submitted.clinic.key, 'success_call')}>
              📞 Call {submitted.clinic.name}
            </a>
            <button className="btn btn-ghost" onClick={reset}>＋ New booking</button>
          </div>
          <p className="disclaimer">
            {showEmailHint
              ? 'The booking server was unavailable, so no record was created automatically. Emailing sends your request to ' + submitted.clinic.email + '.'
              : 'Your booking was saved to the clinic database. Emailing a copy is optional and goes to ' + submitted.clinic.email + '.'}
          </p>
        </div>
      </div>
    )
  }

  /* ============== The form ============== */
  return (
    <form className={`booking-form ${compact ? 'compact' : ''}`} onSubmit={handleSubmit} noValidate>
      {!compact && (
        lockClinic ? (
          // LOCKED mode: show a single non-interactive chip naming the clinic.
          // The user has already chosen via the hero/header tab; the form must
          // not let them switch. They can pick a different clinic by going
          // back to the hero tabs.
          <div className="form-clinic-locked" role="status">
            <span aria-hidden="true">📍</span>
            <span>
              <strong>Booking for {clinics[lockClinic]?.name || activeClinic.name} Clinic</strong>
              <small>To choose a different clinic, use the buttons above.</small>
            </span>
          </div>
        ) : (
          // FREE mode: show both clinic tabs as a switcher (legacy behaviour
          // for any callers that don't pass lockClinic).
          <div className="form-clinic-tabs" role="tablist" aria-label="Choose clinic for this booking">
            {Object.values(clinics).map(c => (
              <button
                type="button"
                key={c.key}
                role="tab"
                aria-selected={activeClinicKey === c.key}
                className={`form-clinic-tab ${activeClinicKey === c.key ? 'is-active' : ''}`}
                onClick={() => { setActiveClinicKey(c.key); track.clinicSelected(c.key, compact ? 'hero_form' : 'booking_form') }}
              >
                <span aria-hidden="true">📍</span> {c.name} Clinic
                {activeClinicKey === c.key && <span className="tick">✓</span>}
              </button>
            ))}
          </div>
        )
      )}

      <div className="clinic-banner">
        <span>Booking at <strong>{activeClinic.fullName}</strong></span>
        <a
          href={`tel:${activeClinic.phone.replace(/\s/g, '')}`}
          onClick={() => track.phoneClick(activeClinic.phone, activeClinicKey, compact ? 'hero_form_banner' : 'booking_form_banner')}
        >
          {activeClinic.phone}
        </a>
      </div>

      {serverError && (
        <div className="form-server-error" role="alert">
          ⚠️ {serverError}
        </div>
      )}

      <fieldset className="fs-2col">
        <Field label="First name" required error={errors.firstName}>
          <input data-error={!!errors.firstName} className="inp" type="text" value={form.firstName}
            onChange={e => set('firstName', e.target.value)} placeholder="Jane" autoComplete="given-name" />
        </Field>
        <Field label="Last name" required error={errors.lastName}>
          <input data-error={!!errors.lastName} className="inp" type="text" value={form.lastName}
            onChange={e => set('lastName', e.target.value)} placeholder="Doe" autoComplete="family-name" />
        </Field>
        <Field label="Date of birth" required error={errors.dob}>
          <div className="date-parts-row">
            <select data-error={!!errors.dob} className="inp" value={form.dobDay} aria-label="Day"
              onChange={e => setDobPart('dobDay', e.target.value)}>
              <option value="">Day</option>
              {DOB_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select data-error={!!errors.dob} className="inp" value={form.dobMonth} aria-label="Month"
              onChange={e => setDobPart('dobMonth', e.target.value)}>
              <option value="">Month</option>
              {DOB_MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select data-error={!!errors.dob} className="inp" value={form.dobYear} aria-label="Year"
              onChange={e => setDobPart('dobYear', e.target.value)}>
              <option value="">Year</option>
              {DOB_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </Field>
        <Field label="Mobile phone" required error={errors.phone}>
          <input data-error={!!errors.phone} className="inp" type="tel" value={form.phone}
            onChange={e => set('phone', e.target.value)} placeholder="087 123 4567" autoComplete="tel" />
        </Field>
        <Field label="Email (optional)" error={errors.email} hint="For your confirmation">
          <input data-error={!!errors.email} className="inp" type="email" value={form.email}
            onChange={e => set('email', e.target.value)} placeholder="jane@example.ie" autoComplete="email" />
        </Field>
        <Field label="Address" required error={errors.address}>
          <input data-error={!!errors.address} className="inp" type="text" value={form.address}
            onChange={e => set('address', e.target.value)} placeholder="12 Main St, Waterford" autoComplete="street-address" />
        </Field>
      </fieldset>

      <Field label="Are you an existing patient?">
        <select className="inp" value={form.isExisting}
          onChange={e => set('isExisting', e.target.value)}>
          <option value="">Select…</option>
          <option value="Yes">Yes, I've been before</option>
          <option value="No">No, first visit</option>
        </select>
      </Field>

      <Field label="Reason for visit / service (optional)" hint="If you're not sure, leave blank">
        <select className="inp" value={form.service}
          onChange={e => set('service', e.target.value)}>
          <option value="">Choose a service… (optional)</option>
          {services_dropdown.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>

      <fieldset className="fs-2col">
        <Field label="Preferred date" required error={errors.date}>
          <div className="date-parts-row">
            <select data-error={!!errors.date} className="inp" value={form.dateDay} aria-label="Day"
              onChange={e => setDatePart('dateDay', e.target.value)}>
              <option value="">Day</option>
              {DOB_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select data-error={!!errors.date} className="inp" value={form.dateMonth} aria-label="Month"
              onChange={e => setDatePart('dateMonth', e.target.value)}>
              <option value="">Month</option>
              {DOB_MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select data-error={!!errors.date} className="inp" value={form.dateYear} aria-label="Year"
              onChange={e => setDatePart('dateYear', e.target.value)}>
              <option value="">Year</option>
              {APPT_DATE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {availLoading && form.date && <p className="field-hint">Checking availability…</p>}
        </Field>
        <Field label="Preferred time" required error={errors.time}>
          {!form.date ? (
            <p className="field-hint time-slot-placeholder">Pick a date first</p>
          ) : availLoading ? (
            <p className="field-hint time-slot-placeholder">Checking availability…</p>
          ) : !availability?.available ? (
            <p className="field-hint time-slot-placeholder">No times available on this day</p>
          ) : form.time && !timeGridOpen ? (
            <div className="time-slot-summary" data-error={!!errors.time}>
              <span>{(availability?.slots || []).find(s => s.time === form.time)?.label || form.time}</span>
              <button type="button" className="time-slot-change" onClick={() => setTimeGridOpen(true)}>Change</button>
            </div>
          ) : (
            <div className="time-slot-grid" data-error={!!errors.time} role="radiogroup" aria-label="Preferred time">
              {(availability?.slots || []).filter(s => s.available).map(s => (
                <button key={s.time} type="button" role="radio" aria-checked={form.time === s.time}
                  className={`time-slot-btn${form.time === s.time ? ' is-selected' : ''}`}
                  onClick={() => { set('time', s.time); setTimeGridOpen(false) }}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </Field>
      </fieldset>

      {/* Whole-day unavailable message (clinic disabled, holiday, Sunday, closure) */}
      {form.date && !availLoading && availability && availability.available === false && (
        <div className="availability-notice" role="alert">
          ⚠️ {availError}
          {availability.reason_code === 'sunday_phone_only' && (
            <>
              {' '}
              <a href={`tel:${activeClinic.phone.replace(/\s/g, '')}`}
                 onClick={() => track.phoneClick(activeClinic.phone, activeClinicKey, 'sunday_availability_notice')}>
                📞 Call {activeClinic.name}: {activeClinic.phone}
              </a>
            </>
          )}
        </div>
      )}

      <Field label="Anything else we should know? (optional)">
        <textarea className="inp" rows={compact ? 2 : 3} value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Briefly describe your symptoms or the reason for your visit." />
      </Field>

      <label className={`consent ${errors.consent ? 'has-error' : ''}`} data-error={!!errors.consent}>
        <input type="checkbox" checked={form.consent}
          onChange={e => set('consent', e.target.checked)} />
        <span>
          I consent to {site.brand} processing my details to arrange this appointment.
          My information is held securely under GDPR.{' '}
          <span className="muted">(Required)</span>
        </span>
      </label>
      {errors.consent && <p className="field-error">{errors.consent}</p>}

      {/* Fee + medical card notice, shown before submit. Suppressed until
          the client confirms their pricing — see src/config/site.js. */}
      {site.consultationFee && (
        <div className="fee-notice" role="note">
          <strong>⚠️ Please note:</strong>{' '}
          {site.acceptsMedicalCard === false && `Medical Cards and GMS are not accepted at ${site.brand}. `}
          The consultation fee is <strong>{site.consultationFee}</strong>, payable on the day.
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
        {submitting ? (
          <><span className="spinner" aria-hidden="true"></span> Sending request…</>
        ) : (
          <>🔒 Request appointment at {activeClinic.name}</>
        )}
      </button>
      <p className="form-foot muted">
        No payment required now. Your booking will be confirmed by email.
      </p>
    </form>
  )
}

/* ---- helper sub-components ---- */
function Field({ label, required, error, hint, children }) {
  return (
    <div className="field">
      <label className="field-label">
        {label}{required && <span className="req" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

/** "14:30" → "2:30 pm" — matches the labels the backend returns. */
function fmtLabel(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'pm' : 'am'
  const hr12 = h % 12 === 0 ? 12 : h % 12
  return `${hr12}:${String(m).padStart(2, '0')} ${period}`
}
