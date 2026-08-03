// Injects real server-rendered HTML into the built index.html so crawlers
// that don't execute JavaScript (and Google's first-pass, pre-render crawl)
// see actual page content instead of an empty <div id="root">.
//
// Runs as the last step of `npm run build`, after both the client bundle
// (vite build) and the SSR bundle (vite build --ssr) exist. The client
// bundle still hydrates normally in the browser — this only changes what's
// in the initial HTML payload, not how the app behaves once JS loads.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ssrEntry = path.join(root, 'dist-ssr', 'entry-server.js')
const indexPath = path.join(root, 'public', 'build', 'index.html')

try {
  const { render } = await import(`file://${ssrEntry.replace(/\\/g, '/')}`)
  const template = fs.readFileSync(indexPath, 'utf-8')

  const appHtml = render('/')
  if (!appHtml || !template.includes('<div id="root"></div>')) {
    throw new Error('Prerender produced no markup or index.html root div not found — skipping injection')
  }

  const finalHtml = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
  fs.writeFileSync(indexPath, finalHtml)
  console.log(`[prerender] Injected ${appHtml.length.toLocaleString()} chars of server-rendered HTML into ${path.relative(root, indexPath)}`)
} finally {
  fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true })
}
