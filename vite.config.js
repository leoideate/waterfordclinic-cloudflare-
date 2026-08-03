import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { site } from './src/config/site.js'

/**
 * Substitutes per-client values into index.html at build (and dev) time.
 *
 * The tracking IDs matter most: if this repo is ever forked again for a
 * THIRD client and someone forgets to edit the hardcoded gtag snippet, that
 * client's page views and booking conversions get silently reported into
 * this client's GA4 and Google Ads accounts. Driving them from site.js
 * makes that mistake impossible to make by omission — an empty ID in
 * site.js means an empty ID in the built HTML, not a leftover real one.
 */
function siteConfigHtml() {
  const tokens = {
    '%SITE_BRAND%': site.brand,
    '%SITE_DOMAIN%': site.domain.replace(/\/$/, ''),
    '%SITE_LANG%': site.lang,
    '%SITE_FAVICON%': site.logo.favicon,
    '%GA4_ID%': site.analytics.ga4MeasurementId,
    '%GOOGLE_ADS_ID%': site.analytics.googleAdsConversionId,
  }
  return {
    name: 'site-config-html',
    transformIndexHtml: {
      // 'pre' matters: Vite resolves href/src as asset URLs and calls
      // decodeURI on them, which throws "URI malformed" on a raw %TOKEN%.
      // Substituting first means Vite only ever sees real paths.
      order: 'pre',
      handler(html) {
        return Object.entries(tokens).reduce(
          (out, [token, value]) => out.replaceAll(token, value),
          html
        )
      },
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), siteConfigHtml()],
  // Assets are served under /build/ in production so they land in
  // Laravel's public/build/ and resolve correctly through nginx.
  base: '/build/',
  build: {
    // Emit the SPA into Laravel's public/build/ subfolder. emptyOutDir
    // only wipes build/, never the rest of public/ (index.php etc.).
    outDir: 'public/build',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
    // Proxy API + Sanctum CSRF requests to the Laravel dev server so the
    // React dev server (5173) can talk to Laravel (8000) without CORS
    // hassle. Start Laravel with `php artisan serve` before relying on this.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})
