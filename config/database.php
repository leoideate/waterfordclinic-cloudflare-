<?php

use Illuminate\Support\Str;

return [

    'default' => env('DB_CONNECTION', 'sqlite'),

    'connections' => [

        'sqlite' => [
            'driver' => 'sqlite',
            'url' => env('DB_URL'),
            // Resolve relative/short names (e.g. "database.sqlite") under
            // database/, so PDO always gets an absolute path it can open.
            // Also AUTO-CREATE the file if missing — a missing SQLite file
            // would otherwise crash every query with a 500. This keeps the
            // app bootable even before `php artisan migrate` is run.
            'database' => (function () {
                $value = env('DB_DATABASE', database_path('database.sqlite'));
                if ($value === ':memory:') return $value;

                // Normalise to an absolute path
                if (DIRECTORY_SEPARATOR !== '/') {
                    $value = str_replace('\\', '/', $value);
                }
                $isAbsolute = str_starts_with($value, '/');
                $path = $isAbsolute ? $value : database_path($value);

                // Auto-touch so PDO never hits "file not found"
                if (! file_exists($path)) {
                    @touch($path);   // best-effort; ignore permissions errors
                }
                return $path;
            })(),
            'prefix' => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
        ],

        'mysql' => [
            'driver' => 'mysql',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'twl_clinic'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'pgsql' => [
            'driver' => 'pgsql',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            // Was copy-pasted from the mysql block above (3306) - Postgres's real default.
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'twl_clinic'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => 'public',
            // 'prefer' silently falls back to plaintext if TLS negotiation fails - not
            // acceptable for a production DB reached over the public internet.
            'sslmode' => 'require',
        ],

        // Cloudflare D1, reached over its REST API (not a Worker binding -
        // this app runs as a PHP process in a Container, which has no
        // access to Workers-runtime-only bindings like a `d1_databases`
        // binding or Hyperdrive). D1 has no interactive transaction support
        // over HTTP - only an atomic batch() primitive requiring every
        // statement prepared upfront - so transaction_mode is set to
        // 'exception' rather than the package default 'silent': any future
        // code that assumes DB::transaction() gives real atomicity fails
        // loudly at the point of use instead of silently losing it.
        'd1' => [
            'driver' => 'd1',
            'd1_driver' => 'rest',
            'prefix' => '',
            'database' => env('CF_D1_DATABASE_ID', ''),
            'auth' => [
                'token' => env('CF_D1_API_TOKEN', ''),
                'account_id' => env('CF_D1_ACCOUNT_ID', ''),
            ],
            'timeout' => env('CF_D1_TIMEOUT', 10),
            'retries' => env('CF_D1_RETRIES', 2),
            'transaction_mode' => 'exception',
            'circuit_breaker' => [
                'enabled' => true,
                // Deliberately NOT 'database' (D1 itself) - detecting "is
                // D1 down" by querying D1 would be circular. File-backed
                // circuit-breaker state losing continuity on a container
                // restart is self-healing, not a reliability regression.
                'cache_driver' => 'file',
            ],
        ],
    ],

    'migrations' => [
        'table' => 'migrations',
        'update_date_on_publish' => true,
    ],

    'redis' => [
        'client' => env('REDIS_CLIENT', 'phpredis'),
        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
        ],
        'default' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],
        'cache' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),
        ],
    ],
];
