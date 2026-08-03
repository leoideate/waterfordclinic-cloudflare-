<?php

use Laravel\Sanctum\Sanctum;

return [

    // Stateful domains: the React dev server + whatever APP_URL resolves to.
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:5173,127.0.0.1,127.0.0.1:5173',
        env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),

    // We use the web session guard for the admin SPA (cookie-based).
    'guard' => ['web'],

    // Token expiration — unused for the SPA flow but kept for completeness.
    'expiration' => null,

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),
];
