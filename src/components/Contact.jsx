import { clinics } from '../data/siteData.js'
import { useClinic, isSingleClinic } from '../context/ClinicContext.jsx'
import { track } from '../lib/analytics.js'

export default function Contact() {
  const { setActiveClinicKey } = useClinic()

  return (
    <section id="contact">
      <div className="container">
        <div className="section-head center">
          <h2>Find us</h2>
          <p>Walk in or book online, whichever suits you.</p>
        </div>

        <div className={`grid ${isSingleClinic ? 'grid-1' : 'grid-2'}`}>
          {Object.values(clinics).map(c => (
            <article className="clinic-card" key={c.key}>
              <div className="clinic-card-head">
                <span className="clinic-badge">{c.name}</span>
                <h3>{c.fullName}</h3>
                <p className="muted">{c.tagline}</p>
              </div>

              <ul className="clinic-info">
                {/* Hidden rather than showing a placeholder — the address
                    is unconfirmed for this client (see siteData.js). An
                    empty <li> is preferable to printing "TODO: ..." on a
                    live page a patient is reading. */}
                {c.address && <li><span aria-hidden="true">📍</span> {c.address}</li>}
                <li><span aria-hidden="true">📞</span>
                  <a href={`tel:${c.phone.replace(/\s/g, '')}`}
                     onClick={() => track.phoneClick(c.phone, c.key, 'contact_card')}>
                    {c.phone}
                  </a>
                </li>
                <li><span aria-hidden="true">✉️</span>
                  <a href={`mailto:${c.email}`}
                     onClick={() => track.emailClick(c.email, c.key, 'contact_card')}>
                    {c.email}
                  </a>
                </li>
              </ul>

              <div className="clinic-hours-mini">
                {/* Only rows with a confirmed time render — see the TODO on
                    clinics.waterford.hours in siteData.js. If nothing is
                    confirmed yet, say so plainly instead of an empty box. */}
                {c.hours.filter(h => h.time).length > 0 ? (
                  c.hours.filter(h => h.time).map(h => (
                    <div key={h.day}><span>{h.day}</span><strong>{h.time}</strong></div>
                  ))
                ) : (
                  <div style={{ border: 0 }}><span>Opening hours</span><strong>Call us to check</strong></div>
                )}
                {c.hoursNote && (
                  <div style={{ display: 'block', paddingTop: 8, fontSize: '0.85rem', color: 'var(--ink-500)', border: 0 }}>
                    {c.hoursNote}
                  </div>
                )}
              </div>

              <div className="clinic-card-actions">
                <a href="#booking" className="btn btn-primary"
                   onClick={() => { setActiveClinicKey(c.key); track.clinicSelected(c.key, 'contact_card'); track.bookAppointmentClick('contact_card') }}>
                  Book at {c.name}
                </a>
                {/* No Google Maps link until the address is confirmed and a
                    real directionsUrl is set — an empty href would open a
                    blank tab. */}
                {c.directionsUrl && (
                  <a className="btn btn-outline"
                     href={c.directionsUrl}
                     target="_blank" rel="noopener noreferrer"
                     onClick={() => track.directionsClick(c.key)}>
                    🗺️ Directions
                  </a>
                )}
              </div>
              {/* Linked to a standalone SEO landing page per clinic (see
                  routes/web.php) in the original multi-clinic template.
                  Waterford Clinic has no such page — the homepage already
                  covers "about the clinic" for a single location — and
                  /waterford is unregistered, so this would otherwise 404. */}
              {!isSingleClinic && (
                <p style={{ marginTop: 12, marginBottom: 0, fontSize: '0.9rem' }}>
                  <a href={`/${c.key}`}>More about the {c.name} clinic →</a>
                </p>
              )}
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .clinic-card {
          background: #fff; border: 1px solid #eef2ee; border-radius: var(--radius-lg);
          padding: 32px; box-shadow: var(--shadow-sm); transition: box-shadow 0.2s, transform 0.2s;
        }
        .clinic-card:hover { box-shadow: var(--shadow); transform: translateY(-3px); }
        .clinic-badge {
          display: inline-block; background: var(--green-700); color: #fff;
          font-family: var(--font-head); font-weight: 600; font-size: 0.8rem;
          padding: 5px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .clinic-card-head h3 { margin: 14px 0 4px; }
        .clinic-info { list-style: none; padding: 0; margin: 18px 0; display: grid; gap: 10px; color: var(--ink-700); }
        .clinic-info li { display: flex; gap: 12px; align-items: flex-start; }
        .clinic-info span[aria-hidden] { flex: 0 0 20px; }
        .clinic-hours-mini { background: var(--green-50); border-radius: var(--radius); padding: 16px 18px; margin-bottom: 20px; }
        .clinic-hours-mini div { display: flex; justify-content: space-between; gap: 4px 12px; flex-wrap: wrap; padding: 4px 0; font-size: 0.94rem; border-bottom: 1px dashed #d6e6db; }
        .clinic-hours-mini div:last-child { border: 0; }
        .clinic-card-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .clinic-card-actions .btn { flex: 1 1 160px; }

        @media (max-width: 620px) {
          .clinic-card { padding: 22px; }
          .clinic-info li { gap: 10px; }
          .clinic-card-actions .btn { flex: 1 1 100%; }
        }
      `}</style>
    </section>
  )
}
