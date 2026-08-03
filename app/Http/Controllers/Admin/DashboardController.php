<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\ClinicBookingSettings;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /** GET /admin/dashboard — summary counts for the admin home page. */
    public function index(): JsonResponse
    {
        $today = now()->toDateString();

        $newToday = Appointment::whereDate('preferred_date', $today)
            ->whereIn('status', Appointment::ACTIVE_STATUSES)->count();

        $upcoming = Appointment::where('preferred_date', '>=', $today)
            ->whereIn('status', Appointment::ACTIVE_STATUSES)
            ->orderBy('preferred_date')->orderBy('preferred_time')->take(10)->get();

        $byStatus = collect(Appointment::STATUSES)
            ->map(fn ($label, $key) => [
                'status' => $key,
                'label' => $label,
                'count' => Appointment::where('status', $key)->count(),
            ])->values();

        $clinics = Clinic::orderBy('name')->get()->map(fn ($c) => [
            'slug' => $c->slug,
            'name' => $c->name,
            'bookings_enabled' => ClinicBookingSettings::firstOrCreate(
                ['clinic_id' => $c->id], ['bookings_enabled' => true]
            )->bookings_enabled,
            'pending' => Appointment::where('clinic_id', $c->id)
                ->whereIn('status', Appointment::ACTIVE_STATUSES)->count(),
        ]);

        return response()->json([
            'data' => [
                'new_today' => $newToday,
                'by_status' => $byStatus,
                'clinics' => $clinics,
                'upcoming' => $upcoming->map(fn (Appointment $a) => [
                    'id' => $a->id,
                    'reference' => $a->reference,
                    'patient' => $a->full_name,
                    'clinic_id' => $a->clinic_id,
                    'clinic' => $a->clinic?->name,
                    'date' => $a->preferred_date?->toDateString(),
                    'time' => $a->preferred_time ? substr((string) $a->preferred_time, 0, 5) : null,
                    'service' => $a->service,
                    'status' => $a->status,
                ]),
            ],
        ]);
    }
}
