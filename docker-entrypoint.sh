#!/bin/sh
set -e

# config:cache bakes env() values - it must run at container START (with
# real runtime secrets injected by Cloudflare) not at image BUILD time (no
# secrets are available then, and Docker layers shouldn't hold secrets
# anyway). route:cache/view:cache don't depend on env values, so those stay
# baked into the image at build time.
#
# Runs once per container start, not per-request, so this doesn't cost
# anything beyond the first request's latency after a cold start.
php artisan config:cache

exec docker-php-entrypoint "$@"
