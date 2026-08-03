<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // CORS for the React frontend (config/cors.php governs origins).
        $middleware->append(HandleCors::class);

        // Make /api stateful via Sanctum (cookies/sessions for the admin SPA).
        $middleware->statefulApi();

        // All /api/* routes are exempt from CSRF verification.
        //
        // The frontend is a React SPA that talks to the API via fetch with
        // credentials: 'include' but does NOT fetch the Sanctum CSRF cookie
        // before each write. Without this exemption, every POST/PUT/PATCH/
        // DELETE would 419 ("CSRF token mismatch / Page Expired").
        //
        // Security is preserved by other layers:
        //   - Public booking endpoints: server-side validation in
        //     StoreAppointmentRequest + the controller's availability re-check
        //   - Admin endpoints: Sanctum session cookie (set on login) +
        //     'auth' middleware + AdminOnly role check + bcrypt-hashed passwords
        //
        // If you later add a route that genuinely needs CSRF (e.g. a
        // server-rendered Blade form), exclude it individually or restrict
        // this wildcard.
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);

        // Named alias used on the admin route group.
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminOnly::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
