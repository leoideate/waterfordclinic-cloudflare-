/* =====================================================================
   Tracking & analytics configuration
   ---------------------------------------------------------------------
   👉 EDIT YOUR IDS HERE. This is the ONLY file you need to touch when
      turning on tracking. Everything else reads from this config.

   Leave a value as an empty string ("") to DISABLE that service.
   GTM is the recommended primary container — once it's set, GA4,
   Google Ads, Meta Pixel, Clarity, LinkedIn & TikTok tags are usually
   added INSIDE GTM rather than here (see ANALYTICS.md for both approaches).
   ===================================================================== */

import { site } from './site.js'

export const trackingConfig = {
  /* ────────────────────────────────────────────────────────────────
     GOOGLE TAG MANAGER (primary container — recommended)
     Get this from GTM Admin → "Container ID" (format: GTM-XXXXXXX).
     When set, GTM loads in index.html and manages the tags below.
     ──────────────────────────────────────────────────────────────── */
  gtmId: '', // Not using GTM — GA4 gtag.js is loaded directly in index.html

  /* ────────────────────────────────────────────────────────────────
     Google Analytics 4 (GA4) — Measurement ID (format: G-XXXXXXXXXX)
     Loaded directly via gtag.js in index.html. Kept here so the React
     analytics helpers can reference it (e.g. for custom events).
     ──────────────────────────────────────────────────────────────── */
  ga4MeasurementId: site.analytics.ga4MeasurementId,

  /* ────────────────────────────────────────────────────────────────
     Google Ads — Conversion ID (format: AW-123456789)
     Used for conversion tracking + the Conversion Linker tag.
     ──────────────────────────────────────────────────────────────── */
  googleAdsConversionId: site.analytics.googleAdsConversionId,

  /* ────────────────────────────────────────────────────────────────
     Meta (Facebook / Instagram) Pixel ID (numeric, ~15 digits)
     Recommended: add as a "Custom HTML" Meta Pixel tag inside GTM.
     ──────────────────────────────────────────────────────────────── */
  metaPixelId: '', // ⚠️ e.g. '123456789012345' — leave "" if not using

  /* ────────────────────────────────────────────────────────────────
     Microsoft Clarity project ID (lowercase string)
     For heatmaps, session recordings & rage-click analytics.
     ──────────────────────────────────────────────────────────────── */
  microsoftClarityId: '', // ⚠️ e.g. 'abc123xy' — leave "" if not using

  /* ────────────────────────────────────────────────────────────────
     LinkedIn Insight Tag ID (numeric partner ID)
     For B2B / professional campaign retargeting.
     ──────────────────────────────────────────────────────────────── */
  linkedinPartnerId: '', // ⚠️ e.g. '1234567' — leave "" if not using

  /* ────────────────────────────────────────────────────────────────
     TikTok Pixel ID (alphanumeric)
     For TikTok ad tracking & remarketing.
     ──────────────────────────────────────────────────────────────── */
  tiktokPixelId: '', // ⚠️ e.g. 'C9XXXXXXXXXXXXXXXXXX' — leave "" if not using

  /* ────────────────────────────────────────────────────────────────
     Google Ads Conversion Linker — almost always ON when using Ads.
     ──────────────────────────────────────────────────────────────── */
  enableConversionLinker: true
}

/* =====================================================================
   EVENT NAMES — single source of truth for analytics events.
   Use the imported constants everywhere so names stay consistent.
   ===================================================================== */
export const EVENTS = {
  // Navigation / primary actions
  BOOK_APPOINTMENT_CLICK: 'book_appointment_click', // main Book button (any location)
  PHONE_CALL_CLICK: 'phone_call_click',             // phone number tapped/clicked
  EMAIL_CLICK: 'email_click',                        // email address clicked

  // Clinic selection
  CLINIC_SELECTED: 'clinic_selected',

  // Booking funnel
  APPOINTMENT_FORM_SUBMIT: 'appointment_form_submit', // form submitted (any outcome)
  BOOKING_SUCCESS: 'booking_success',                  // confirmed booking (API or fallback)

  // Optional / engagement
  SERVICE_CLICK: 'service_click',                     // "Book this" on a service card
  DIRECTIONS_CLICK: 'directions_click',               // Google Maps directions
  GOOGLE_REVIEW_CLICK: 'google_review_click'          // "Leave us a review" link
}

/* =====================================================================
   CONVERSION LABELS for Google Ads.
   Each conversion event gets a unique label under your Conversion ID.
   Replace the placeholders with the labels from your Google Ads account
   (Tools → Conversions → select conversion → "Tag setup" → "Label").
   Leave as "" to skip sending a Google Ads conversion for that event.
   ===================================================================== */
export const GOOGLE_ADS_LABELS = {
  [EVENTS.BOOKING_SUCCESS]: site.analytics.googleAdsLabels.booking_success || '',
  [EVENTS.APPOINTMENT_FORM_SUBMIT]: site.analytics.googleAdsLabels.appointment_form_submit || ''
}
