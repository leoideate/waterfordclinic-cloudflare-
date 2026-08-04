<?php

use App\Http\Controllers\Admin\AdminAppointmentController;
use App\Http\Controllers\Admin\AdminClinicController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\BreakTimeController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\HolidayController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\TemporaryClosureController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\ClinicController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| PUBLIC API — Waterford Walk In Clinic booking + availability
|--------------------------------------------------------------------------
*/
Route::get('/clinics', [ClinicController::class, 'index']);

// Availability for the public booking form (no auth).
Route::get('/availability', [AvailabilityController::class, 'show']);

// Appointment booking (public). GET list left available for convenience but
// should be wrapped in admin middleware in production.
Route::prefix('appointments')->group(function () {
    Route::post('/', [AppointmentController::class, 'store'])->name('appointments.store');
    Route::get('/', [AppointmentController::class, 'index'])->name('appointments.index');
    Route::get('/{ref}', [AppointmentController::class, 'show'])->name('appointments.show');
});

/*
|--------------------------------------------------------------------------
| ADMIN AUTH (public routes — login/csrf)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->group(function () {
    Route::get('health', [AuthController::class, 'health']);   // public — DB readiness check

    // login + me + logout need the 'web' middleware group so they have a
    // session store (login calls session()->regenerate(), me reads the
    // session via $request->user()). Without this, they throw
    // "Session store not set on request." on production where statefulApi()
    // does NOT add sessions for the (non-localhost) origin.
    Route::post('login',  [AuthController::class, 'login'])->middleware('web');
    Route::post('logout', [AuthController::class, 'logout'])->middleware('web');
    Route::get('me',      [AuthController::class, 'me'])->middleware('web');
});

/*
|--------------------------------------------------------------------------
| ADMIN API — all protected by Sanctum cookie + admin middleware
|--------------------------------------------------------------------------
*/
Route::prefix('admin')
    ->middleware(['web', 'auth', 'admin'])
    ->name('admin.')
    ->group(function () {

        // Dashboard summary
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Appointments (full CRUD + search + status + CSV export)
        Route::get('/appointments/export', [AdminAppointmentController::class, 'export']);
        Route::get('/appointments', [AdminAppointmentController::class, 'index']);
        Route::get('/appointments/{id}', [AdminAppointmentController::class, 'show'])
            ->whereNumber('id');
        Route::put('/appointments/{id}', [AdminAppointmentController::class, 'update'])
            ->whereNumber('id');
        Route::patch('/appointments/{id}/status', [AdminAppointmentController::class, 'status'])
            ->whereNumber('id');

        // Clinics + schedule + booking toggle
        Route::get('/clinics', [AdminClinicController::class, 'index']);
        Route::get('/clinics/{clinic}', [AdminClinicController::class, 'show']);
        Route::put('/clinics/{clinic}', [AdminClinicController::class, 'update']);
        Route::put('/clinics/{clinic}/schedule', [AdminClinicController::class, 'updateSchedule']);
        Route::put('/clinics/{clinic}/booking', [AdminClinicController::class, 'updateBooking']);

        // Break times
        Route::apiResource('break-times', BreakTimeController::class);

        // Holidays
        Route::apiResource('holidays', HolidayController::class);

        // Temporary closures
        Route::apiResource('temporary-closures', TemporaryClosureController::class);

        // Admin users + password change
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::put('/users/{user}', [AdminUserController::class, 'update'])->whereNumber('user');
        Route::patch('/users/{user}/password', [AdminUserController::class, 'password'])->whereNumber('user');
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->whereNumber('user');

        // Settings
        Route::get('/settings', [SettingsController::class, 'index']);
        Route::put('/settings', [SettingsController::class, 'update']);
    });
