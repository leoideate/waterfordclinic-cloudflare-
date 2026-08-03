import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
