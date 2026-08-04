# 📊 Analytics & Tracking Setup — Waterford Walk In Clinic

This site is fully wired for marketing analytics through **Google Tag Manager (GTM)**. All tracking IDs live in **one file**; all events fire through a single helper. Nothing is hardcoded across components.

---

## 🚀 60-second setup

1. **Create a GTM container** → copy your Container ID (`GTM-XXXXXXX`)
2. **Open `src/config/tracking.js`** → paste it into `gtmId`
3. **Open `index.html`** → replace the **two** `GTM-XXXXXXX` placeholders (head script + body noscript) with the same ID
4. Build & deploy. GTM is now live.

Then add your tags **inside GTM** (GA4, Google Ads, Meta Pixel, etc.) — see [Recommended GTM tags](#-recommended-gtm-tags) below.

> ⚠️ The default `gtmId` is the placeholder `GTM-XXXXXXX`. **Replace it before going live** — with the placeholder in place GTM will load a 404 container (harmless but noisy in devtools).

---

## 🗂 Where everything lives

| What | File | Notes |
|---|---|---|
| **All tracking IDs** | `src/config/tracking.js` | The only file you edit to enable a service |
| **Event-name constants** | `src/config/tracking.js` → `EVENTS` | Single source of truth |
| **Google Ads conversion labels** | `src/config/tracking.js` → `GOOGLE_ADS_LABELS` | Map event → label |
| **The `track()` helper** | `src/lib/analytics.js` | What components call |
| **GTM head + noscript** | `index.html` | Loaded earliest, before React |
| **OG + Twitter tags** | `index.html` | Social sharing preview |
| **dataLayer bootstrap** | `src/main.jsx` | Pushes config at startup |
| **OG share image** | `public/og-image.svg` | Replace with a 1200×630 PNG/JPG for best results |

---

## 🔧 IDs to fill in (`src/config/tracking.js`)

```js
gtmId:                  'GTM-XXXXXXX',   // ← Google Tag Manager (REQUIRED primary)
ga4MeasurementId:       'G-XXXXXXXXXX',  // ← Google Analytics 4
googleAdsConversionId:  'AW-XXXXXXXXX',  // ← Google Ads
metaPixelId:            '',              // ← Meta / Facebook Pixel (numeric)
microsoftClarityId:     '',              // ← Microsoft Clarity (heatmaps)
linkedinPartnerId:      '',              // ← LinkedIn Insight Tag
tiktokPixelId:          '',              // ← TikTok Pixel
```

Leave any service as `''` to disable it. Each is clearly commented in the file.

---

## 📌 Event reference

Every user action fires one of these events to the `dataLayer` (and to GA4/gtag when loaded). Use these names to build **Triggers** in GTM.

| Event name | Fired when | Key params |
|---|---|---|
| `book_appointment_click` | Any "Book Appointment" / "Book now" button | `location` |
| `clinic_selected` | A clinic tab/link was chosen | `clinic`, `location` |
| `phone_call_click` | A phone number is clicked | `phone`, `clinic`, `location` |
| `email_click` | An email address is clicked | `email`, `clinic`, `location` |
| `appointment_form_submit` | Booking form submitted (passes validation) | `clinic`, `service` |
| `booking_success` | Booking confirmed (API or email fallback) | `clinic`, `reference`, `service`, `method` |
| `service_click` | "Book this" link on a service card | `service`, `location` |
| `directions_click` | Google Maps directions link | `clinic` |

### `location` values you'll see
`header_nav`, `hero_tab`, `hero_secondary`, `hero_form`, `booking_form`, `booking_form_banner`, `booking_cta_card`, `contact_card`, `footer`, `footer_cta`, `services_cta`, `service_card`, `success_call`, `success_fallback_email`, `success_copy_email`, `hero`, `hero_form_banner`

This lets you see **where** in the funnel each action happened.

---

## 🎯 Recommended GTM tags

Create these inside your GTM container. Each tag fires on a **Custom Event** trigger matching the event name above.

| GTM Tag type | Trigger (Custom Event) | What it does |
|---|---|---|
| **Google Analytics: GA4 Configuration** | All Pages | Site-wide traffic, pageviews, sources |
| **Google Ads: Conversion Tracking** | `booking_success` | Count confirmed bookings as conversions |
| **Google Ads: Conversion Linker** | All Pages | Preserve `gclid` across pages |
| **Meta Pixel — Custom HTML** | All Pages + `booking_success` (Lead) | Facebook/Instagram retargeting & conversions |
| **Microsoft Clarity — Custom HTML** | All Pages | Heatmaps & session recordings |
| **LinkedIn Insight Tag — Custom HTML** | All Pages | (optional) B2B retargeting |
| **TikTok Pixel — Custom HTML** | All Pages + `booking_success` | (optional) TikTok ads |

### GA4 "key events" (conversions)
In GA4 Admin → Events, mark these as conversions:
- `booking_success`
- `appointment_form_submit`
- `phone_call_click`

### Google Ads conversion labels
In Google Ads → Tools → Conversions, create a conversion for `booking_success`, copy its label, and paste it into `GOOGLE_ADS_LABELS[EVENTS.BOOKING_SUCCESS]` in `src/config/tracking.js`. The helper will then auto-fire the conversion via gtag.

---

## 🌐 Social sharing (Open Graph + Twitter)

Already configured in `index.html`. Before going live, replace:
- `og:url` and `twitter:image` URLs (`https://www.walk-in-gp.example` → your real domain)
- `og:image` → ideally a **1200×630 PNG/JPG** (the SVG placeholder works but PNG renders more reliably on WhatsApp/LinkedIn)
- Optional: uncomment `twitter:site` with your @handle

Test the preview:
- https://www.opengraph.xyz/
- https://cards-dev.twitter.com/validator
- Paste the URL into a Slack/WhatsApp message to yourself

---

## 🧪 Testing your tracking

### In the browser
1. Open DevTools → Console
2. Run: `window.dataLayer` — you should see `config` + every event you trigger
3. Click around: clinic tabs, phone numbers, submit the form → watch events stream in
4. **GTM Preview mode**: install the [Tag Assistant](https://tagassistant.google.com/) — it shows exactly which tags fire per event

### Verifying GA4
- GA4 Realtime report should show your session within ~30 seconds
- DebugView (GA4 → Configure → DebugView) shows every event live

### Verifying Google Ads conversions
- Google Ads → Tools → Conversions → "Diagnostics" tab after a test booking

---

## ❓ GTM vs. direct scripts

The setup defaults to **GTM** (recommended — one dashboard for everything). If you'd rather load GA4/Meta/Clarity directly instead of through GTM:

1. Paste their snippets into `index.html` `<head>` (after the GTM block, or instead of it)
2. Keep `src/config/tracking.js` IDs filled in — the `track()` helper calls `gtag`/`fbq`/`ttq` directly when those globals exist, so events still fire even without GTM

Both approaches work. GTM is just cleaner for marketing teams to manage without code changes.

---

## 🧱 Architecture notes for developers

- **Why a helper, not `dataLayer.push` everywhere?** Centralising means consistent param names, automatic GA4 + Meta + TikTok fan-out, and graceful failure (analytics never breaks the UI — every call is try/caught).
- **Why push config at startup?** `main.jsx` pushes all IDs into the dataLayer once. Inside GTM you can read them as **Data Layer Variables**, so a marketer can reference e.g. `{{Meta Pixel ID}}` without editing code.
- **No fake IDs ship.** Every placeholder is a clearly-marked `XXXX…` or empty string. Nothing fires to a real third-party until you replace it.
