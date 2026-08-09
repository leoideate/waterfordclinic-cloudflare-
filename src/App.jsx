import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ClinicProvider } from './context/ClinicContext.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Booking from './components/Booking.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import { StatsStrip, Services, WhyUs, Testimonials, FAQ } from './components/Sections.jsx'
import ServiceLanding from './pages/ServiceLanding.jsx'
import ServicesHub from './pages/ServicesHub.jsx'
import { servicePages } from './data/siteData.js'

// Lazy-loaded: the admin dashboard (~1,700 lines) has no reason to ship in
// the bundle every public visitor downloads (PageSpeed flagged unused JS,
// Aug 2026 audit). Safe for prerendering — scripts/prerender.js only ever
// renders public routes, so this route's element is never touched at
// build time and can't cause an SSR suspense issue.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

/** The public marketing site — exactly as before, untouched. */
function PublicSite() {
  return (
    <ClinicProvider>
      <Header />
      <main>
        <Hero />
        <StatsStrip />
        <Services />
        <Booking />
        <WhyUs />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </ClinicProvider>
  )
}

/** Route table — shared between the client (BrowserRouter) and the
 *  build-time SSR entry (StaticRouter), so both render identical markup. */
export function AppRoutes() {
  return (
    <Routes>
      {/* Admin SPA — own router, layout, auth. Lazy-loaded, see import above. */}
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={null}>
            <AdminApp />
          </Suspense>
        }
      />

      {/* Services hub — replaces the old redirect-to-homepage; a genuine
          page linking out to each dedicated service page below. */}
      <Route path="/services" element={<ServicesHub />} />

      {/* Dedicated service/keyword landing pages (SEO audit P1, Aug 2026) —
          generated from siteData.js so adding a 6th page needs no route
          change here, only a new servicePages entry + prerender/Laravel
          allow-list updates (see scripts/prerender.js, routes/web.php). */}
      {servicePages.map((page) => (
        <Route key={page.slug} path={`/${page.slug}`} element={<ServiceLanding page={page} />} />
      ))}

      {/* Public site (all other paths) */}
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
