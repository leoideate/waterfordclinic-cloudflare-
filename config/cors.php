<?php

return [

    // Paths allowed to be served via CORS. We expose the whole API.
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Admin CRUD uses PUT/PATCH/DELETE too — allow all methods.
    'allowed_methods' => ['*'],

    // Allow the React dev server (Vite) and any production same-origin deploy.
    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    'allowed_origins_patterns' => [],

    // Forward Authorization, Content-Type, X-Requested-With (used by Sanctum/AJAX).
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
