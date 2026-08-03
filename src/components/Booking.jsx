import BookingForm from './BookingForm.jsx'
import { useClinic, isSingleClinic } from '../context/ClinicContext.jsx'
import { site } from '../config/site.js'
import { track } from '../lib/analytics.js'
import '../styles/booking.css'

export default function Booking() {
  const { activeClinic, bookingOpenFor, lockedClinic, setBookingOpenFor, clinics } = useClinic()

  // Hidden state: a compact prompt with two clinic buttons. Per spec, the
  // whole section stays hidden until the user picks a clinic from the hero
  // or header — but the <section id="booking"> anchor must still exist so
  // smooth-scroll from hero/header tabs can land somewhere.
  if (!bookingOpenFor) {
    return (
      <section id="booking" className="booking booking-closed">
        <div className="container">
          <div className="booking-closed-card">
            <span className="eyebrow">Online Booking</span>
            <h2>{isSingleClinic ? 'Start your booking' : 'Choose your clinic to start your booking'}</h2>
            <p className="lead">
              {isSingleClinic
                ? "Tap below to open the appointment form. Once you submit, you'll receive an email confirmation with your booking reference."
                : "Pick a clinic below to open the appointment form. Once you submit, you'll receive an email confirmation with your booking reference."}
            </p>
            <div className="booking-closed-actions">
              {Object.values(clinics).map(c => (
                <button
                  key={c.key}
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => {
                    setBookingOpenFor(c.key)
                    track.clinicSelected(c.key, 'booking_closed_card')
                  }}
                >
                  <span aria-hidden="true">📅</span>{' '}
                  {isSingleClinic ? 'Book an Appointment' : `Book Appointment for ${c.name} Clinic`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Open state: pitch + form, with the form locked to the chosen clinic.
  const clinic = clinics[bookingOpenFor] || activeClinic

  return (
    <section id="booking" className="booking">
      <div className="container">
        <div className="booking-grid">
          {/* Left — pitch + reassurance */}
          <div className="booking-info">
            <span className="eyebrow">Online Booking</span>
            <h2>Book your appointment at {clinic.name}</h2>
            <p className="lead">
              You're booking for <strong>{clinic.name} Clinic</strong>. Fill in your details,
              choose a time and tell us what you need, it takes about a minute. You'll get an
              email confirmation straight away.
            </p>

            {/* Medical Card / fee notice — shown up-front, matches the form notice */}
            {/* Fee / medical-card notice. Rendered only once the client has
                confirmed their policy — a wrong fee on a medical site is worse
                than no fee at all. See src/config/site.js. */}
            {site.consultationFee && (
              <div className="booking-fee-banner" role="note">
                <strong>⚠️ Please note:</strong>{' '}
                {site.acceptsMedicalCard === false && `Medical Cards and GMS are not accepted at ${site.brand}. `}
                The consultation fee is <strong>{site.consultationFee}</strong>, payable on the day.
              </div>
            )}

            <ul className="booking-benefits">
              <li>
                <span className="bi-icon" aria-hidden="true">⚡</span>
                <span><strong>No waiting on hold</strong><span className="muted">Skip the phone queue and book any time, day or night.</span></span>
              </li>
              <li>
                <span className="bi-icon" aria-hidden="true">📅</span>
                <span><strong>Pick your preferred slot</strong><span className="muted">Choose a date and time that suits your schedule.</span></span>
              </li>
              <li>
                <span className="bi-icon" aria-hidden="true">🔒</span>
                <span><strong>Private &amp; secure</strong><span className="muted">GDPR-compliant. Your details are only used to arrange your visit.</span></span>
              </li>
              {site.consultationFee && (
                <li>
                  <span className="bi-icon" aria-hidden="true">💳</span>
                  <span><strong>Consultation fee {site.consultationFee}</strong><span className="muted">Payable on the day.</span></span>
                </li>
              )}
            </ul>

            <div className="booking-cta-card">
              <h3>Prefer to talk to us?</h3>
              <p>Our reception team is happy to help during opening hours.</p>
              <div className="hours-quick">
                <div><span>{clinic.name}</span><a style={{ color: '#fff' }} href={`tel:${clinic.phone.replace(/\s/g, '')}`}
                  onClick={() => track.phoneClick(clinic.phone, clinic.key, 'booking_cta_card')}>{clinic.phone}</a></div>
                {/* Sourced from clinic.hours (siteData.js) rather than
                    hardcoded — this used to literally print a DIFFERENT
                    client's real opening hours regardless of which clinic
                    was shown. Hidden entirely while hours are unconfirmed
                    (see the TODO on clinics.waterford.hours) rather than
                    showing a placeholder to a patient trying to call. */}
                {clinic.hours
                  .filter(h => h.time && !/^TODO/i.test(h.time))
                  .map(h => (
                    <div key={h.day}><span>{h.day}</span><span>{h.time}</span></div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right — the form, LOCKED to the chosen clinic (no switcher) */}
          <div className="form-wrap">
            <BookingForm lockClinic={lockedClinic} />
          </div>
        </div>
      </div>
    </section>
  )
}
