/* =====================================================================
   PER-CLIENT SITE CONFIGURATION — Waterford Walk In Clinic
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
  brand: 'Waterford Walk In Clinic',
  tagline: 'Waterford',
  // Apex, not www — www.waterfordclinic.ie 301s to this, and Google's own
  // crawl of the homepage resolves to the apex URL (confirmed via SEO audit,
  // Aug 2026). Canonical tags, Open Graph URLs and JSON-LD @id/url fields
  // all derive from this value, so it must match the redirect target or
  // every page contradicts its own canonical.
  domain: 'https://waterfordclinic.ie',
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
     Sampled directly from the client's real logo file (see PRODUCT.md) —
     navy is the dominant colour, green the accent. Kept in sync by hand
     with the --green-* and --gold custom properties in global.css. */
  theme: {
    primary: '#003a6c',      // navy — sampled from the logo
    primaryDark: '#002342',
    accent: '#20712f',       // green — sampled from the logo
  },

  /* ---- Analytics & advertising ----
     These are the client's own properties — never copy another client's
     IDs here, or Waterford's traffic/conversions report into their account.
     GA4 measurement ID is live. Google Ads conversion ID + labels are still
     TODO: create the conversion action in Google Ads (Tools → Conversions),
     then paste the AW-... ID and per-event labels here. */
  analytics: {
    ga4MeasurementId: 'G-8PHZNFN4HM',
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
