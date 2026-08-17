# syntax=docker/dockerfile:1

# --- Stage 1: frontend build (Node only ever exists in this stage) ---
FROM node:20-bookworm AS frontend
WORKDIR /app
COPY package.json package-lock.json vite.config.js index.html ./
COPY src ./src
COPY scripts ./scripts
RUN npm ci
RUN npm run build
# -> produces public/build/*.html and public/build/assets/*

# --- Stage 2: PHP dependencies ---
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist
COPY . .
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative

# --- Stage 3: runtime ---
# Classic (non-worker) mode: no `worker` directive is configured anywhere
# below, so FrankenPHP boots Laravel fresh per request, same as PHP-FPM -
# deliberately not Octane/worker-mode, to avoid the stale-cross-request-state
# risk class that mode carries. SERVER_ROOT defaults to `public/`, which
# already matches Laravel's structure with zero custom Caddyfile needed.
FROM dunglas/frankenphp:1-php8.2-bookworm AS runtime

RUN install-php-extensions \
    pdo_pgsql \
    pgsql \
    opcache \
    intl \
    zip \
    bcmath

WORKDIR /app

COPY --from=vendor /app /app
COPY --from=frontend /app/public/build /app/public/build

# Routes and views don't depend on env() values, so they're safe to bake at
# build time. config:cache is NOT run here on purpose - config/*.php pulls
# in secrets (APP_KEY, DB_PASSWORD, MAIL_PASSWORD) via env(), which aren't
# available during a build that happens before Cloudflare injects them, and
# even if they were, baking secrets into an image layer is worth avoiding
# regardless. config:cache instead runs once per container start, in
# docker-entrypoint.sh below, using whatever real secrets are present then.
RUN php artisan route:cache \
    && php artisan view:cache

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV SERVER_NAME=:80
EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]

# Setting a new ENTRYPOINT above silently clears the CMD inherited from the
# base image (confirmed via `docker inspect` after a real build - it baked
# to CMD=[] instead of carrying forward the base image's own default).
# These are the base image's real default args (`docker inspect
# dunglas/frankenphp:1-php8.2-bookworm`) - they must be declared explicitly
# here or docker-entrypoint.sh's "$@" is empty, docker-php-entrypoint gets
# no arguments, and the container exits cleanly right after config:cache
# with no error and no HTTP listener ever starting.
CMD ["--config", "/etc/frankenphp/Caddyfile", "--adapter", "caddyfile"]
