import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ClinicProvider } from './context/ClinicContext.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Booking from './components/Booking.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import { StatsStrip, Services, WhyUs, Testimonials, FAQ } from './components/Sections.jsx'
import AdminApp from './admin/AdminApp.jsx'

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
      {/* Admin SPA — own router, layout, auth */}
      <Route path="/admin/*" element={<AdminApp />} />

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
