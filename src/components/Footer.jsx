import { clinics, services } from '../data/siteData.js'
import { useClinic } from '../context/ClinicContext.jsx'
import { track } from '../lib/analytics.js'

export default function Footer() {
  const { setActiveClinicKey } = useClinic()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand">
            <img src="/logo-light.png" alt="Walk In GP" className="footer-logo" width="180" height="53" />
          </div>
          <p>Walk-in general practice in Tullamore &amp; Kildare. Friendly, professional care for the whole family, book online or just drop in.</p>
          <p className="footer-reg">Irish Medical Council Registration No. 427776</p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="X">𝕏</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            {services.slice(0, 6).map(s => (
              <li key={s.title}><a href="#services">{s.title}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Our Clinics</h4>
          {Object.values(clinics).map(c => (
            <div className="footer-clinic" key={c.key}>
              <strong>
                <a href="#contact" onClick={() => { setActiveClinicKey(c.key); track.clinicSelected(c.key, 'footer') }}>{c.name} Clinic</a>
              </strong>
              <span className="muted">{c.address}</span>
              <a href={`tel:${c.phone.replace(/\s/g, '')}`}
                 onClick={() => track.phoneClick(c.phone, c.key, 'footer')}>{c.phone}</a>
              {c.googleReviewUrl && (
                <a href={c.googleReviewUrl} target="_blank" rel="noopener noreferrer"
                   onClick={() => track.googleReviewClick(c.key, 'footer')}>⭐ Leave us a review</a>
              )}
            </div>
          ))}
        </div>

        <div className="footer-col">
          <h4>Quick links</h4>
          <ul>
            <li><a href="#booking" onClick={() => track.bookAppointmentClick('footer')}>Book appointment</a></li>
            <li><a href="#faq">FAQs</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Find us</a></li>
          </ul>
          <a href="#booking" className="btn btn-light footer-cta"
             onClick={() => track.bookAppointmentClick('footer_cta')}>🗓️ Book now</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <span>© {year} Walk In GP. All rights reserved.</span>
          <div className="footer-legal">
            <a href="#">Privacy</a>
            <a href="#">GDPR</a>
            <a href="#">Patient charter</a>
          </div>
          <span className="muted">Walk-in GP · Tullamore &amp; Kildare, Ireland 🇮🇪</span>
        </div>
      </div>

      <style>{`
        .site-footer { background: var(--green-900); color: rgba(255,255,255,0.85); padding-top: 64px; }
        .footer-grid {
          display: grid; grid-template-columns: 1.5fr 1fr 1.3fr 1fr; gap: 40px;
          padding-bottom: 48px;
        }
        .footer-brand .brand { margin-bottom: 16px; }
        .footer-logo { display: block; height: 48px; width: auto; }
        .footer-brand p { color: rgba(255,255,255,0.72); font-size: 0.95rem; max-width: 320px; margin-top: 16px; }
        .footer-reg { font-size: 0.82rem; color: rgba(255,255,255,0.55); margin-top: 10px; max-width: 320px; }
        .footer-socials { display: flex; gap: 10px; margin-top: 16px; }
        .footer-socials a {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.1); color: #fff;
          display: grid; place-items: center; font-weight: 700;
        }
        .footer-socials a:hover { background: var(--green-500); text-decoration: none; }
        .footer-col h4 { color: #fff; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }
        .footer-col ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
        .footer-col a { color: rgba(255,255,255,0.78); font-size: 0.95rem; }
        .footer-col a:hover { color: #fff; }
        .footer-clinic { margin-bottom: 16px; display: grid; gap: 2px; }
        .footer-clinic strong a { color: #fff; font-family: var(--font-head); }
        .footer-clinic span { font-size: 0.86rem; }
        .footer-cta { margin-top: 14px; }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.12); padding-block: 20px; }
        .footer-bottom .container { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; font-size: 0.86rem; }
        .footer-legal { display: flex; gap: 18px; }
        .footer-legal a { color: rgba(255,255,255,0.7); }

        @media (max-width: 880px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
        }
        @media (max-width: 520px) {
          .footer-grid { grid-template-columns: 1fr; }
          .footer-bottom .container { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </footer>
  )
}
