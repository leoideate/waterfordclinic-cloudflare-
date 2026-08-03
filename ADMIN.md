# 🛠️ Walk In GP — Admin Dashboard Guide

A full admin CMS for managing appointments, clinic availability, break times, holidays, temporary closures, admin users, and settings — all of which **directly control the public booking form**.

> URL: **http://localhost:5173/admin** (dev) or `/admin` on your live domain.
> Default login: **`admin`** / **`ChangeMe123!`** — ⚠️ change this before going live (Admin Users → Change your password).

---

## 🚀 Setup

**The database ships pre-built** (`backend/database/database.sqlite`) — all 12 tables + seed data are already in the file. No MySQL or external DB required.

**Easiest:** from `backend/`, double-click `setup.bat` (Windows) or run `bash setup.sh`. The setup script never wipes existing data; it only builds the DB if it's missing.

Or manually. From the project root:

```bash
# 1. Backend (DB is already built, just need deps + server)
cd backend
composer install                  # installs Sanctum (if PHP available)
cp .env.example .env              # (if not already done)
php artisan key:generate
php artisan serve                 # http://127.0.0.1:8000

# 2. Frontend (in another terminal, from project root)
npm install
npm run dev                       # http://localhost:5173
```

**No PHP available?** The DB can be (re)built with Python:
```bash
cd backend
python database/build_db.py            # build (won't overwrite existing data)
python database/build_db.py --force    # rebuild from scratch
```

Open **http://localhost:5173/admin** and sign in with **`admin` / `ChangeMe123!`**.

### If you see "Database file is missing" or a 500 on login
- File missing → run `setup.bat` / `setup.sh` (or `python database/build_db.py`).
- File present but no tables → run `php artisan migrate --seed`.
The login page detects this automatically and shows the right fix. You can also check `GET /api/admin/health` directly.

> ⚠️ Change the default password immediately in *Admin Users → Change your password*.

---

## 🗂️ Admin sections

### 📊 Dashboard
- New/active appointments today, counts by status.
- Live booking status per clinic (Open / Disabled).
- Next 10 upcoming appointments across both clinics.

### 🗓️ Appointments
- **Search** by patient name, phone, email, or reference.
- **Filter** by clinic, status, and date range.
- Click **View** on any row → side drawer with full details:
  - Patient contact, DOB, existing-patient status, submitted time.
  - Patient notes + internal **admin notes** (editable inline).
  - **Status buttons**: Confirm ✓ · Mark completed · No-show · Cancel appointment.
- **Export CSV** — downloads the filtered set (max 5000 rows).

Statuses: `New` → `Confirmed` → `Completed` (or `Cancelled` / `No-show`).

### 🕐 Availability
Two controls per clinic:
1. **Booking on/off** — master switch. When off, the public form shows the clinic's unavailable message.
2. **Weekly schedule** — a table for Mon–Sun with: open/closed toggle, open/close times, slot duration (15/20/30/45/60 min), max appointments per slot.
   - **Sunday row** = the "Enable Sunday bookings" control. Toggle `is_open` on to allow Sundays (only the admin-approved Sunday slots then appear).

### ☕ Break Times
Add doctor/staff breaks that block specific slots. Each break has:
- Clinic (or both)
- **Weekly** (pick weekday) or **Once** (pick date)
- Start/end time
- Reason: Lunch / Doctor unavailable / Emergency / Staff meeting / Training / Custom
- Optional notes

During a break, the affected time slots disappear from the public form.

### 📅 Holidays / Closures
Block public holidays or any closure date:
- Name + date
- Clinic affected: Both / Tullamore / Kildare
- **Full day** or **specific time window**
- Optional notes

When blocked, the public form rejects that date for the affected clinic(s).

### 🚧 Temporary Closures
Ad-hoc closures for full days, half days, custom date ranges, or specific time windows:
- Clinic (or both)
- Start date + optional end date (range)
- Full day(s) or specific time window
- Reason + internal notes

Examples this handles: *"Tullamore closed 12 Aug 1pm–3pm"*, *"Kildare closed Friday 9am–12pm"*, *"Both clinics closed on a public holiday"*, *"Doctor unavailable 2:30pm–4pm"*.

During a closure, slots are hidden and a booked slot returns:
> *"Appointments are not available during this time. Please select another time."*

