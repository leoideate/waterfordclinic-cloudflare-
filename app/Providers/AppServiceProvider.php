<?php

namespace App\Providers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * Laravel Cloud (and most modern hosts) terminate TLS at a load
     * balancer / proxy, so the app sees HTTP. We trust proxies and force
     * HTTPS in production so Sanctum cookies, generated asset URLs, and
     * OAuth-style redirects all use the secure scheme the browser sees.
     */
    public function boot(): void
    {
        // Trust ALL proxies. Safe behind Cloud's load balancer; harmless
        // on a bare VPS. Required for correct scheme detection on Cloud.
        Request::setTrustedProxies(
            ['0.0.0.0/0', '::/0'],
            Request::HEADER_X_FORWARDED_FOR |
            Request::HEADER_X_FORWARDED_HOST |
            Request::HEADER_X_FORWARDED_PORT |
            Request::HEADER_X_FORWARDED_PROTO |
            Request::HEADER_X_FORWARDED_PREFIX |
            Request::HEADER_X_FORWARDED_AWS_ELB
        );

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
