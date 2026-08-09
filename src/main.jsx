import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/fonts.css'
import './styles/global.css'
import { trackingConfig } from './config/tracking.js'

/* =====================================================================
   Initialise the GTM dataLayer with config before the app mounts.
   These values are available inside GTM as dataLayer variables, so you
   can e.g. fire GA4/Meta/Ads tags conditionally without hardcoding IDs.
   ===================================================================== */
window.dataLayer = window.dataLayer || []
window.dataLayer.push({
  // 'config' is pushed once at load — read it from GTM as needed
  event: 'config',
  gtm_container_id: trackingConfig.gtmId,
  ga4_measurement_id: trackingConfig.ga4MeasurementId,
  google_ads_conversion_id: trackingConfig.googleAdsConversionId,
  meta_pixel_id: trackingConfig.metaPixelId,
  microsoft_clarity_id: trackingConfig.microsoftClarityId,
  linkedin_partner_id: trackingConfig.linkedinPartnerId,
  tiktok_pixel_id: trackingConfig.tiktokPixelId,
  conversion_linker_enabled: trackingConfig.enableConversionLinker
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
