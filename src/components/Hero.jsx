import { useClinic } from '../context/ClinicContext.jsx'
import { track } from '../lib/analytics.js'

/* Full-bleed professional healthcare photo for the hero background.
   Dark-green gradient overlay is applied on top for text readability.
   To swap: change the URL (keep the sizing params), or point at your own
   image in /public — e.g. url('/hero.jpg'). */
const HERO_BG_URL =
  'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=2000&q=80&auto=format&fit=crop'

export default function Hero() {
  const { activeClinicKey, setBookingOpenFor } = useClinic()

  /**
   * Hero clinic tab click — single source of truth for "open booking".
   * Picks the clinic (locks form to it), then smooth-scrolls to #booking.
   * The Booking section reads bookingOpenFor from context and reveals itself.
   */
  const pickClinic = (key, location) => {
    setBookingOpenFor(key)              // sets activeClinicKey + bookingOpenFor + lockedClinic
    track.clinicSelected(key, location)
    // setTimeout(0) lets React flush the reveal before we scroll, so the
    // section is mounted by the time scrollIntoView measures its position.
    setTimeout(() => {
      const el = document.getElementById('booking')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  return (
    <section className="hero" id="top">
      {/* ---- Full-bleed background image ---- */}
      <div
        className="hero-bg-image"
        style={{ backgroundImage: `url("${HERO_BG_URL}")` }}
        aria-hidden="true"
      />
      {/* ---- Dark-green gradient overlay for text readability ---- */}
      <div className="hero-overlay" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-content">
          <span className="eyebrow eyebrow-light">🩺 Walk-in GP • Tullamore &amp; Kildare</span>

          <h1>
            See a doctor <span className="hl">today</span>.<br />
            Book your <span className="hl">Walk In GP</span> appointment online.
          </h1>

          <p className="hero-lead">
            Friendly, professional walk-in general practice in the heart of Tullamore and
            Kildare. Choose your clinic below to start your booking, or simply walk in and be seen.
          </p>

          {/* ---- Trust strip ---- */}
          <div className="hero-trust">
            <div className="trust-item"><strong>Open Mon–Sat</strong><span>Walk-ins welcome</span></div>
            <div className="trust-item"><strong>Private GP service</strong><span>Consultation fee €60</span></div>
            <div className="trust-item"><strong>&lt; 15 min</strong><span>Average wait</span></div>
            <div className="trust-item"><strong>Irish Medical Council</strong><span>Registered doctors</span></div>
          </div>

          {/* ---- Clinic booking tabs (the only CTAs in the hero) ----
               Two large green buttons with gold text. Clicking one selects
               that clinic AND smooth-scrolls to the #booking section, where
               the form is locked to the chosen clinic. */}
          <div className="clinic-tabs" role="tablist" aria-label="Choose your clinic to book">
            <button
              type="button"
              role="tab"
              aria-selected={activeClinicKey === 'tullamore'}
              className={`clinic-tab ${activeClinicKey === 'tullamore' ? 'is-active' : ''}`}
              onClick={() => pickClinic('tullamore', 'hero_tab')}
            >
              <span className="ct-icon" aria-hidden="true">📅</span>
              <span>
                <strong>Book Appointment for Tullamore Clinic</strong>
                <small>Tap to choose &amp; book</small>
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeClinicKey === 'kildare'}
              className={`clinic-tab ${activeClinicKey === 'kildare' ? 'is-active' : ''}`}
              onClick={() => pickClinic('kildare', 'hero_tab')}
            >
              <span className="ct-icon" aria-hidden="true">📅</span>
              <span>
                <strong>Book Appointment for Kildare Clinic</strong>
                <small>Tap to choose &amp; book</small>
              </span>
            </button>
          </div>

          {/* ---- Secondary link (kept minimal per spec) ---- */}
          <a href="#services" className="hero-services-link">View our services →</a>
        </div>
      </div>

      <style>{`
        .hero {
          position: relative;
          /* dvh, not vh: on mobile browsers vh counts the retracted URL bar,
             which pushes the CTAs below the fold on first paint. */
          min-height: clamp(560px, 92dvh, 820px);
          display: flex; align-items: center;
          color: #fff;
          overflow: hidden;
          padding-block: clamp(80px, 10vw, 120px);
          /* Fallback background in case the image is blocked/slow */
          background: radial-gradient(120% 120% at 80% -10%, #1c6e37 0%, #14552d 55%, #0e3f22 100%);
        }

        /* ---- Full-bleed background image ---- */
        .hero-bg-image {
          position: absolute; inset: 0;
          background-size: cover;
          background-position: center;
          transform: scale(1.02);
          z-index: 0;
        }
        /* ---- Dark-green gradient overlay (keeps text readable, on-brand) ----
           Symmetric vertical + radial bias so the centered content always
           has a readable backdrop, regardless of the photo underneath. */
        .hero-overlay {
          position: absolute; inset: 0; z-index: 1;
          background:
            linear-gradient(180deg,
              rgba(10, 50, 28, 0.86) 0%,
              rgba(14, 63, 34, 0.72) 45%,
              rgba(20, 83, 45, 0.62) 100%),
            radial-gradient(120% 100% at 50% 30%,
              rgba(10, 50, 28, 0.0) 0%,
              rgba(10, 50, 28, 0.55) 100%);
        }

        .hero-inner {
          position: relative; z-index: 2;
          display: flex;            /* single centered column now (no side panel) */
          justify-content: center;
          width: 100%;
        }

        /* ---- Content column: centered text + balanced block ---- */
        .hero-content {
          max-width: 760px;
          margin-inline: auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .eyebrow-light {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.14); color: #c8f0d3;
          border: 1px solid rgba(255,255,255,0.22);
          font-family: var(--font-head); font-weight: 600;
          font-size: 0.82rem; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 7px 14px; border-radius: 999px;
        }

        .hero h1 {
          color: #fff; margin: 20px 0 18px;
          text-shadow: 0 2px 18px rgba(0,0,0,0.35);
        }
        .hero h1 .hl {
          background: linear-gradient(180deg, #ffe9a8, #f4b740);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          white-space: nowrap;
        }
        .hero-lead {
          font-size: clamp(1.05rem, 1.6vw, 1.2rem);
          color: rgba(255,255,255,0.92);
          max-width: 580px; margin-bottom: 28px;
          text-shadow: 0 1px 12px rgba(0,0,0,0.3);
        }

        /* ---- Trust strip ---- */
        .hero-trust {
          display: flex; gap: 32px; flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 40px;     /* breathing room before clinic tabs */
        }
        .trust-item { display: flex; flex-direction: column; line-height: 1.25; }
        .trust-item strong { font-family: var(--font-head); font-size: 1rem; color: #fff; }
        .trust-item span { font-size: 0.82rem; color: rgba(255,255,255,0.8); }

        /* ============================================================
           Clinic booking tabs: green background, gold/yellow text.
           Bigger, more prominent, balanced spacing. Sits at the bottom
           of the hero content block. Text wraps neatly on mobile and
           the tabs stack vertically on narrow screens.
           ============================================================ */
        .clinic-tabs {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
          max-width: 820px;
        }
        .clinic-tab {
          /* Larger, more clickable surface */
          display: inline-flex;
          align-items: center;
          gap: 14px;
          min-height: 76px;
          padding: 18px 28px;
          border-radius: var(--radius);

          /* Green tab to match the hero theme. Slightly deeper green so the
             gold text pops (matching the gold in the hero heading). */
          background: linear-gradient(180deg, #1f7a3e 0%, #14552d 100%);
          color: #ffe9a8;   /* gold/yellow text, matches the hero heading tone */

          border: 2px solid rgba(255, 233, 168, 0.35);
          cursor: pointer;
          font-family: var(--font-head);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease,
                      background 0.2s ease;
          text-align: left;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(4px);
        }
        .clinic-tab:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 233, 168, 0.7);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.36);
          background: linear-gradient(180deg, #258a47 0%, #196236 100%);
        }
        .clinic-tab:focus-visible {
          outline: 3px solid #ffe9a8;
          outline-offset: 3px;
        }

        /* Active (selected) tab: brighter gold border + lifted shadow so
           the user can see which clinic they've picked. */
        .clinic-tab.is-active {
          border-color: #ffe9a8;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px #ffe9a8 inset;
          background: linear-gradient(180deg, #2a9a50 0%, #1a6e3c 100%);
        }

        .ct-icon {
          font-size: 1.7rem;
          line-height: 1;
          flex-shrink: 0;
        }
        .clinic-tab strong {
          display: block;
          font-size: 1.08rem;
          font-weight: 700;
          color: #ffe9a8;
          line-height: 1.25;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
        }
        .clinic-tab small {
          display: block;
          font-size: 0.78rem;
          margin-top: 3px;
          color: rgba(255, 233, 168, 0.82);
          font-weight: 500;
        }

        /* Secondary "View services" link: subtle, not a competing CTA */
        .hero-services-link {
          display: inline-block;
          margin-top: 28px; padding: 8px 4px;
          color: rgba(255,255,255,0.85);
          font-size: 0.92rem;
          text-decoration: underline;
          text-underline-offset: 4px;
          text-shadow: 0 1px 8px rgba(0,0,0,0.3);
        }
        .hero-services-link:hover { color: #ffe9a8; }

        /* ---- Responsive ---- */
        @media (max-width: 720px) {
          /* Tabs stack vertically on narrow screens so the longer wording
             ("Book Appointment for …") has room to breathe. */
          .clinic-tabs { flex-direction: column; align-items: stretch; max-width: 420px; }
          .clinic-tab { width: 100%; justify-content: flex-start; }
        }
        @media (max-width: 560px) {
          /* Two tidy columns beats four ragged wrapped items */
          .hero-trust {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 16px 12px; width: 100%; max-width: 380px;
            text-align: left; margin-bottom: 32px;
          }
          .hero-overlay {
            background:
              linear-gradient(180deg,
                rgba(10, 50, 28, 0.82) 0%,
                rgba(10, 50, 28, 0.9) 100%);
          }
          .hero-lead { margin-bottom: 24px; }
          .clinic-tab { padding: 16px 18px; min-height: 70px; gap: 12px; }
          .clinic-tab strong { font-size: 1rem; }
          .ct-icon { font-size: 1.4rem; }
        }
        @media (max-width: 360px) {
          .hero { padding-block: 64px; }
          .clinic-tab { padding: 14px 14px; }
          .clinic-tab strong { font-size: 0.95rem; }
          .hero-trust { gap: 12px 10px; }
          .trust-item strong { font-size: 0.92rem; }
          .trust-item span { font-size: 0.76rem; }
        }
        /* Phone held sideways: the hero must not eat the whole screen */
        @media (max-height: 500px) and (orientation: landscape) {
          .hero { min-height: 0; padding-block: 48px; }
          .hero-trust { margin-bottom: 24px; }
        }
      `}</style>
    </section>
  )
}
