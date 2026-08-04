import { useState, useEffect } from 'react'
import { services, features, stats, faqs, testimonials, clinics } from '../data/siteData.js'
import { site } from '../config/site.js'
import { track } from '../lib/analytics.js'

/* ============== Stats strip ============== */
export function StatsStrip() {
  // Hidden until the client supplies figures they can substantiate. An empty
  // coloured band looks broken, and inventing numbers for a medical practice
  // is not an option.
  if (!stats.length) return null

  return (
    <div className="stats-strip">
      <div className="container">
        <div className="stats-grid">
          {stats.map(s => (
            <div className="stat" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .stats-strip { background: var(--green-900); color: #fff; padding-block: 36px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
        .stat strong { display: block; font-family: var(--font-head); font-size: clamp(1.6rem, 3vw, 2.3rem); color: #fff; }
        .stat span { color: rgba(255,255,255,0.78); font-size: 0.92rem; }
        @media (max-width: 700px) { .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 28px 12px; } }
      `}</style>
    </div>
  )
}

/* ============== Services ============== */
function ServiceCard({ s }) {
  const [imgFailed, setImgFailed] = useState(false)
  // `image: null` is the normal state until the client supplies photography.
  // Checking it up front matters because an <img> with an empty src does not
  // reliably fire onError, so the fallback would never kick in.
  const showImage = Boolean(s.image) && !imgFailed

  return (
    <article className="service-card">
      <div className="svc-image-wrap">
        {showImage ? (
          <img
            className="svc-image"
            src={s.image}
            alt={s.imageAlt || s.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          // Graceful fallback if the photo can't load — keeps the card layout
          <div className="svc-image svc-image-fallback" aria-hidden="true">
            <span>{s.icon}</span>
          </div>
        )}
        <span className="svc-category">{s.icon} {s.tagline}</span>
      </div>

      <div className="svc-body">
        <h3>{s.title}</h3>
        <p>{s.desc}</p>
        <div className="svc-actions">
          <a href="#services" className="svc-readmore"
             onClick={() => track.serviceClick(s.title)}>
            Read More →
          </a>
          <a href="#booking" className="btn btn-primary svc-book"
             onClick={() => { track.serviceClick(s.title); track.bookAppointmentClick('service_card') }}>
            Book Now
          </a>
        </div>
      </div>
    </article>
  )
}

export function Services() {
  return (
    <section id="services" className="bg-cream">
      <div className="container">
        <div className="section-head center">
          <h2>Everything you'd expect from your GP, and more</h2>
          <p>From everyday illnesses and minor injuries to women's health and mental
             health support, our team provides comprehensive primary care for all ages.</p>
        </div>

        <div className="grid grid-3">
          {services.map(s => (
            <ServiceCard key={s.title} s={s} />
          ))}
        </div>

        <div className="services-cta">
          <div>
            <h3>Not sure which service you need?</h3>
            <p>Just walk in or book a general consultation and we'll point you in the right direction.</p>
          </div>
          <a href="#booking" className="btn btn-primary btn-lg"
             onClick={() => track.bookAppointmentClick('services_cta')}>Book a consultation</a>
        </div>
      </div>

      <style>{`
        .service-card {
          display: flex; flex-direction: column;
          background: #fff; border: 1px solid #eef2ee; border-radius: var(--radius-lg);
          overflow: hidden; box-shadow: var(--shadow-sm);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .service-card:hover {
          transform: translateY(-5px); box-shadow: var(--shadow-lg); border-color: var(--green-100);
        }

        /* ---- Image header ---- */
        .svc-image-wrap { position: relative; aspect-ratio: 16 / 10; overflow: hidden; background: var(--green-100); }
        .svc-image {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.4s ease;
        }
        .service-card:hover .svc-image { transform: scale(1.06); }
        .svc-image-fallback {
          display: grid; place-items: center;
          background: linear-gradient(135deg, var(--green-500), var(--green-700));
        }
        .svc-image-fallback span { font-size: 3rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); }

        /* category chip over the photo */
        .svc-category {
          position: absolute; left: 12px; bottom: 12px;
          background: rgba(255,255,255,0.95); color: var(--green-700);
          font-family: var(--font-head); font-weight: 600; font-size: 0.78rem;
          padding: 6px 12px; border-radius: 999px;
          box-shadow: var(--shadow-sm); backdrop-filter: blur(4px);
        }

        /* ---- Body ---- */
        .svc-body { display: flex; flex-direction: column; flex: 1; padding: 22px 22px 20px; }
        .svc-body h3 { margin: 0 0 8px; font-size: 1.18rem; }
        .svc-body p { flex: 1; font-size: 0.94rem; color: var(--ink-700); margin: 0 0 18px; }

        /* ---- Action buttons ---- */
        .svc-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .svc-readmore {
          font-family: var(--font-head); font-weight: 600; font-size: 0.92rem;
          color: var(--green-700); white-space: nowrap;
        }
        .svc-readmore:hover { color: var(--green-900); text-decoration: underline; }
        .svc-book { padding: 10px 20px; font-size: 0.95rem; }

        .services-cta {
          margin-top: 48px; background: linear-gradient(135deg, var(--green-50), #fff);
          border: 1px solid var(--green-100); border-radius: var(--radius-lg);
          padding: 36px; display: flex; align-items: center; justify-content: space-between;
          gap: 24px; flex-wrap: wrap;
        }
        .services-cta h3 { margin: 0 0 4px; }
        .services-cta p { margin: 0; }

        @media (max-width: 620px) {
          .svc-body { padding: 18px 18px 18px; }
          /* Stack the two card actions so neither gets squeezed to two lines */
          .svc-actions { flex-direction: column-reverse; align-items: stretch; gap: 10px; }
          .svc-actions .svc-book { width: 100%; }
          .svc-readmore { text-align: center; }
          .services-cta { padding: 26px 20px; text-align: center; justify-content: center; }
          .services-cta .btn { width: 100%; }
        }
      `}</style>
    </section>
  )
}

/* ============== Why choose us ============== */
export function WhyUs() {
  return (
    <section id="why">
      <div className="container">
        <div className="section-head center">
          <h2>Care that fits around your life</h2>
          <p>We've built the clinic around one idea: making it genuinely easy to see a doctor when you need to.</p>
        </div>

        <div className="grid grid-3">
          {features.map(f => (
            <div className="feature" key={f.title}>
              <div className="feat-icon" aria-hidden="true">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .feature { padding: 8px; }
        .feat-icon {
          width: 52px; height: 52px; border-radius: 50%;
          background: var(--green-700); color: #fff;
          display: grid; place-items: center; font-size: 1.5rem; margin-bottom: 14px;
          box-shadow: 0 8px 20px rgba(31,122,62,0.25);
        }
        .feature h3 { margin-bottom: 6px; }
        .feature p { font-size: 0.96rem; }
      `}</style>
    </section>
  )
}

/* ============== Testimonials ============== */
export function Testimonials() {
  const [index, setIndex] = useState(0)
  const count = testimonials.length
  const reviewClinic = Object.values(clinics).find(c => c.googleReviewUrl)

  const go = (i) => setIndex(count ? (i + count) % count : 0)

  useEffect(() => {
    // `% 0` is NaN, which would blank the carousel and spin a pointless
    // timer, so don't start one until there are reviews to rotate.
    if (count < 2) return
    const id = setInterval(() => setIndex(i => (i + 1) % count), 7000)
    return () => clearInterval(id)
  }, [count])

  // No reviews yet — hide the whole section rather than render an empty
  // slider. Reusing another practice's reviews here is not an option.
  if (!count) return null

  return (
    <section className="bg-green-soft">
      <div className="container">
        <div className="section-head center">
          <h2>What our patients say</h2>
        </div>

        <div className="testimonial-slider">
          <button className="slider-arrow slider-prev" aria-label="Previous review" onClick={() => go(index - 1)}>‹</button>

          <div className="slider-track">
            {testimonials.map((t, i) => (
              <figure className={`card testimonial${i === index ? ' active' : ''}`} key={t.name} aria-hidden={i !== index}>
                <div className="stars" aria-label="5 out of 5 stars">★★★★★</div>
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  <strong>{t.name}</strong>
                  <span className="muted"> · {t.location}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <button className="slider-arrow slider-next" aria-label="Next review" onClick={() => go(index + 1)}>›</button>
        </div>

        <div className="slider-dots" role="tablist" aria-label="Choose a review">
          {testimonials.map((t, i) => (
            <button key={t.name} className={`slider-dot${i === index ? ' active' : ''}`}
                    role="tab" aria-selected={i === index} aria-label={`Show review from ${t.name}`}
                    onClick={() => go(i)} />
          ))}
        </div>

        {reviewClinic && (
          <p className="testimonials-cta">
            Been to see us? <a href={reviewClinic.googleReviewUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => track.googleReviewClick(reviewClinic.key, 'testimonials')}>Leave us a review on Google ⭐</a>
          </p>
        )}
      </div>
      <style>{`
        .testimonials-cta { text-align: center; margin: 24px 0 0; font-size: 0.95rem; color: var(--ink-700); }
        .testimonial-slider { display: flex; align-items: center; gap: 16px; }

        /* All slides share one grid cell, so the track is exactly as tall as
           the longest review at the current width — no fixed min-height to
           clip the text on narrow screens, and no jump as slides rotate. */
        .slider-track { flex: 1; min-width: 0; display: grid; }
        .testimonial {
          grid-area: 1 / 1;
          display: flex; flex-direction: column; gap: 12px;
          width: 100%; margin: 0 auto; max-width: 640px;
          opacity: 0; visibility: hidden;
          transition: opacity 0.35s ease, visibility 0.35s;
        }
        .testimonial.active { opacity: 1; visibility: visible; }
        .stars { color: var(--gold); letter-spacing: 2px; font-size: 1.1rem; }
        .testimonial blockquote { margin: 0; font-size: 1.05rem; color: var(--ink-900); line-height: 1.6; flex: 1; }
        .testimonial figcaption { font-size: 0.95rem; }
        .testimonial figcaption strong { font-family: var(--font-head); }
        .slider-arrow {
          flex: 0 0 auto; width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--green-100);
          background: #fff; color: var(--green-900); font-size: 1.5rem; line-height: 1; cursor: pointer;
          box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: center;
        }
        .slider-arrow:hover { background: var(--green-900); color: #fff; }
        .slider-dots { display: flex; justify-content: center; flex-wrap: wrap; gap: 18px; margin-top: 20px; }
        .slider-dot {
          position: relative; width: 9px; height: 9px; border-radius: 50%;
          border: none; background: var(--green-100); cursor: pointer; padding: 0;
        }
        /* Invisible ~33x27px hit area around the 9px dot — the dot itself is
           far too small to tap reliably on a phone. */
        .slider-dot::after { content: ''; position: absolute; inset: -12px -9px; }
        .slider-dot.active { background: var(--green-900); width: 22px; border-radius: 5px; transition: width 0.2s ease; }

        @media (max-width: 700px) {
          /* Give the review the full width and move the arrows underneath,
             instead of squeezing the card between them. */
          .testimonial-slider { flex-wrap: wrap; justify-content: center; gap: 14px; }
          .slider-track { flex: 1 0 100%; order: -1; }
        }
      `}</style>
    </section>
  )
}

/* ============== FAQ ============== */
export function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="bg-cream">
      <div className="container">
        <div className="section-head center">
          <h2>Frequently asked questions</h2>
        </div>

        <div className="faq-list">
          {faqs.map((f, i) => (
            <div className={`faq-item ${open === i ? 'is-open' : ''}`} key={f.q}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span>{f.q}</span>
                <span className="faq-icon" aria-hidden="true">{open === i ? '−' : '+'}</span>
              </button>
              <div className="faq-a"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .faq-list { max-width: 820px; margin-inline: auto; display: grid; gap: 12px; }
        .faq-item { background: #fff; border: 1px solid #eef2ee; border-radius: var(--radius); overflow: hidden; transition: box-shadow 0.2s; }
        .faq-item.is-open { box-shadow: var(--shadow-sm); border-color: var(--green-100); }
        .faq-q {
          width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 16px;
          padding: 20px 22px; background: none; border: 0; cursor: pointer;
          font-family: var(--font-head); font-weight: 600; font-size: 1.05rem; color: var(--ink-900); text-align: left;
        }
        .faq-icon { flex: 0 0 28px; height: 28px; border-radius: 50%; background: var(--green-100); color: var(--green-700); display: grid; place-items: center; font-size: 1.3rem; line-height: 1; }
        /* 0fr → 1fr instead of a hard max-height: answers reflow taller on
           narrow screens and a fixed cap would cut them off mid-sentence. */
        .faq-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s ease; }
        .faq-item.is-open .faq-a { grid-template-rows: 1fr; }
        /* min-height:0 + overflow:hidden let the 0fr track actually reach
           zero; the bottom padding is applied only when open, since padding
           on a grid item still counts towards a 0fr track's height. */
        .faq-a p {
          margin: 0; min-height: 0; overflow: hidden;
          padding: 0 22px; color: var(--ink-700);
          transition: padding-bottom 0.3s ease;
        }
        .faq-item.is-open .faq-a p { padding-bottom: 22px; }

        @media (max-width: 520px) {
          .faq-q { padding: 16px; font-size: 1rem; gap: 12px; }
          .faq-a p { padding-inline: 16px; }
          .faq-item.is-open .faq-a p { padding-bottom: 18px; }
        }
      `}</style>
    </section>
  )
}
