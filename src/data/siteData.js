/* =====================================================================
   Waterford Clinic — site content
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
   Waterford Clinic is a SINGLE location, unlike the two-clinic setup this
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
    fullName: 'Waterford Clinic',
    county: 'Co. Waterford',
    tagline: 'Walk-in and out-of-hours GP care in Waterford',

    address: 'TODO: confirm full street address with client',
    eircode: '', // TODO: confirm Eircode

    phone: '051 552424',
    email: 'info@waterfordclinic.ie',

    // TODO: confirm real opening hours. The out-of-hours positioning on
    // their current site implies evening/weekend cover, but no times are
    // published — do not guess.
    hours: [
      { day: 'Mon – Fri', time: 'TODO: confirm' },
      { day: 'Saturday', time: 'TODO: confirm' },
      { day: 'Sunday', time: 'TODO: confirm' },
    ],
    hoursNote: '',

    mapQuery: 'Waterford Clinic, Waterford',
    directionsUrl: '', // TODO: add once the address is confirmed

    // TODO: add once the client's Google Business Profile is linked
    googlePlaceId: '',
    googleReviewUrl: '',

    accent: '#1f6f8b',
    imageAlt: 'Waterford Clinic',
  },
}

/* =====================================================================
   SERVICES — adapted from waterfordclinic.ie/services
   Images are null until the client supplies photography; the service
   cards fall back to the icon tile rather than showing a broken image.
   ===================================================================== */
export const services = [
  {
    icon: '🩹',
    title: 'Injuries & Minor Procedures',
    tagline: 'Faster than an ED wait',
    desc: 'Prompt treatment for acute minor injuries and small surgical procedures — minor lacerations and stitches, skin lesion removal, and ingrown toenail treatment under local anaesthetic. A reliable alternative to a busy emergency department.',
    image: null,
    imageAlt: 'Minor injury treatment and wound care',
  },
  {
    icon: '🩺',
    title: 'General Illness & GP Care',
    tagline: 'Everyday health, seen today',
    desc: 'Diagnosis and treatment for everything from seasonal flu and chest infections to ongoing chronic conditions. Our GPs listen to your symptoms, carry out any checks needed, and set out a recovery plan that fits your life.',
    image: null,
    imageAlt: 'GP consulting with a patient',
  },
  {
    icon: '🌸',
    title: "Women's Health",
    tagline: 'Confidential and unhurried',
    desc: 'Preventive screening, cervical checks, fertility advice and family planning. Includes professional guidance on contraception and hands-on procedures such as Implanon insertion and removal.',
    image: null,
    imageAlt: "Women's health consultation",
  },
  {
    icon: '💚',
    title: 'Mental Health Consultations',
    tagline: 'A confidential space to talk',
    desc: 'A welcoming, private space to discuss anxiety, stress or low mood. We carry out a proper clinical assessment and work with you on a realistic plan — coping strategies, treatment, or onward referral.',
    image: null,
    imageAlt: 'Mental health consultation',
  },
  {
    icon: '📄',
    title: 'Sick Certificates',
    tagline: 'Same-day medical certs',
    desc: 'Medical certificates for work, school or college, issued following a proper consultation. Quick to arrange when illness stops you attending and your employer needs documentation.',
    image: null,
    imageAlt: 'Doctor issuing a medical certificate',
  },
  {
    icon: '🩸',
    title: 'Blood Tests',
    tagline: 'Clear answers, explained',
    desc: 'Routine and diagnostic blood work carried out on site, with results explained clearly by a doctor and onward referral arranged quickly if anything needs following up.',
    image: null,
    imageAlt: 'Blood sample being taken for testing',
  },
]

/** Options in the booking form's "reason for visit" dropdown. */
export const services_dropdown = [
  'General GP Consultation',
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
    a: 'No. Waterford Clinic operates a walk-in service, so you can arrive and wait for the next available doctor. Booking online is recommended if you want a guaranteed time, especially at busier periods.',
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
    a: 'Waterford Clinic is not an emergency service. In a life-threatening emergency always call 999 or 112, or go to your nearest Emergency Department.',
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
