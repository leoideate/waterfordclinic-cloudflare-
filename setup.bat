@echo off
REM =====================================================================
REM  Waterford Walk In Clinic - Backend Setup (SAFE / IDEMPOTENT)
REM
REM  - If the database already exists and has data, it is LEFT UNTOUCHED.
REM    (Existing appointments / settings are never wiped.)
REM  - If the database is missing, it is created. Tries PHP migrations
REM    first; falls back to the Python builder if PHP is not installed.
REM  - migrate:fresh --seed is NEVER run automatically (that's the
REM    destructive "wipe everything" command) - it's noted below as a
REM    manual developer opt-in only.
REM
REM  The database file is committed to the repo, so in most cases this
REM  script just installs dependencies + starts the server.
REM =====================================================================
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================================
echo  Waterford Walk In Clinic - Backend Setup
echo ============================================================
echo.

REM ---- 0. Detect available tools ----
set "HAS_PHP=0"
set "HAS_COMPOSER=0"
set "PY="
where php >nul 2>nul && set "HAS_PHP=1"
where composer >nul 2>nul && set "HAS_COMPOSER=1"
where python >nul 2>nul && set "PY=python"
if "!PY!"=="" (
    where py >nul 2>nul && set "PY=py"
)

REM ---- 1. Composer (if available) ----
if "%HAS_COMPOSER%"=="1" (
    echo [1] Installing PHP dependencies ^(including Sanctum^)...
    call composer install
    if errorlevel 1 ( echo [FAILED] composer install & pause & exit /b 1 )
) else (
    echo [1] Composer not installed - skipping dependency install.
    echo     PHP/Composer are only needed if you want to RUN the server.
)

REM ---- 2. .env ----
echo.
if not exist ".env" (
    echo [2] Creating .env from .env.example...
    copy ".env.example" ".env" >nul
) else (
    echo [2] .env already exists - leaving untouched.
)

REM ---- 3. App key (if PHP available) ----
echo.
if "%HAS_PHP%"=="1" (
    echo [3] Generating application key...
    call php artisan key:generate --ansi >nul 2>nul
) else (
    echo [3] PHP not installed - skipping key:generate.
    echo     Run once after installing PHP: php artisan key:generate
)

REM ---- 4. Database (SAFE: never wipes existing data) ----
echo.
echo [4] Checking database...
if exist "database\database.sqlite" (
    REM File exists - check whether it has data
    if "!PY!"=="" (
        echo     database\database.sqlite exists. Cannot verify contents without Python.
        echo     Assuming it is already configured.
        goto :START_SERVER_PROMPT
    )
    !PY! -c "import sqlite3,sys; c=sqlite3.connect('database/database.sqlite'); cur=c.cursor(); cur.execute(\"SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='users'\"); n=cur.fetchone()[0]; sys.exit(0 if n>0 else 1)" 2>nul
    if errorlevel 1 (
        echo     database\database.sqlite exists but is missing tables. Building schema...
        if "%HAS_PHP%"=="1" (
            call php artisan migrate --seed --force
        ) else (
            !PY! database\build_db.py --force
        )
        if errorlevel 1 ( echo [FAILED] database build & pause & exit /b 1 )
    ) else (
        echo     database\database.sqlite already exists and has tables.
        echo     SKIPPING - existing data preserved.
    )
) else (
    echo     database\database.sqlite not found. Creating it...
    if "%HAS_PHP%"=="1" (
        type nul > "database\database.sqlite"
        call php artisan migrate --seed --force
    ) else if not "!PY!"=="" (
        !PY! database\build_db.py
    ) else (
        echo [FAILED] No PHP and no Python available to create the database.
        echo         Install one of them, or run database\build_db.py manually.
        pause & exit /b 1
    )
    if errorlevel 1 ( echo [FAILED] database create & pause & exit /b 1 )
)

:START_SERVER_PROMPT
echo.
echo ============================================================
echo  Setup complete!
echo ============================================================
echo.
echo  Database:  database\database.sqlite
echo  Admin URL: http://localhost:5173/admin
echo.
echo  Default admin login:
echo    Username: admin
echo    Password: ChangeMe123!
echo.
echo  Start the server with:   php artisan serve
echo  ^(PHP is required to run the Laravel server.^)
echo.
echo  Developer note: to WIPE and rebuild from migrations ^(destroys data^):
echo    php artisan migrate:fresh --seed
echo.
pause
