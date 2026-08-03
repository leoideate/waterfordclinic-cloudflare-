/* =====================================================================
   PER-CLIENT SITE CONFIGURATION — Waterford Clinic
   ---------------------------------------------------------------------
   Single source of brand truth. Everything that differs between one
   clinic and the next lives here: name, domain, logos, palette,
   analytics IDs, fees, legal links.

   Page copy, services and FAQs live in src/data/siteData.js.
   Clinic locations/hours are seeded into the `clinics` DB table.

   ⚠️  Values marked TODO are NOT yet confirmed by the client. They are
       deliberately left as obvious placeholders rather than plausible
       guesses — this is a medical practice, and a wrong address or
       opening time sends a sick patient to a closed door.
   ===================================================================== */

export const site = {
  /* ---- Identity ---- */
  brand: 'Waterford Clinic',
  tagline: 'Waterford',
  domain: 'https://www.waterfordclinic.ie',
  locale: 'en-IE',
  lang: 'en-IE',

  /* ---- Assets (paths under /public) ----
     TODO: client to supply logo files. Until then these 404 — which is
     intentional, so a missing logo is noticed before launch. */
  logo: {
    // Real client logo (navy + green mark, transparent background). Sits
    // naturally on the header's light background. The footer is a dark
    // teal, so Footer.jsx wraps this same file in a white card rather than
    // needing a separate reversed/light logo asset that was never supplied.
    header: '/logo.png',
    footer: '/logo.png',
    favicon: '/favicon.png',
  },
  // Social preview image. MUST be PNG or JPG — Facebook, LinkedIn, X and
  // WhatsApp all silently refuse SVG, rendering shares with no image.
  ogImage: '/og-image.png',
  ogImageSize: { width: 1200, height: 630 },

  /* ---- Theme ----
     TODO: confirm brand colours against the client's logo. These are
     placeholders chosen to be clearly distinct from the green used by
     the previous client, so nothing is accidentally left un-rebranded. */
  theme: {
    primary: '#1f6f8b',      // teal — clinical, distinct from Walk In GP green
    primaryDark: '#12495c',
    accent: '#e8a33d',
  },

  /* ---- Analytics & advertising ----
     Intentionally EMPTY. These must be the client's own properties.
     Leaving the previous client's IDs here would report Waterford's
     traffic and booking conversions into their GA4 and Google Ads
     accounts. Empty means no tag loads at all, which is the safe default.
     TODO: create GA4 property + Ads conversion action, paste IDs here. */
  analytics: {
    ga4MeasurementId: '',
    googleAdsConversionId: '',
    googleAdsLabels: {
      booking_success: '',
      appointment_form_submit: '',
    },
  },

  /* ---- Contact (confirmed from waterfordclinic.ie) ---- */
  contact: {
    email: 'info@waterfordclinic.ie',
    phone: '051 552424',
    // NOTE: the current WordPress site's homepage tel: link is
    // "tel:05155242" — one digit short, so tapping it on a phone fails.
    // The correct number (from their Contact page) is 051 552424.
    phoneHref: 'tel:051552424',
  },

  /* ---- Commercial terms ----
     TODO: confirm with client. Not published on their current site. */
  consultationFee: null,        // e.g. '€65' — null hides the fee notice
  acceptsMedicalCard: null,     // true / false — null hides the GMS notice

  /* ---- Links ---- */
  social: {
    facebook: '',
    instagram: '',
    x: '',
  },
  legal: {
    privacy: '',
    gdpr: '',
    patientCharter: '',
  },
}

/** Absolute URL helper — url('/services') → 'https://www.waterfordclinic.ie/services' */
export const url = (path = '/') =>
  site.domain.replace(/\/$/, '') + (path.startsWith('/') ? path : `/${path}`)

export default site
