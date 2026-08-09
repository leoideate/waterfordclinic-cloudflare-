import { useState, useEffect } from 'react'
import { useClinic, isSingleClinic } from '../context/ClinicContext.jsx'
import { site } from '../config/site.js'
import { track } from '../lib/analytics.js'

/** Scroll to an element by id, accounting for the sticky header height. */
function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  const headerH = document.querySelector('.site-header')?.offsetHeight || 0
  const y = el.getBoundingClientRect().top + window.scrollY - headerH - 12
  window.scrollTo({ top: y, behavior: 'smooth' })
}

export default function Header() {
  const { activeClinicKey, setBookingOpenFor, clinics } = useClinic()
  const clinicList = Object.values(clinics)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => setOpen(false)

  // Nav clicks: Services scrolls to #services; each clinic reveals the
  // booking section (locked to that clinic) and scrolls to it. Uses the
  // shared setBookingOpenFor action — same path as the hero tabs.
  const goServices = () => { close(); scrollToId('services') }
  const goClinic = (key) => {
    setBookingOpenFor(key)              // reveals #booking + locks the form to this clinic
    track.clinicSelected(key, 'header_nav')
    close()
    // wait a tick so the section mounts before we scroll
    setTimeout(() => scrollToId('booking'), 50)
  }

  // Plain nav items (Services only). Clinic tabs are styled distinctly below.
  const navItems = [
    { label: 'Services', onClick: goServices },
  ]

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        {/* --- Brand --- */}
        <button
          type="button"
          className="brand"
          onClick={() => { close(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          aria-label={`${site.brand} home`}
        >
          <span className="brand-mark" aria-hidden="true">
            {/* Intrinsic size matches the real logo's ~1.27:1 aspect ratio
                (icon mark stacked over the wordmark) — CSS still drives the
                rendered height, this is just a layout-shift hint. */}
            <img src={site.logo.header} alt={`${site.brand} — walk-in clinic in Waterford`} width="106" height="84" />
          </span>
          <span className="brand-text">
            <small>{site.tagline}</small>
          </span>
        </button>

        {/* --- Primary nav --- */}
        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Primary">
          {/* Plain text links (Services) */}
          {navItems.map(item => (
            <button
              key={item.label}
              type="button"
              className="nav-link"
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ))}

          {/* Booking CTA(s) — one per location. With a single clinic this
              is a plain "Book Appointment" button rather than a location
              picker, since there is nothing to pick between. */}
          {clinicList.map(c => (
            <button
              key={c.key}
              type="button"
              className={`nav-clinic-btn ${!isSingleClinic && activeClinicKey === c.key ? 'is-current' : ''}`}
              onClick={() => goClinic(c.key)}
              aria-pressed={isSingleClinic ? undefined : activeClinicKey === c.key}
            >
              <span aria-hidden="true">{isSingleClinic ? '📅' : '📍'}</span>{' '}
              {isSingleClinic ? 'Book Appointment' : `${c.name} Clinic`}
            </button>
          ))}
        </nav>

        <button
          className={`menu-toggle ${open ? 'is-open' : ''}`}
          label="Toggle menu"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      <style>{`
        .site-header {
          position: sticky; top: 0; z-index: 50;
          background: rgba(255,255,255,0.92);
          backdrop-filter: saturate(180%) blur(10px);
          border-bottom: 1px solid #eef2ee;
          transition: box-shadow 0.2s ease, background 0.2s ease;
        }
        .site-header.is-scrolled { box-shadow: var(--shadow-sm); }
        .header-inner {
          display: flex; align-items: center; gap: 24px;
          min-height: 100px;
        }
        .brand { display: flex; align-items: center; gap: 12px; background: none; border: 0; cursor: pointer; padding: 0; min-width: 0; }
        .brand-mark { min-width: 0; }
        .brand-mark img { display: block; height: 84px; width: auto; max-width: 100%; }
        .brand-text { display: flex; flex-direction: column; line-height: 1.1; font-family: var(--font-head); text-align: left; min-width: 0; }
        .brand-text small { color: var(--green-600); font-size: 0.95rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
        .main-nav { display: flex; align-items: center; gap: 8px; margin-left: auto; }

        /* Plain text nav link (Services) */
        .nav-link {
          background: none; border: 0; cursor: pointer; font-family: var(--font-body);
          color: var(--ink-700); font-weight: 500; font-size: 0.97rem;
          padding: 10px 14px; min-height: 44px; border-radius: 8px;
          transition: color 0.15s, background 0.15s;
        }
        .nav-link:hover { color: var(--green-700); background: var(--green-50); }

        /* ---- Button-style clinic tabs (distinct, clickable CTAs) ---- */
        .nav-clinic-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #fff;
          color: var(--green-700);
          border: 2px solid var(--green-600);
          font-family: var(--font-head); font-weight: 600;
          font-size: 0.92rem;
          padding: 8px 16px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
          box-shadow: 0 2px 6px rgba(31, 122, 62, 0.08);
        }
        .nav-clinic-btn:hover {
          background: var(--green-600);
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(31, 122, 62, 0.22);
        }
        .nav-clinic-btn:focus-visible {
          outline: 3px solid var(--green-300, #6fd29a);
          outline-offset: 2px;
        }
        /* Active state: filled brand-colour pill */
        .nav-clinic-btn.is-current {
          background: var(--green-700);
          color: #c0d7c4;          /* pale green text, matches hero tab styling */
          border-color: var(--green-700);
          /* rgb(0,35,66) is --green-900 (#002342) as a shadow tint. */
          box-shadow: 0 4px 12px rgba(0, 35, 66, 0.28);
        }
        .nav-clinic-btn.is-current:hover {
          /* --green-800 is now a real variable in global.css, so this
             always resolves from the palette — no hardcoded fallback hex
             left over from before that shade existed. */
          background: var(--green-800);
          color: #c0d7c4;
        }

        .menu-toggle {
          display: none; flex-direction: column; justify-content: center; align-items: center;
          gap: 5px; background: none; border: 0; cursor: pointer;
          width: 44px; height: 44px; padding: 0; margin-left: auto; flex: 0 0 auto;
        }
        .menu-toggle span { width: 24px; height: 2.5px; background: var(--ink-900); border-radius: 2px; transition: transform 0.2s, opacity 0.2s; }
        .menu-toggle.is-open span:nth-child(1) { transform: translateY(7.5px) rotate(45deg); }
        .menu-toggle.is-open span:nth-child(2) { opacity: 0; }
        .menu-toggle.is-open span:nth-child(3) { transform: translateY(-7.5px) rotate(-45deg); }

        @media (max-width: 820px) {
          .menu-toggle { display: flex; }
          .header-inner { gap: 12px; }
          .main-nav {
            /* top:100% (not a hard 76px) so the panel stays glued to the bar
               even when the header shrinks on small phones. */
            position: absolute; top: 100%; left: 0; right: 0;
            flex-direction: column; align-items: stretch; gap: 8px;
            background: #fff; border-bottom: 1px solid #eef2ee;
            box-shadow: var(--shadow);
            padding: 14px var(--gutter);
            /* Never taller than the screen below the bar — scroll instead. */
            max-height: calc(100dvh - 100%); overflow-y: auto;
            transform: translateY(-8px); opacity: 0; pointer-events: none;
            transition: opacity 0.2s, transform 0.2s;
          }
          .main-nav.is-open { opacity: 1; transform: translateY(0); pointer-events: auto; }
          .nav-link { text-align: left; padding: 14px 12px; border-radius: 8px; }
          /* Clinic buttons stretch full-width on mobile, slightly larger tap target */
          .nav-clinic-btn {
            width: 100%;
            justify-content: flex-start;
            padding: 14px 18px;
            font-size: 1rem;
          }
        }

        /* Narrow phones: the wordmark + tagline + burger no longer fit
           side by side, so scale the logo and drop the strapline. */
        @media (max-width: 480px) {
          .header-inner { min-height: 76px; }
          .brand-mark img { height: 60px; }
          .brand-text { display: none; }
        }
        @media (max-width: 360px) {
          .brand-mark img { height: 53px; }
        }
      `}</style>
    </header>
  )
}
