# Waterford Clinic — Walk-in & Out-of-Hours GP

A site for Waterford Clinic, a **single-location** walk-in GP practice, with a built-in **online patient booking** flow that saves bookings to a **Laravel + SQLite** database.

This is a fork of a multi-clinic booking platform originally built for a two-location practice (Tullamore & Kildare). The frontend and backend both support one clinic or several — see `src/context/ClinicContext.jsx` (`isSingleClinic`) and `App\Models\Holiday::SCOPES` for where that adapts. Brand-level settings (name, domain, colours, analytics IDs) live in `src/config/site.js`; anything below that still reads like generic platform documentation applies to both cases.

**Stack:** React 18 + Vite (frontend) · Laravel 11 + SQLite (backend API).

## 🚀 Full-stack quickstart

Two terminals:

```bash
# Terminal 1 — backend (API on :8000)
cd backend
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate --seed
php artisan serve

# Terminal 2 — frontend (React on :5173)
npm install
npm run dev
```

Open http://localhost:5173, click a clinic tab, fill in the form → the booking is POSTed to Laravel and saved to the database. (If the backend isn't running, the form gracefully falls back to a pre-filled email draft.)

Verify a booking was saved:
```bash
curl http://127.0.0.1:8000/api/appointments
```

See [`backend/README.md`](backend/README.md) for API details, switching to MySQL, email notifications, and production hardening.

## ✨ What's included

- **Hero booking CTA** — a single "Book an Appointment" button (Waterford Clinic has one location). The same component renders a clinic tab per location instead when `clinics` in `siteData.js` has more than one entry.
- **Online booking form** — clinic-aware, with:
  - Clinic chooser (synced with the hero tabs)
  - Name, phone, email, DOB, existing-patient, service, date, time, notes
  - Inline validation + GDPR consent
  - **Posts to the Laravel API** (`POST /api/appointments`) and stores the booking in the database
  - Server-side validation mirrored back to fields (422 handling)
  - **Falls back to a pre-filled email draft** (mailto:) if the API is unreachable
  - Loading + error states, success screen with a server-generated reference
  - Remembers the last clinic you picked (localStorage)
- **Services** — 9 GP service cards (consultations, vaccines, bloods, scripts, women's/men's health, mental health, minor injuries…)
- **Why TWL**, **Stats**, **Patient testimonials**, **FAQ** (accordion)
- **Contact** — a card per clinic with address, phone, email, hours, directions (Google Maps) and a "Book at X" button
- **Footer** with both clinic addresses + legal links
- Fully **responsive** + accessible (aria tabs, reduced-motion support, keyboard-friendly)

## 🚀 Run it

Requirements: Node 18+ and npm.

```bash
npm install      # first time only
npm run dev      # start dev server  → http://localhost:5173
```

Other scripts:

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

## 🛠 Tech

- **React 18** + **Vite 5** (no router needed — single page, anchor nav)
- Plain CSS (no UI framework) — variables live in `src/styles/global.css`
- No backend. The booking form is a **front-end demo** by design.

## 📁 Project structure

```
ZCodeProject/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx              # React entry
    ├── App.jsx               # page composition
    ├── context/
    │   └── ClinicContext.jsx # active clinic (Tullamore / Kildare) state
    ├── data/
    │   └── siteData.js       # ← EDIT ME: all copy, services, clinic info, FAQs
    ├── styles/
    │   ├── global.css        # theme, layout, buttons, utilities
    │   └── booking.css       # booking section + form styles
    └── components/
        ├── Header.jsx
        ├── Hero.jsx          # ← the Tullamore / Kildare tabs
        ├── Booking.jsx       # booking section wrapper
        ├── BookingForm.jsx   # ← the appointment form + success screen
        ├── Sections.jsx      # Stats, Services, WhyUs, Testimonials, FAQ
        ├── Contact.jsx       # both clinic cards
        └── Footer.jsx
```

## ✏️ Customising

| What to change | Where |
| --- | --- |
| Clinic addresses, phones, emails, hours | `src/data/siteData.js` → `clinics` |
| Services & booking dropdown | `src/data/siteData.js` → `services`, `services_dropdown` |
| Available appointment times | `src/data/siteData.js` → `timeSlots` |
| FAQs / testimonials / stats | `src/data/siteData.js` |
| Brand colours | `src/styles/global.css` → `:root` CSS variables |
| Where booking emails go | `BookingForm.jsx` — `submitted.clinic.email` is used for the mailto |

## 🔌 Wiring up real bookings later

The form is intentionally backend-free so it works anywhere. To make it live:

1. **Email only (zero code)** — the success screen already generates a `mailto:` link to the clinic's address. Just tell patients to click it.
2. **Form service** (Formspree / Getform / Netlify Forms) — point the `<form>` `action` at your endpoint in `BookingForm.jsx`.
3. **Custom API / practice management system** — replace the `handleSubmit` body with a `fetch('/api/bookings', …)` call.

## ⚠️ Disclaimer

This is a demo build. Addresses and phone numbers are placeholders — replace them with the real clinic details before going live. TWL Clinic is a fictitious brand name used here for the redesign; replace it with your real practice name.
