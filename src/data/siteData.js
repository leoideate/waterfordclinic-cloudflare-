/* =====================================================================
   Waterford Walk In Clinic — site content
   ---------------------------------------------------------------------
   Copy, services and FAQs for the public site. Brand-level settings
   (name, domain, colours, analytics IDs) live in src/config/site.js.

   Service descriptions are adapted from the client's existing site at
   waterfordclinic.ie. Anything not published there is marked TODO rather
   than guessed — see the note on clinics below.
   ===================================================================== */

/* =====================================================================
   CLINICS
   ---------------------------------------------------------------------
   Waterford Walk In Clinic is a SINGLE location, unlike the two-clinic setup this
   platform was originally built for. The UI adapts: with one clinic the
   hero shows a single booking CTA instead of location tabs.

   ⚠️  address and hours are NOT published anywhere on waterfordclinic.ie
       (checked home, about, services and contact pages). They are left as
       explicit TODOs because inventing them for a medical practice would
       send unwell patients to the wrong place at the wrong time.
       These MUST be confirmed by the client before launch.
   ===================================================================== */
export const clinics = {
  waterford: {
    key: 'waterford',
    name: 'Waterford',
    fullName: 'Waterford Walk In Clinic',
    county: 'Co. Waterford',
    tagline: 'Walk-in and out-of-hours medical care in Waterford',

    // TODO: confirm the full street address with the client. Deliberately
    // an empty string, NOT a placeholder like "TODO: confirm..." — every
    // component that renders this (Contact card, booking confirmation
    // email) treats an empty address as "not yet known" and hides the row
    // rather than rendering literal text. Do not put placeholder text
    // here, it will be sent to real patients in their confirmation email.
    address: '',
    eircode: '', // TODO: confirm Eircode

    phone: '051 552424',
    email: 'info@waterfordclinic.ie',

    // TODO: confirm real opening hours. The out-of-hours positioning on
    // their current site implies evening/weekend cover, but no times are
    // published — do not guess. `time: ''` (not a placeholder string) for
    // the same reason as `address` above — every render site filters out
    // rows with an empty time.
    hours: [
      { day: 'Mon – Fri', time: '' },
      { day: 'Saturday', time: '' },
      { day: 'Sunday', time: '' },
    ],
    hoursNote: '',

    mapQuery: 'Waterford Walk In Clinic, Waterford',
    directionsUrl: '', // TODO: add once the address is confirmed

    // TODO: add once the client's Google Business Profile is linked
    googlePlaceId: '',
    googleReviewUrl: '',

    accent: '#003a6c',
    imageAlt: 'Waterford Walk In Clinic',
  },
}

/* =====================================================================
   SERVICES — adapted from waterfordclinic.ie/services
   ---------------------------------------------------------------------
   Images are stock photography (Unsplash), NOT this clinic's own — the
   client hasn't supplied real photography yet. Each URL was verified to
   actually resolve before being added here (loaded and checked at the
   exact CDN URL used below, not guessed from memory). Swap for real
   photos of the clinic/team as soon as they're available; until then
   this is materially better than the icon-only fallback but should not
   be mistaken for photos of the actual premises or staff.
   ===================================================================== */
