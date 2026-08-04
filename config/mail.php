<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Mailer
    |--------------------------------------------------------------------------
    | This controls which mailer is used by default. Options: smtp, ses,
    | mailgun, postmark, sendmail, log, array, and any custom mailers.
    |
    | Defaults to "log" so the app never crashes trying to send mail. To send
    | real email, set MAIL_MAILER=smtp (or ses/mailgun/postmark) plus the
    | matching credentials in your .env / Laravel Cloud environment.
    */

    'default' => env('MAIL_MAILER', 'log'),

    /*
    |--------------------------------------------------------------------------
    | Mailer Configurations
    */

    'mailers' => [

        'smtp' => [
            'transport'    => 'smtp',
            'url'          => env('MAIL_URL'),
            'host'         => env('MAIL_HOST', '127.0.0.1'),
            'port'         => env('MAIL_PORT', 587),
            'encryption'   => env('MAIL_ENCRYPTION', 'tls'),
            'username'     => env('MAIL_USERNAME'),
            'password'     => env('MAIL_PASSWORD'),
            'timeout'      => null,
            'local_domain' => env('MAIL_EHLO_DOMAIN', parse_url(env('APP_URL', 'http://localhost'), PHP_URL_HOST)),
        ],

        'ses' => [
            'transport' => 'ses',
        ],

        'mailgun' => [
            'transport'  => 'mailgun',
            // 'client' => ['timeout' => 60],
        ],

        'postmark' => [
            'transport'  => 'postmark',
            // 'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
        ],

        'sendmail' => [
            'transport' => 'sendmail',
            'path'      => env('MAIL_SENDMAIL_PATH', '/usr/sbin/sendmail -bs -t'),
        ],

        'log' => [
            'transport' => 'log',
            'channel'   => env('MAIL_LOG_CHANNEL'),
        ],

        'array' => [
            'transport' => 'array',
        ],

        'failover' => [
            'transport' => 'failover',
            'mailers'   => explode(',', env('MAIL_FAILOVER_MAILERS', 'smtp,log')),
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Global "From" Address
    | Used on all outgoing messages unless the mailable overrides it.
    */

    'from' => [
        'address' => env('MAIL_FROM_ADDRESS', 'info@waterfordclinic.ie'),
        'name'    => env('MAIL_FROM_NAME', env('APP_NAME', 'Waterford Walk In Clinic')),
    ],

];
