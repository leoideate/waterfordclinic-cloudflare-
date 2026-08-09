<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Health check (used by Laravel Cloud + uptime monitors)
|--------------------------------------------------------------------------
*/
Route::get('/up', fn () => response('OK'))->name('up');

/*
|--------------------------------------------------------------------------
| SPA catch-all — serve the built React frontend
|--------------------------------------------------------------------------
| Any GET request that isn't an API route (/api/*), a static asset
| (/build/*, /favicon.png, etc., served directly by nginx), or /up is
| handed to the React SPA. React Router then takes over client-side.
|
| $spaPages maps each real URL to ITS OWN prerendered HTML file (see
| scripts/prerender.js) — the dedicated service/keyword landing pages each
| get a file with a real <title>/description/canonical, not a copy of the
| homepage's, which would defeat the point of building them separately.
| Adding a 6th page needs an entry here AND in src/data/siteData.js's
| servicePages AND public/sitemap.xml — three places, on purpose, so a
| missing one fails loudly (404 or wrong metadata) rather than silently.
|
| If a file is missing we show a clear "build the frontend" message
| instead of a confusing 404 — helpful on first deploy / CI debugging.
|
| IMPORTANT: routes/api.php is loaded BEFORE this file, so /api/* still
| reaches the Laravel API controllers and is NOT swallowed here.
*/
Route::get('/{any}', function (string $any = '') {
    if (str_starts_with($any, 'admin')) {
        $file = 'index.html';
    } else {
        // Only the SPA root and known SPA pages/deep-links are real routes
        // — the rest of the public site navigates via #anchors on the
        // homepage. Anything else is a broken/unknown URL and must return
        // a real 404, not a soft-404 copy of the homepage (which confuses
        // Google's indexer and can surface old dead links as "duplicate
        // content").
        $spaPages = [
            '' => 'index.html',
            // Booking deep-link (Google Ads landing URL). Not a keyword
            // target, so it reuses the homepage's prerendered file — React
            // Router + ClinicContext's setBookingOpenFor open the form
            // client-side once the SPA shell loads.
            'appointment' => 'index.html',
            // Services hub — was a 301 to /#services (still indexed from
            // the old WordPress site, per SEO audit Aug 2026), but a
            // redirect to a homepage anchor isn't distinct content either.
            // Now a real page with its own prerendered file, linking out
            // to each dedicated service page below.
            'services' => 'services.html',
            // Dedicated keyword-targeted landing pages (SEO audit P1, Aug
            // 2026) — each has its own prerendered file.
            'walk-in-doctor' => 'walk-in-doctor.html',
            'minor-injuries' => 'minor-injuries.html',
            'womens-health' => 'womens-health.html',
            'blood-tests' => 'blood-tests.html',
            'sick-certificates' => 'sick-certificates.html',
        ];

        $normalized = rtrim($any, '/');
        if (! array_key_exists($normalized, $spaPages)) {
            abort(404);
        }

        $file = $spaPages[$normalized];
    }

    $path = public_path('build/' . $file);

    if (! file_exists($path)) {
        return response(
            'Frontend not built. Run "npm ci && npm run build" then redeploy.',
            503
        );
    }

    // IMPORTANT: never let the browser cache these HTML files. The hashed
    // JS/CSS assets in /build/assets/* ARE cacheable (their filename
    // changes on every build), but these HTML files reference them by
    // name — if a browser caches the HTML, it will keep loading the OLD
    // bundle forever, even after a new deploy. This caused "stale admin
    // pages" bugs in production.
    //
    // Use response() with explicit content + headers (response()->file()
    // sometimes breaks when chained with ->header() in some Laravel versions).
    return response(file_get_contents($path), 200, [
        'Content-Type'  => 'text/html; charset=UTF-8',
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
    ]);
})->where('any', '.*')->name('spa');
