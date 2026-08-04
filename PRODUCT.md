# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Patients in Waterford who need to see a GP quickly — either because their own
GP is closed (evenings/weekends) or because they want faster access than
waiting for a routine appointment or attending the Emergency Department.
Secondary user: clinic admin staff, who manage appointments, availability,
holidays/closures, and admin users through a separate `/admin` dashboard.

## Product Purpose
A walk-in and out-of-hours GP clinic (single location, Waterford) with an
online booking flow: patients pick a date/time and service, submit their
details, and receive a confirmation email with a reference number. Staff
manage the whole booking lifecycle (confirm, complete, cancel, no-show) and
clinic availability (weekly schedule, breaks, holidays, ad-hoc closures)
through the admin dashboard.

## Positioning
Speed and convenience is the primary differentiator — faster to be seen than
the ED, and no need to wait for a routine GP appointment slot. Genuine
out-of-hours availability (evenings/weekends, beyond a typical 9-to-5 GP) is
a real, confirmed secondary differentiator — the clinic actually operates
extended hours, even though the exact opening times are not yet finalized in
the copy. Do not lead marketing copy with out-of-hours over speed/convenience;
it supports the primary claim rather than replacing it.

## Operating Context
Single clinic location in Waterford (not multi-site — the platform this was
built from originally supported several locations; this deployment
deliberately collapses that to one). Patients book through the public site;
the same booking form falls back to a pre-filled `mailto:` draft if the
backend API is unreachable. Admin staff run the clinic day-to-day from the
dashboard: appointments list/search/export, weekly availability schedule,
break times, holidays, temporary closures, and admin user management.

## Capabilities and Constraints
Services offered: Injuries & Minor Procedures, General Illness & GP Care,
Women's Health, Mental Health Consultations, Sick Certificates, Blood Tests.

**Explicitly undecided / not yet confirmed by the client** — do not invent
values for these, and do not remove the conditional rendering that hides
them until they're set:
- Full street address (not published anywhere by the client yet)
- Exact opening hours (out-of-hours operation itself IS confirmed real —
  see Positioning — but the specific times are not finalized)
- Consultation fee and medical-card/GMS acceptance policy

Confirmed operational facts: phone 051 552424, email info@waterfordclinic.ie.

## Brand Commitments
Name: "Waterford Clinic". Real logo supplied by the client (navy blue +
green mark, circular badge with a cross/heartbeat/hand motif, serif
"WATERFORD" wordmark + "WALK-IN CLINIC" tagline) — lives at `public/logo.png`
(transparent bg) with `public/logo-source.jpg` kept as the original archive.
Site palette is derived from the real logo colours: navy `#003A6C`
(dominant) and green `#20712F` (accent) — note the CSS custom properties
in `src/styles/global.css` are still named `--green-*` from an earlier
placeholder teal palette and have NOT yet been re-derived from these true
logo colours; that's an open follow-up, not a decision to revisit the names.
Irish Medical Council registration: Registered Doctor 430944 (shown in the
footer). No social media accounts confirmed yet (footer icons are
placeholder `#` links).

## Evidence on Hand
**No real photography of the clinic or team, and none is planned** — stock
imagery (Unsplash, verified to actually load before being added, never
copied from the previous client this platform was forked from) is the
long-term visual strategy, not a placeholder awaiting real photos. Choose
and treat stock images accordingly — worth getting genuinely right, not
provisional.

No patient testimonials or usage statistics exist for this clinic. The
platform this was forked from (a different clinic, "Walk In GP") shipped
real named patient reviews and real stats ("15+ years", "7.8k patients") —
those belonged to that business and a different named doctor, and were
deliberately stripped rather than reused. `testimonials` and `stats` in
`src/data/siteData.js` are intentionally empty arrays; the sections that
render them hide themselves when empty. Do not populate either with
invented content.

## Product Principles
- Never fabricate a fact the client hasn't confirmed (address, hours, fee,
  medical-card policy, testimonials, stats, social links) — hide the UI
  element rather than show a placeholder value, and never let a
  placeholder string reach a patient-facing surface like the confirmation
  email (this happened once already and was a real incident, not a
  hypothetical risk).
- Lead with speed/convenience; out-of-hours availability supports that
  claim, it doesn't replace it.
- Single-location simplicity — resist reintroducing multi-clinic UI
  patterns (location pickers, per-clinic filters) inherited from the
  platform's original two-clinic design.
- Real brand assets (logo, IMC number, palette) take precedence over
  inherited platform defaults the moment they're confirmed — several were
  found and fixed reactively during build (colours, hardcoded hours,
  invisible button text) rather than audited proactively; treat the
  inherited codebase as a template to verify, not a finished product.

## Accessibility & Inclusion
No client-specified accessibility requirement beyond ordinary WCAG-conscious
practice already present in the inherited platform (44px touch targets,
aria labelling on interactive controls, reduced-motion support).
