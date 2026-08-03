/* =====================================================================
   Walk In GP — Site content
   Adapted from walkingp.ie (walk-in GP practice content).
   Two locations: Tullamore & Kildare.
   ===================================================================== */

export const clinics = {
  tullamore: {
    key: 'tullamore',
    name: 'Tullamore',
    fullName: 'Walk In GP Tullamore',
    county: 'Co. Offaly',
    tagline: 'Walk-in GP care in the heart of Tullamore',
    address: 'Offaly St, Tullamore, Co. Offaly, R35 C985, Ireland',
    phone: '+353 818 362 867',
    email: 'tullamore@walkingp.ie',
    hours: [
      { day: 'Mon – Fri', time: '10:00am – 8:00pm' },
      { day: 'Saturday', time: '10:00am – 6:00pm' },
      { day: 'Sunday', time: 'Phone appointment only' }
    ],
    hoursNote: 'Bank holiday hours may differ.',
    mapQuery: 'Offaly St, Tullamore, Co. Offaly',
    directionsUrl: 'https://www.google.com/maps/dir//Walk+In+GP,+Offaly+St,+Tullamore,+Co.+Offaly,+R35+C985,+Ireland/@53.2771327,-7.4926286,14z/data=!4m8!4m7!1m0!1m5!1m1!1s0x485da5aa9b9318f3:0xe0de76896a6b0f0a!2m2!1d-7.4926286!2d53.2771327?entry=ttu',
    // Google Business Profile — Walk In GP Tullamore (5.0, 20 reviews as of 2026-08-02)
    googlePlaceId: '0x485da5aa9b9318f3:0xe0de76896a6b0f0a',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=0x485da5aa9b9318f3:0xe0de76896a6b0f0a',
    accent: '#1f7a3e',
    imageAlt: 'Walk In GP Tullamore on Offaly St'
  },
  kildare: {
    key: 'kildare',
    name: 'Kildare',
    fullName: 'Walk In GP Kildare',
    county: 'Co. Kildare',
    tagline: 'Modern walk-in GP service in Kildare town',
    address: '3 Fairview Cottages, Kildare, R51 HV25, Ireland',
    phone: '+353 818 362 867',
    email: 'kildare@walkingp.ie',
    hours: [
      { day: 'Mon – Fri', time: '10:00am – 8:00pm' },
      { day: 'Saturday', time: '12:00pm – 6:00pm' },
      { day: 'Sunday', time: 'Phone appointment only' }
    ],
    hoursNote: 'Hours may differ on public holidays.',
    mapQuery: '3 Fairview Cottages, Kildare',
    directionsUrl: 'https://www.google.com/maps/dir//Walk+In+GP+Kildare,+3+Fairview+Cottages,+Kildare,+R51+HV25,+Ireland/@53.1604455,-6.9117951,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x485d79c585caad45:0xc42435dc5288ea5a!2m2!1d-6.9117951!2d53.1604455?entry=ttu',
    // Google Business Profile — set these to the real values
    googlePlaceId: '',
    googleReviewUrl: '',
    accent: '#1f7a3e',
    imageAlt: 'Walk In GP Kildare at Fairview Cottages'
  }
}