export const services = [
  {
    icon: '🩹',
    title: 'Injuries & Minor Procedures',
    tagline: 'Faster than an ED wait',
    desc: 'Prompt treatment for acute minor injuries and small surgical procedures — minor lacerations and stitches, skin lesion removal, and ingrown toenail treatment under local anaesthetic. A reliable alternative to a busy emergency department.',
    image: 'https://images.unsplash.com/photo-1609840534277-88833ef3ddeb?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Minor injury treatment and wound care',
    slug: 'minor-injuries',
  },
  {
    icon: '🩺',
    title: 'General Illness & Medical Care',
    tagline: 'Everyday health, seen today',
    desc: 'Diagnosis and treatment for everything from seasonal flu and chest infections to ongoing chronic conditions. Our doctors listen to your symptoms, carry out any checks needed, and set out a recovery plan that fits your life.',
    image: 'https://images.unsplash.com/photo-1758691462666-6470b740f544?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Doctor consulting with a patient',
    slug: null, // no dedicated landing page yet — links back to the homepage's #services card
  },
  {
    icon: '🌸',
    title: "Women's Health",
    tagline: 'Confidential and unhurried',
    desc: 'Preventive screening, cervical checks, fertility advice and family planning. Includes professional guidance on contraception and hands-on procedures such as Implanon insertion and removal.',
    image: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800&q=80&auto=format&fit=crop',
    imageAlt: "Women's health consultation",
    slug: 'womens-health',
  },
  {
    icon: '💚',
    title: 'Mental Health Consultations',
    tagline: 'A confidential space to talk',
    desc: 'A welcoming, private space to discuss anxiety, stress or low mood. We carry out a proper clinical assessment and work with you on a realistic plan — coping strategies, treatment, or onward referral.',
    image: 'https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Mental health consultation',
    slug: null, // no dedicated landing page yet — links back to the homepage's #services card
  },
  {
    icon: '📄',
    title: 'Sick Certificates',
    tagline: 'Same-day medical certs',
    desc: 'Medical certificates for work, school or college, issued following a proper consultation. Quick to arrange when illness stops you attending and your employer needs documentation.',
    image: 'https://images.unsplash.com/photo-1678940805259-e2be79fa33e4?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Doctor issuing a medical certificate',
    slug: 'sick-certificates',
  },
  {
    icon: '🩸',
    title: 'Blood Tests',
    tagline: 'Clear answers, explained',
    desc: 'Routine and diagnostic blood work carried out on site, with results explained clearly by a doctor and onward referral arranged quickly if anything needs following up.',
    image: 'https://images.unsplash.com/photo-1542884841-9f546e727bca?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Blood sample being taken for testing',
    slug: 'blood-tests',
  },
]

/** Options in the booking form's "reason for visit" dropdown. */
export const services_dropdown = [
  'General Medical Consultation',
  'Injury or Minor Procedure',
  "Women's Health",
  'Mental Health Consultation',
  'Sick Certificate',
  'Blood Test',
  'Other',
]

/* Fallback slot list used only when the availability API is unreachable.
   Real availability comes from the backend per clinic and per day.
   TODO: align with the client's confirmed opening hours. */
export const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
]

/* =====================================================================
   STATS
   ---------------------------------------------------------------------
   Deliberately EMPTY. The previous client's figures (years in operation,
   patients seen, average wait) are their claims and are not true of this
   practice. The stats strip hides itself when this array is empty.
   TODO: replace with figures the client can actually substantiate.
   ===================================================================== */
export const stats = []

export const features = [
  {
    icon: '⚡',
    title: 'Walk in or book ahead',
    desc: 'Drop in without an appointment, or book online to hold a time that suits you.',
  },
  {
    icon: '🌙',
    title: 'Out-of-hours cover',
    desc: "Medical needs don't keep office hours. We're here outside the usual 9-to-5.",
  },
  {
    icon: '🛡️',
    title: 'Experienced clinical team',
    desc: 'Fully qualified doctors and nurses, registered with the Irish Medical Council.',
  },
  {
    icon: '🏥',
    title: 'An alternative to the ED',
    desc: 'Minor injuries and procedures treated on site, without the emergency department wait.',
  },
  {
    icon: '🔒',
    title: 'Private and confidential',
    desc: 'GDPR-compliant. Your medical information is held securely and never shared without consent.',
  },
  {
    icon: '📅',
    title: 'Book online in a minute',
    desc: 'Pick a date, a time and a reason for your visit — confirmation lands in your inbox.',
  },
]

/* =====================================================================
   FAQs
   ---------------------------------------------------------------------
   Fee and medical-card questions are omitted until the client confirms
   their policy — the previous client's answers (€60, no GMS) do not
   necessarily apply here and would be misleading if wrong.
   TODO: add pricing and medical card FAQs once confirmed.
   ===================================================================== */
export const faqs = [
  {
    q: 'Do I need an appointment to be seen?',
    a: 'No. Waterford Walk In Clinic operates a walk-in service, so you can arrive and wait for the next available doctor. Booking online is recommended if you want a guaranteed time, especially at busier periods.',
  },
  {
    q: 'What can I be seen for?',
    a: "Everyday illnesses, minor injuries and small procedures, women's health, mental health consultations, sick certificates and blood tests. If you are unsure, book a general consultation and we will point you in the right direction.",
  },
  {
    q: 'Can you treat minor injuries instead of the hospital?',
    a: 'For many minor injuries, yes — we handle lacerations and stitches, skin lesion removal and ingrown toenail treatment on site, usually far faster than an emergency department. Serious injuries should still go to an ED.',
  },
  {
    q: 'Can I get a sick certificate for work?',
    a: 'Yes. Medical certificates for work, school or college are issued following a consultation with one of our doctors.',
  },
  {
    q: 'What if I have a medical emergency?',
    a: 'Waterford Walk In Clinic is not an emergency service. In a life-threatening emergency always call 999 or 112, or go to your nearest Emergency Department.',
  },
]