### 👥 Admin Users
- **Change your password** (requires current password; min 8 chars with upper/lower/number/special).
- **Add another admin** (name, email, optional username, temporary password).
- **Disable/enable** other admins (can't disable yourself or the last active admin).

Passwords are bcrypt-hashed in the database — never stored in plain text.

### ⚙️ Settings
Two tabs:
- **Global defaults**: default slot duration, default confirmation/unavailable messages, admin notification email.
- **Clinic details**: per-clinic name, address, phone, email, notification email (where new bookings are sent), and per-clinic confirmation/unavailable messages.

---

## 🔗 How admin settings affect the public form

The public booking form calls `GET /api/availability?clinic=…&date=…` whenever the patient picks a clinic or date. The backend `AvailabilityService` applies this **order of precedence** (first match wins):

| # | Rule | Effect on the form |
|---|---|---|
| 1 | Clinic bookings disabled | Whole day unavailable — shows the clinic's unavailable message |
| 2 | Holiday (full day) | Whole day unavailable — "Closed for {holiday name}." |
| 2b | Holiday (time window) | That time window is hidden from the slot list |
| 3 | Temporary closure (full day) | Whole day unavailable |
| 3b | Temporary closure (time window) | That time window is hidden |
| 4 | Weekday schedule (Sun = closed) | If `is_open=false`, no slots for that day |
| 5 | Generate base slots | From open/close/`slot_minutes` |
| 6 | Subtract break times | Break slots are hidden |
| 7 | Capacity check | Slots with `≥ max_per_slot` active bookings are hidden |

The same service **re-validates server-side** when the form is submitted (`POST /api/appointments`), so forged requests or race conditions can't sneak a slot through. A rejected slot returns:
> *"Appointments are not available during this time. Please select another time."*

If the backend is unreachable, the form falls back to the static slot list (demo mode) — it never breaks.

---

## 🔄 API reference (admin)

All under `/api/admin`, protected by Sanctum cookie + `admin` middleware. Base URL: `http://127.0.0.1:8000`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/admin/login` | `{email_or_username, password}` → sets session cookie |
| POST | `/admin/logout` | Clear session |
| GET | `/admin/me` | Current user (401 if not logged in) |
| GET | `/admin/dashboard` | Summary counts |
| GET | `/admin/appointments?search=&clinic=&status=&from=&to=&page=` | List + search + filter |
| GET | `/admin/appointments/{id}` | Detail |
| PUT | `/admin/appointments/{id}` | Edit fields / admin_notes |
| PATCH | `/admin/appointments/{id}/status` | `{status}` |
| GET | `/admin/appointments/export?clinic=&status=&from=&to=` | CSV download |
| GET | `/admin/clinics` | List with schedule + settings |
| PUT | `/admin/clinics/{id}` | Update clinic details |
| PUT | `/admin/clinics/{id}/schedule` | `{schedule: [{weekday,is_open,open_time,close_time,slot_minutes,max_per_slot} x7]}` |
| PUT | `/admin/clinics/{id}/booking` | `{bookings_enabled, confirmation_message, unavailable_message, notification_email}` |
| GET/POST/PUT/DELETE | `/admin/break-times[/{id}]` | CRUD |
| GET/POST/PUT/DELETE | `/admin/holidays[/{id}]` | CRUD |
| GET/POST/PUT/DELETE | `/admin/temporary-closures[/{id}]` | CRUD |
| GET/POST | `/admin/users` | List / add |
| PUT/PATCH/DELETE | `/admin/users/{id}` (+ `/password`) | Update / change password / disable |
| GET/PUT | `/admin/settings` | Global defaults |

### Public (no auth)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/availability?clinic=&date=` | Slot list for the form |
| POST | `/api/appointments` | Create booking (server-validated against availability) |
| GET | `/api/clinics` | List active clinics |

---

## 🗄️ Database tables (added)

| Table | Purpose |
|---|---|
| `users` | Admin accounts (bcrypt passwords, role, is_active) |
| `clinic_schedules` | Per-clinic, per-weekday open/close/slot/max (Sunday = weekday 0) |
| `clinic_booking_settings` | Per-clinic bookings_enabled + messages + notification_email |
| `break_times` | Weekly/once breaks with reason |
| `holidays` | Public holidays / full-day or time-window closures |
| `temporary_closures` | Ad-hoc date-range + time-window closures |
| `admin_activity_log` | Audit trail of admin mutations |
| `appointments` (extended) | Added `admin_notes`; status default now `new` |

---

## 🛡️ Security notes

- Passwords are **bcrypt-hashed** (Laravel default cast on the `User` model).
- Admin routes are behind **Sanctum cookie auth + `admin` middleware** — public users hitting `/api/admin/*` get 401.
- The frontend `/admin/*` routes redirect to `/admin/login` if not authenticated.
- **Change the default password** before launch (Admin Users → Change your password).
- All mutations are logged to `admin_activity_log` (best-effort — never blocks the operation).
- Email notifications are queued and never block booking creation (failures are logged).

---

## 📧 Email notifications

On every new booking, a queued email is sent to the clinic's `notification_email` (or its base `email` if unset). Configure in `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io     # or your SMTP host
MAIL_PORT=2525
MAIL_USERNAME=…
MAIL_PASSWORD=…
MAIL_FROM_ADDRESS=reception@walkingp.ie
MAIL_FROM_NAME="Walk In GP"
```

For local dev, `MAIL_MAILER=log` writes the email to `storage/logs/laravel.log` — handy for testing without an SMTP server.

---

## 🧱 Architecture (for developers)

- **`AvailabilityService`** (`backend/app/Services/AvailabilityService.php`) is the single source of truth. Both `GET /api/availability` and `AppointmentController@store` use it. Pure, testable, no side effects.
- **Sanctum cookie auth** — the frontend's `credentials: 'include'` (already in `api.js`/`adminApi.js`) carries the session. CSRF cookie is fetched once at login (`getCsrfCookie()`).
- **`react-router-dom`** branches `/admin/*` to `<AdminApp />` (its own `AuthProvider` + nested routes). The public site is untouched.
- **Scalable**: add a clinic by inserting a `clinics` row + seeding its schedule; add an admin via the UI; the rules engine handles them automatically.
