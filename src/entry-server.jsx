import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { AppRoutes } from './App.jsx'

/**
 * Build-time prerender entry (see scripts/prerender.js). Renders the
 * homepage's markup to a string so Google — and any crawler that doesn't
 * execute JavaScript — gets real HTML instead of an empty <div id="root">.
 *
 * NOT used at request time: Laravel serves the resulting static HTML, it
 * doesn't run Node. This only ever runs once, during `npm run build`.
 */
export function render(url) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>
  )
}