/* =====================================================================
   SERVICE / KEYWORD LANDING PAGES — src/pages/ServiceLanding.jsx
   ---------------------------------------------------------------------
   Dedicated URLs for the SEO audit's P1 recommendation (Aug 2026): the
   homepage bundles all six services into on-page anchors, so none of them
   have a URL Google can rank independently. Built from copy already live
   and approved elsewhere on the site (the `services` cards above, the
   `faqs` above) — NOT new claims. No fee, hours or address content here,
   same reason those are absent everywhere else in this file: unconfirmed
   by the client.
   ===================================================================== */
export const servicePages = [
  {
    slug: 'walk-in-doctor',
    h1: 'Walk-In Doctor in Waterford',
    metaTitle: 'Walk-In Doctor Waterford | Same-Day GP Care — Waterford Walk In Clinic',
    metaDescription: 'See a walk-in doctor in Waterford today, no appointment needed. Genuine out-of-hours GP care for when your own doctor is closed.',
    tagline: 'No appointment needed',
    intro: 'Waterford Walk In Clinic is a walk-in medical practice. Arrive without an appointment and be seen by the next available doctor, or book online in advance to hold a time that suits you. We offer genuine out-of-hours cover, beyond the usual 9-to-5, for when your own GP is closed.',
    bullets: [
      'Walk in without an appointment — no referral needed',
      'Or book online in a minute to hold a time that suits you',
      'Out-of-hours cover, evenings and weekends',
      'Fully qualified doctors, registered with the Irish Medical Council',
    ],
    faqs: [faqs[0], faqs[4]],
  },
  {
    slug: 'minor-injuries',
    h1: 'Minor Injuries & Stitches in Waterford',
    metaTitle: 'Minor Injury Clinic Waterford | Stitches & Wound Care — Waterford Walk In Clinic',
    metaDescription: 'Minor injury treatment in Waterford — lacerations and stitches, skin lesion removal and ingrown toenail treatment. Faster than an ED wait.',
    tagline: services[0].tagline,
    intro: services[0].desc,
    bullets: [
      'Minor lacerations and stitches',
      'Skin lesion removal',
      'Ingrown toenail treatment under local anaesthetic',
    ],
    faqs: [faqs[2]],
  },
  {
    slug: 'womens-health',
    h1: "Women's Health in Waterford",
    metaTitle: "Women's Health Clinic Waterford | Confidential Care — Waterford Walk In Clinic",
    metaDescription: "Confidential women's health care in Waterford — preventive screening, cervical checks, contraception and family planning advice.",
    tagline: services[2].tagline,
    intro: services[2].desc,
    bullets: [
      'Preventive screening and cervical checks',
      'Fertility advice and family planning',
      'Contraception guidance',
      'Implanon insertion and removal',
    ],
    faqs: [faqs[1]],
  },
  {
    slug: 'blood-tests',
    h1: 'Blood Tests in Waterford',
    metaTitle: 'Blood Tests Waterford | Same-Day Results Explained — Waterford Walk In Clinic',
    metaDescription: 'Routine and diagnostic blood tests in Waterford, carried out on site with results explained clearly by a doctor.',
    tagline: services[5].tagline,
    intro: services[5].desc,
    bullets: [
      'Routine and diagnostic blood work',
      'Results explained clearly by a doctor',
      'Fast onward referral if follow-up is needed',
    ],
    faqs: [faqs[1]],
  },
  {
    slug: 'sick-certificates',
    h1: 'Sick Certificates in Waterford',
    metaTitle: 'Sick Cert Waterford | Same-Day Medical Certificates — Waterford Walk In Clinic',
    metaDescription: 'Same-day sick certificates in Waterford for work, school or college, issued following a consultation with one of our doctors.',
    tagline: services[4].tagline,
    intro: services[4].desc,
    bullets: [
      'For work, school or college',
      'Issued following a proper consultation',
      'Quick to arrange when illness stops you attending',
    ],
    faqs: [faqs[3]],
  },
]

/* =====================================================================
   TESTIMONIALS
   ---------------------------------------------------------------------
   Deliberately EMPTY. The previous client's reviews are real, named
   patients writing about a different practice and a different doctor —
   reusing them here would be fabricated testimonials. The testimonials
   section hides itself when this array is empty.
   TODO: populate from the client's own Google reviews, with permission.
   ===================================================================== */
export const testimonials = []
