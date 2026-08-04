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
| Standalone SEO landing pages
|--------------------------------------------------------------------------
| The previous client registered one server-rendered HTML page per clinic
| location here, so Google got real crawlable content per location instead
| of the SPA shell. Waterford Walk In Clinic is a single site, so there are no
| location pages — the homepage IS the location page.
|
| If topic landing pages are added later (e.g. /minor-injuries or
| /sick-certificates to match service-level ad groups), register them here
| BEFORE the SPA catch-all below, and add them to public/sitemap.xml.
*/

/*
|--------------------------------------------------------------------------
| SPA catch-all — serve the built React frontend
|--------------------------------------------------------------------------
| Any GET request that isn't an API route (/api/*), a static asset
| (/build/*, /favicon.png, etc., served directly by nginx), or /up is
| handed to the React SPA. React Router then takes over client-side.
|
| The frontend is built into public/build/index.html by `npm run build`.
| If that file is missing we show a clear "build the frontend" message
| instead of a confusing 404 — helpful on first deploy / CI debugging.
|
| IMPORTANT: routes/api.php is loaded BEFORE this file, so /api/* still
| reaches the Laravel API controllers and is NOT swallowed here.
*/
Route::get('/{any}', function (string $any = '') {
    // Only the SPA root and everything under /admin are real routes — the
    // rest of the public site navigates via #anchors on the homepage.
    // Anything else is a broken/unknown URL and must return a real 404,
    // not a soft-404 copy of the homepage (which confuses Google's indexer
    // and can surface old dead links as "duplicate content").
    if ($any !== '' && ! str_starts_with($any, 'admin')) {
        abort(404);
    }

    $path = public_path('build/index.html');

    if (! file_exists($path)) {
        return response(
            'Frontend not built. Run "npm ci && npm run build" then redeploy.',
            503
        );
    }

    // IMPORTANT: never let the browser cache index.html. The hashed JS/CSS
    // assets in /build/assets/* ARE cacheable (their filename changes on
    // every build), but index.html references them by name — if a browser
    // caches the HTML, it will keep loading the OLD bundle forever, even
    // after a new deploy. This caused "stale admin pages" bugs in production.
    //
    // Use response() with explicit content + headers (response()->file()
    // sometimes breaks when chained with ->header() in some Laravel versions).
    return response(file_get_contents($path), 200, [
        'Content-Type'  => 'text/html; charset=UTF-8',
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
    ]);
})->where('any', '.*')->name('spa');
