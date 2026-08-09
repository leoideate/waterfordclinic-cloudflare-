import { Link } from 'react-router-dom'
import { ClinicProvider } from '../context/ClinicContext.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { services } from '../data/siteData.js'
import '../styles/service-landing.css'

function ServicesHubContent() {
  return (
    <>
      <Header />
      <main className="service-landing">
        <div className="container">
          <nav className="service-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Services</span>
          </nav>

          <p className="service-tagline">What we treat</p>
          <h1>Services at Waterford Walk In Clinic</h1>
          <p className="service-intro">
            Every service below is available at the same clinic, with the same doctors. Walk in without an
            appointment, or book online ahead of time.
          </p>

          <Link to="/walk-in-doctor" className="service-hub-card service-hub-card-featured">
            <span className="shc-icon" aria-hidden="true">🩺</span>
            <span>
              <strong>Walk-In Doctor</strong>
              <span>No appointment needed — see the next available doctor</span>
            </span>
          </Link>

          <div className="service-hub-grid">
            {services.map((s) =>
              s.slug ? (
                <Link key={s.title} to={`/${s.slug}`} className="service-hub-card">
                  <span className="shc-icon" aria-hidden="true">{s.icon}</span>
                  <span>
                    <strong>{s.title}</strong>
                    <span>{s.tagline}</span>
                  </span>
                </Link>
              ) : (
                <a key={s.title} href="/#services" className="service-hub-card">
                  <span className="shc-icon" aria-hidden="true">{s.icon}</span>
                  <span>
                    <strong>{s.title}</strong>
                    <span>{s.tagline}</span>
                  </span>
                </a>
              )
            )}
          </div>

          <p className="service-back">
            <Link to="/appointment">📅 Book an appointment →</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}

/** /services — a genuine hub page linking out to each dedicated
 *  service/keyword landing page, replacing the old redirect-to-homepage
 *  (SEO audit flagged /services/ as serving no distinct content). */
export default function ServicesHub() {
  return (
    <ClinicProvider>
      <ServicesHubContent />
    </ClinicProvider>
  )
}
