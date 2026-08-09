// Injects real server-rendered HTML into the built index.html — and a
// per-page copy for each dedicated service/keyword landing page — so
// crawlers that don't execute JavaScript (and Google's first-pass,
// pre-render crawl) see actual page content, with a genuinely unique
// <title>/description/canonical per URL instead of every route serving
// the homepage's metadata (the entire point of building them as separate
// pages — see SEO audit, Aug 2026).
//
// Runs as the last step of `npm run build`, after both the client bundle
// (vite build) and the SSR bundle (vite build --ssr) exist. The client
// bundle still hydrates normally in the browser — this only changes what's
// in the initial HTML payload, not how the app behaves once JS loads.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { site } from '../src/config/site.js'
import { servicePages } from '../src/data/siteData.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ssrEntry = path.join(root, 'dist-ssr', 'entry-server.js')
const indexPath = path.join(root, 'public', 'build', 'index.html')

// These have to match the literal copy in index.html — title/description
// are hardcoded there, not one of the %TOKEN% fields the siteConfigHtml
// Vite plugin substitutes. If that copy changes, update these too.
const HOMEPAGE_TITLE = 'Waterford Walk In Clinic | Walk-In & Out-of-Hours Care'
const HOMEPAGE_META_DESCRIPTION =
  "Walk-in and out-of-hours medical care in Waterford. Urgent care, minor injuries, women's health and same-day consultations. Book online or just walk in."
const HOMEPAGE_OG_DESCRIPTION =
  "Walk-in and out-of-hours medical care in Waterford. Urgent care, minor injuries, women's health and same-day consultations."
const HOMEPAGE_URL = `${site.domain.replace(/\/$/, '')}/`

function writePage(outPath, template, appHtml, root) {
  if (!appHtml || !template.includes('<div id="root"></div>')) {
    throw new Error(`Prerender produced no markup or root div not found for ${outPath} — skipping injection`)
  }
  const finalHtml = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
  fs.writeFileSync(outPath, finalHtml)
  console.log(`[prerender] Injected ${appHtml.length.toLocaleString()} chars into ${path.relative(root, outPath)}`)
}

try {
  const { render } = await import(`file://${ssrEntry.replace(/\\/g, '/')}`)
  const baseTemplate = fs.readFileSync(indexPath, 'utf-8')

  // ---- Homepage: same file, same metadata, just the root markup ----
  writePage(indexPath, baseTemplate, render('/'), root)

  // ---- Each dedicated landing page gets its own file + its own
  //      title/description/canonical — not a copy of the homepage's. ----
  for (const page of servicePages) {
    const pageUrl = `${site.domain.replace(/\/$/, '')}/${page.slug}`
    const html = baseTemplate
      .replaceAll(HOMEPAGE_TITLE, page.metaTitle)
      .replaceAll(HOMEPAGE_META_DESCRIPTION, page.metaDescription)
      .replaceAll(HOMEPAGE_OG_DESCRIPTION, page.metaDescription)
      .replace(`href="${HOMEPAGE_URL}"`, `href="${pageUrl}"`)
      .replace(`content="${HOMEPAGE_URL}"`, `content="${pageUrl}"`)

    const outPath = path.join(root, 'public', 'build', `${page.slug}.html`)
    writePage(outPath, html, render(`/${page.slug}`), root)
  }
} finally {
  fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true })
}
