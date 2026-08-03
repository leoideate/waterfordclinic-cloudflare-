#!/usr/bin/env bash
#
# Waterford Clinic - Backend Setup (SAFE / IDEMPOTENT)
#
#  - If the database already exists and has data, it is LEFT UNTOUCHED.
#    (Existing appointments / settings are never wiped.)
#  - If the database is missing, it is created. Tries PHP migrations
#    first; falls back to the Python builder if PHP is not installed.
#  - migrate:fresh --seed is NEVER run automatically (that's the
#    destructive "wipe everything" command) - it's noted below as a
#    manual developer opt-in only.
#
# The database file is committed to the repo, so in most cases this
# script just installs dependencies + starts the server.
#
set -e
cd "$(dirname "$0")"

echo ""
echo "============================================================"
echo " Waterford Clinic - Backend Setup"
echo "============================================================"
echo ""

# ---- 0. Detect available tools ----
HAS_PHP=0
command -v php >/dev/null 2>&1 && HAS_PHP=1
PY=""
command -v python >/dev/null 2>&1 && PY=python
[ -z "$PY" ] && command -v python3 >/dev/null 2>&1 && PY=python3

# ---- 1. Composer (if available) ----
if command -v composer >/dev/null 2>&1; then
    echo "[1] Installing PHP dependencies (including Sanctum)..."
    composer install
else
    echo "[1] Composer not installed - skipping dependency install."
    echo "    PHP/Composer are only needed if you want to RUN the server."
fi

# ---- 2. .env ----
echo ""
if [ ! -f .env ]; then
    echo "[2] Creating .env from .env.example..."
    cp .env.example .env
else
    echo "[2] .env already exists - leaving untouched."
fi

# ---- 3. App key (if PHP available) ----
echo ""
if [ "$HAS_PHP" = "1" ]; then
    echo "[3] Generating application key..."
    php artisan key:generate --ansi
else
    echo "[3] PHP not installed - skipping key:generate."
    echo "    Run once after installing PHP: php artisan key:generate"
fi

# ---- 4. Database (SAFE: never wipes existing data) ----
echo ""
echo "[4] Checking database..."

db_has_tables() {
    # Returns 0 (true) if the DB file exists AND has a users table
    [ -f database/database.sqlite ] || return 1
    [ -n "$PY" ] || return 0   # can't verify without python — assume OK
    "$PY" -c "
import sqlite3, sys
c = sqlite3.connect('database/database.sqlite')
cur = c.cursor()
cur.execute(\"SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='users'\")
sys.exit(0 if cur.fetchone()[0] > 0 else 1)
" >/dev/null 2>&1
}

if db_has_tables; then
    echo "    database/database.sqlite already exists and has tables."
    echo "    SKIPPING - existing data preserved."
elif [ -f database/database.sqlite ]; then
    echo "    database/database.sqlite exists but is missing tables. Building schema..."
    if [ "$HAS_PHP" = "1" ]; then
        php artisan migrate --seed --force
    elif [ -n "$PY" ]; then
        "$PY" database/build_db.py --force
    else
        echo "[FAILED] No PHP and no Python available to build the schema." >&2
        exit 1
    fi
else
    echo "    database/database.sqlite not found. Creating it..."
    if [ "$HAS_PHP" = "1" ]; then
        mkdir -p database
        touch database/database.sqlite
        php artisan migrate --seed --force
    elif [ -n "$PY" ]; then
        "$PY" database/build_db.py
    else
        echo "[FAILED] No PHP and no Python available to create the database." >&2
        echo "        Install one of them, or run database/build_db.py manually." >&2
        exit 1
    fi
fi

echo ""
echo "============================================================"
echo " Setup complete!"
echo "============================================================"
echo ""
echo " Database:  database/database.sqlite"
echo " Admin URL: http://localhost:5173/admin"
echo ""
echo " Default admin login:"
echo "   Username: admin"
echo "   Password: ChangeMe123!"
echo ""
echo " Start the server with:   php artisan serve"
echo " (PHP is required to run the Laravel server.)"
echo ""
echo " Developer note: to WIPE and rebuild from migrations (destroys data):"
echo "   php artisan migrate:fresh --seed"
echo ""