export const services = [
  {
    icon: '🩺',
    title: 'Walk-In GP Consultations',
    tagline: 'See a doctor today',
    desc: 'No appointment needed for most concerns. Quick, friendly, professional care when you need it most, with our GPs seeing walk-in patients throughout the day, six days a week. Book ahead to guarantee a slot that suits you, or simply drop in.',
    image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'GP doctor consulting with a patient'
  },
  {
    icon: '💉',
    title: 'Vaccinations & Travel Health',
    tagline: 'Stay protected at home & abroad',
    desc: 'Seasonal flu and COVID-19 boosters, childhood immunisations, and full travel vaccination advice for trips abroad. Our nurses provide tailored travel health plans based on your destination, length of stay and medical history.',
    image: '/services/vaccinations-travel-health.jpg',
    imageAlt: 'Nurse administering a vaccination'
  },
  {
    icon: '🩸',
    title: 'Blood Tests & Health Screens',
    tagline: 'Clarity on your health',
    desc: 'Comprehensive blood work, cholesterol and diabetes checks, and full health screening packages for peace of mind. Results are explained clearly by a GP, with onward referral arranged quickly if anything needs follow-up.',
    image: '/services/blood-tests-health-screens.jpg',
    imageAlt: 'Blood sample being taken for testing'
  },
  {
    icon: '❤️',
    title: 'Cardiac & BP Checks',
    tagline: 'Look after your heart',
    desc: 'Blood pressure monitoring and heart-health reviews to keep your cardiovascular system in great shape. We provide 24-hour BP monitoring, lifestyle advice and fast referral to cardiology when needed.',
    image: '/services/cardiac-bp-checks.jpg',
    imageAlt: 'Doctor performing a heart health check'
  },
  {
    icon: '🧠',
    title: 'Mental Health Support',
    tagline: 'You\'re not alone',
    desc: 'Confidential, compassionate mental health care for anxiety, depression, stress, sleep and bereavement. Our GPs offer assessment, talking-therapy referrals and ongoing support, and will always make time to listen.',
    image: '/services/mental-health-support.jpg',
    imageAlt: 'Supportive conversation with a doctor'
  },
  {
    icon: '👩‍⚕️',
    title: 'Women\'s Health',
    tagline: 'Care for every stage',
    desc: 'Confidential GP consultations for women\'s health concerns, including cycle and hormone-related issues and general wellbeing.',
    image: '/services/womens-health.jpg',
    imageAlt: 'Woman at a GP women\'s health appointment'
  },
  {
    icon: '👨‍⚕️',
    title: 'Men\'s Health',
    tagline: 'Stay on top of your health',
    desc: 'Prostate checks, testosterone reviews, sexual health screening and full well-man health assessments. We make it easy to talk openly and get checked, because early detection makes all the difference.',
    image: '/services/mens-health.jpg',
    imageAlt: 'Doctor consulting with a male patient'
  },
  {
    icon: '🩹',
    title: 'Minor Injuries & Wound Care',
    tagline: 'Quick care, no A&E queue',
    desc: 'Cuts, burns, sprains, stitches and dressing changes handled quickly, no need to wait for hours in A&E. Walk in or book and our team will assess, treat and follow up to make sure you heal well.',
    image: '/services/minor-injuries-wound-care.jpg',
    imageAlt: 'Medical professional dressing a wound'
  },
  {
    icon: '🏃',
    title: 'Physiotherapy',
    tagline: 'Move better, recover faster',
    desc: 'Support for musculoskeletal pain, mobility issues, sports injuries, and recovery plans. Appointments can be requested through Walk In GP.',
    image: '/services/physiotherapy.jpg',
    imageAlt: 'Physiotherapist treating a patient'
  },
  {
    icon: '👂',
    title: 'Ear Syringing',
    tagline: 'Clear, comfortable relief',
    desc: 'Ear wax assessment and ear syringing service available by appointment where clinically appropriate.',
    image: '/services/ear-syringing.jpg',
    imageAlt: 'Doctor examining a patient\'s ear'
  },
  {
    icon: '🧪',
    title: 'STI Testing',
    tagline: 'Private & confidential',
    desc: 'Private and confidential STI testing service available by appointment.',
    image: '/services/sti-testing.jpg',
    imageAlt: 'STI testing service'
  },
  {
    icon: '🏠',
    title: 'Home Visit Requests',
    tagline: 'By phone or email, 24/7',
    desc: '24/7 home visit requests can be made by phone or email. Availability may depend on location, clinical urgency, and doctor availability.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Doctor visiting a patient at home'
  }
]

export const services_dropdown = [
  'Walk-In GP Consultation',
  'GP Consultation',
  'Women\'s Health',
  'Men\'s Health',
  'Physiotherapy',
  'Ear Syringing',
  'STI Testing',
  'Home Visit Request',
  'Other'
]

export const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30'
]

export const stats = [
  { value: '15+ yrs', label: 'Caring for our communities' },
  { value: '2', label: 'Clinics in Tullamore & Kildare' },
  { value: '15 min', label: 'Average wait time, walk-in' },
  { value: '7.8k', label: 'Patients seen' }
]

