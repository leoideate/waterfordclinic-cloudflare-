import { Link } from 'react-router-dom'
import { ClinicProvider, useClinic, clinicKeys } from '../context/ClinicContext.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { clinics } from '../data/siteData.js'
import { track } from '../lib/analytics.js'
import '../styles/service-landing.css'

function ServiceLandingContent({ page }) {
  const { setBookingOpenFor } = useClinic()
  const clinic = clinics[clinicKeys[0]]

  const openBooking = () => {
    // Same action the homepage's CTAs use — navigates to /appointment and
    // opens the form there (see ClinicContext.setBookingOpenFor). This page's
    // own ClinicProvider unmounts on navigation, but PublicSite's mounts
    // fresh already pointed at /appointment, which auto-opens the form.
    setBookingOpenFor(clinicKeys[0])
    track.bookAppointmentClick(`service_page_${page.slug}`)
  }

  return (
    <>
      <Header />
      <main className="service-landing">
        <div className="container">
          <nav className="service-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>{page.h1}</span>
          </nav>

          <p className="service-tagline">{page.tagline}</p>
          <h1>{page.h1}</h1>
          <p className="service-intro">{page.intro}</p>

          <ul className="service-bullets">
            {page.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          <div className="service-cta-row">
            <button type="button" className="btn btn-primary btn-lg" onClick={openBooking}>
              📅 Book an appointment
            </button>
            <a
              href={`tel:${clinic.phone.replace(/\s/g, '')}`}
              className="btn btn-outline"
              onClick={() => track.phoneClick(clinic.phone, clinic.key, `service_page_${page.slug}`)}
            >
              📞 Call {clinic.phone}
            </a>
          </div>

          {page.faqs?.length > 0 && (
            <section className="service-faqs">
              <h2>Frequently asked questions</h2>
              {page.faqs.map((f) => (
                <div key={f.q} className="service-faq-item">
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </section>
          )}

          <p className="service-back">
            <Link to="/#services">← See all services</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}

/** Each dedicated service/keyword landing page (src/data/siteData.js
 *  servicePages) renders through this shared shell, wrapped in its own
 *  ClinicProvider so Header/Footer/the booking CTA work exactly like the
 *  homepage — same pattern App.jsx's PublicSite already uses. */
export default function ServiceLanding({ page }) {
  return (
    <ClinicProvider>
      <ServiceLandingContent page={page} />
    </ClinicProvider>
  )
}
