/* =====================================================================
   Analytics helper
   ---------------------------------------------------------------------
   One small API for the whole app to fire tracking events. Components
   call e.g. `track.bookingSuccess({ clinic: 'waterford', ref: 'WC-…' })`
   and this helper:

     1. pushes a clean GA4-style event to the GTM dataLayer
     2. (optional) fires the matching Google Ads conversion
     3. (optional) fires Meta Pixel / LinkedIn / TikTok if their SDKs are
        loaded (usually they're inside GTM, so step 1 already covers them)

   Designed to NEVER throw — tracking must not break the UI.
   ===================================================================== */

import { EVENTS, GOOGLE_ADS_LABELS, trackingConfig } from '../config/tracking.js'

/* ---- dataLayer bootstrap ---- */
// Guarded: this module is imported by components that also render during
// build-time SSR (see src/entry-server.jsx), where `window` doesn't exist.
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || []
}

/**
 * Core: push an event to the dataLayer (GTM picks it up).
 * Also calls window.gtag() if GA4 is loaded standalone.
 */
export function trackEvent(name, params = {}) {
  try {
    const payload = { event: name, ...cleanParams(params) }

    // Primary: GTM dataLayer
    window.dataLayer.push(payload)

    // If gtag is present (GA4 / Google Ads loaded directly, not via GTM)
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, payload)
    }
  } catch (e) {
    console.warn('[analytics] trackEvent failed:', e)
  }
}

/**
 * Fire a Google Ads conversion (only if a label is configured).
 * Safe to call — no-op when conversionId or label is missing.
 */
export function trackAdsConversion(label, value = 1.0, currency = 'EUR') {
  try {
    const { googleAdsConversionId } = trackingConfig
    if (!googleAdsConversionId || !label) return
    if (typeof window.gtag !== 'function') return

    window.gtag('event', 'conversion', {
      send_to: `${googleAdsConversionId}/${label}`,
      value,
      currency,
      transaction_id: undefined
    })
  } catch (e) {
    console.warn('[analytics] ads conversion failed:', e)
  }
}

/* =====================================================================
   Convenience fire-and-forget Meta / LinkedIn / TikTok pixel calls.
   These are no-ops unless the relevant SDK is loaded (typically via GTM).
   ===================================================================== */
function fbqTrack(event, data = {}) {
  try {
    if (typeof window.fbq !== 'function') return
    if (event === 'PageView') window.fbq('track', event)
    else window.fbq('track', event, data)
  } catch { /* noop */ }
}
function ttqTrack(event, data = {}) {
  try {
    if (typeof window.ttq?.track !== 'function') return
    window.ttq.track(event, data)
  } catch { /* noop */ }
}

/* =====================================================================
   Typed helpers — what the rest of the app actually calls.
   ===================================================================== */
export const track = {
  /** Main "Book Appointment" button (anywhere on the site). */
  bookAppointmentClick(location = 'unknown') {
    trackEvent(EVENTS.BOOK_APPOINTMENT_CLICK, { location, link_class: 'primary_cta' })
  },

  /** Clinic tab/link selected.
   *  One event name with the clinic as a parameter, rather than a separate
   *  hardcoded event per location — so adding or renaming a clinic doesn't
   *  need a code change, and GA4 can segment on the `clinic` dimension. */
  clinicSelected(clinicKey, location = 'unknown') {
    trackEvent(EVENTS.CLINIC_SELECTED, { clinic: clinicKey, location })
  },

  /** Phone number clicked/tapped. */
  phoneClick(phone, clinic = null, location = 'unknown') {
    trackEvent(EVENTS.PHONE_CALL_CLICK, { phone, clinic, location, link_class: 'tel' })
  },

  /** Email address clicked. */
  emailClick(email, clinic = null, location = 'unknown') {
    trackEvent(EVENTS.EMAIL_CLICK, { email, clinic, location, link_class: 'mailto' })
  },

  /** Appointment form submitted (fires before the request, regardless of outcome). */
  formSubmit(clinic, service = null) {
    trackEvent(EVENTS.APPOINTMENT_FORM_SUBMIT, { clinic, service })
    trackAdsConversion(GOOGLE_ADS_LABELS[EVENTS.APPOINTMENT_FORM_SUBMIT])
    fbqTrack('Lead', { content_name: 'appointment_request', clinic })
    ttqTrack('SubmitForm', { clinic })
  },

  /** Booking confirmed (API success or mailto fallback). */
  bookingSuccess({ clinic, reference, service, source = 'website', method = 'api' }) {
    trackEvent(EVENTS.BOOKING_SUCCESS, {
      clinic, reference, service, source, method, value: 1, currency: 'EUR'
    })
    trackAdsConversion(GOOGLE_ADS_LABELS[EVENTS.BOOKING_SUCCESS], 1, 'EUR')
    fbqTrack('Lead', { content_name: 'booking_confirmed', clinic, reference })
    ttqTrack('CompletePayment', { clinic, reference })
  },

  /** Service card "Book this" link. */
  serviceClick(title, location = 'services_grid') {
    trackEvent(EVENTS.SERVICE_CLICK, { service: title, location })
  },

  /** Google Maps directions link. */
  directionsClick(clinic) {
    trackEvent(EVENTS.DIRECTIONS_CLICK, { clinic })
  },

  /** "Leave us a review" link clicked. */
  googleReviewClick(clinic, location = 'unknown') {
    trackEvent(EVENTS.GOOGLE_REVIEW_CLICK, { clinic, location })
  },

  /** Generic helper for one-off events. */
  custom(name, params = {}) {
    trackEvent(name, params)
  }
}

/* ---- internal ---- */
function cleanParams(obj) {
  // Drop null/undefined so dataLayer stays tidy
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && v !== undefined && v !== '') out[k] = v
  }
  return out
}

export default track