export const features = [
  {
    icon: '⚡',
    title: 'Walk-in, every day',
    desc: 'No appointment? No problem. Walk in and be seen, most patients are with a doctor within 15 minutes.'
  },
  {
    icon: '📅',
    title: 'Book online in 60 seconds',
    desc: 'Pick your clinic, your time and your reason, and our online booking confirms your slot instantly.'
  },
  {
    icon: '🛡️',
    title: 'Experienced GPs',
    desc: 'Our team of friendly, fully-qualified GPs and nurses have years of experience in Irish primary care.'
  },
  {
    icon: '📍',
    title: 'Two handy locations',
    desc: 'Right in the centre of Tullamore and Kildare town, with on-site parking available and wheelchair accessible clinics.'
  },
  {
    icon: '💳',
    title: 'Fair, transparent pricing',
    desc: 'Private GP service. Consultation fee €60, payable on the day. Please note: Medical Cards and GMS are not accepted.'
  },
  {
    icon: '🔒',
    title: 'Your data stays private',
    desc: 'Fully GDPR-compliant. Your medical information is held securely and never shared without consent.'
  }
]

export const faqs = [
  {
    q: 'Do I need an appointment to be seen?',
    a: 'No. Both clinics operate a walk-in service, so you can simply arrive and wait for the next available GP. Booking online is recommended if you want a guaranteed time slot, especially at busy periods.'
  },
  {
    q: 'Can I choose which clinic to attend?',
    a: 'Absolutely. Use the Tullamore / Kildare tabs at the top of the page to see opening hours and book at the location that suits you best.'
  },
  {
    q: 'Do you accept medical cards (GMS)?',
    a: 'No. Walk In GP is a private clinic. Medical Cards and GMS are not accepted. The consultation fee is €60, payable on the day.'
  },
  {
    q: 'How much does a consultation cost?',
    a: 'A standard private GP consultation is €60, payable on the day. Blood tests, travel vaccines and procedures are priced separately, so ask at reception for our full price list.'
  },
  {
    q: 'What if I have a medical emergency?',
    a: 'Walk In GP is not an emergency service. In a life-threatening emergency always call 999 or 112, or go to your nearest Emergency Department.'
  }
]

export const testimonials = [
  {
    quote: 'Excellent GP service. I ended up here Friday evening when my own doctor was closed and I had become really ill. Dr. Affan was so kind, caring and thorough and really put my mind at ease. The lady at reception was so lovely as well and there was very minimal wait time. Premises is lovely and clean. Would highly recommend.',
    name: 'Shannon Malone',
    location: 'Tullamore'
  },
  {
    quote: 'Fantastic service. I was seen on a Sunday morning after developing severe food poisoning. Dr Affan was extremely accommodating and kind throughout. Great to be able to have a walk-in GP open on a weekend. Brilliant care, I will be back if needed in future!',
    name: 'Shariq Khan',
    location: 'Tullamore'
  },
  {
    quote: 'Dr Affan is an amazing doctor and person. We have brought our son twice to see him and both times he was so kind and caring, so good with kids. Highly recommended, and the girls at reception are so lovely too.',
    name: 'Louise Rohan',
    location: 'Tullamore'
  },
  {
    quote: '5-star service! I recently had an appointment and was impressed by the minimal wait time and the care taken during the consultation. The doctor listened attentively, explained everything clearly. Highly recommend!',
    name: 'Claudine Daly',
    location: 'Tullamore'
  },
  {
    quote: 'Good doctor, was able to get seen very quickly and got great care. Doctor was very thorough and extremely helpful.',
    name: 'Colm Coughlan',
    location: 'Tullamore'
  },
  {
    quote: 'Excellent service! The doctors at Walk In GP Tullamore are professional, friendly, and really take the time to listen. I was seen quickly without any hassle, and the staff made the whole experience smooth and comfortable.',
    name: 'Angelina Smith',
    location: 'Tullamore'
  },
  {
    quote: 'Great service, got an appointment within the hour. Would highly recommend.',
    name: 'Lyndsay Power',
    location: 'Tullamore'
  },
  {
    quote: 'Dr Affan is an absolute gentleman, very thorough, professional and efficient service. Very impressed with this service, thank you.',
    name: 'Claire Duffy',
    location: 'Tullamore'
  },
  {
    quote: 'Lovely doctors, was very comfortable and welcomed. Definitely recommend them to anyone.',
    name: 'Kellyxpower',
    location: 'Tullamore'
  },
  {
    quote: 'Great doctor. Highly recommended, he goes over and beyond when I look for anything.',
    name: 'Joe Sweeney',
    location: 'Tullamore'
  }
]
