<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\Clinic;
use App\Models\ClinicBookingSettings;
use App\Models\ClinicSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Manages a clinic's editable details, its 7-day schedule (incl. Sunday toggle),
 * and the booking on/off + message settings.
 */
class AdminClinicController extends Controller
{
    /** GET /admin/clinics — list with schedule + settings included. */
    public function index(): JsonResponse
    {
        $clinics = Clinic::orderBy('name')->get()->map(fn (Clinic $c) => $this->present($c));
        return response()->json(['data' => $clinics]);
    }

    /** GET /admin/clinics/{clinic} */
    public function show(Clinic $clinic): JsonResponse
    {
        return response()->json(['data' => $this->present($clinic)]);
    }

    /** PUT /admin/clinics/{clinic} — name/address/phone/etc */
    public function update(Request $request, Clinic $clinic): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['sometimes', 'string', 'max:120'],
            'full_name'=> ['sometimes', 'string', 'max:160'],
            'county'   => ['sometimes', 'nullable', 'string', 'max:80'],
            'tagline'  => ['sometimes', 'nullable', 'string', 'max:160'],
            'address'  => ['sometimes', 'string', 'max:300'],
            'phone'    => ['sometimes', 'string', 'max:40'],
            'email'    => ['sometimes', 'email', 'max:150'],
            'hours'    => ['sometimes', 'array'],
        ]);
        $clinic->update($data);
        AdminActivityLog::record('clinic.update', ['fields' => array_keys($data)], $clinic);
        return response()->json(['data' => $this->present($clinic->fresh())]);
    }

    /** PUT /admin/clinics/{clinic}/schedule — replace the 7 weekday rows. */
    public function updateSchedule(Request $request, Clinic $clinic): JsonResponse
    {
        $data = $request->validate([
            'schedule'                   => ['required', 'array', 'size:7'],
            'schedule.*.weekday'         => ['required', 'integer', 'between:0,6'],
            'schedule.*.is_open'         => ['required', 'boolean'],
            'schedule.*.open_time'       => ['required', 'date_format:H:i'],
            'schedule.*.close_time'      => ['required', 'date_format:H:i'],
            'schedule.*.slot_minutes'    => ['required', 'integer', 'between:5,240'],
            'schedule.*.max_per_slot'    => ['required', 'integer', 'between:1,20'],
        ]);

        foreach ($data['schedule'] as $row) {
            ClinicSchedule::updateOrCreate(
                ['clinic_id' => $clinic->id, 'weekday' => $row['weekday']],
                [
                    'is_open'      => $row['is_open'],
                    'open_time'    => $row['open_time'],
                    'close_time'   => $row['close_time'],
                    'slot_minutes' => $row['slot_minutes'],
                    'max_per_slot' => $row['max_per_slot'],
                ]
            );
        }
        AdminActivityLog::record('clinic.schedule.update', [], $clinic);
        return response()->json(['data' => $this->present($clinic->fresh())]);
    }

    /** PUT /admin/clinics/{clinic}/booking — enable/disable + messages */
    public function updateBooking(Request $request, Clinic $clinic): JsonResponse
    {
        $data = $request->validate([
            'bookings_enabled'    => ['required', 'boolean'],
            'confirmation_message'=> ['sometimes', 'nullable', 'string', 'max:1000'],
            'unavailable_message' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'notification_email'  => ['sometimes', 'nullable', 'email', 'max:150'],
        ]);
        $settings = ClinicBookingSettings::updateOrCreate(['clinic_id' => $clinic->id], $data);
        AdminActivityLog::record('clinic.booking.update', $data, $clinic);
        return response()->json(['data' => $settings]);
    }

    private function present(Clinic $c): array
    {
        $schedule = ClinicSchedule::where('clinic_id', $c->id)
            ->orderBy('weekday')->get()->keyBy('weekday');

        // Always return 7 rows (default closed Sunday) so the admin UI is stable.
        $rows = [];
        for ($w = 0; $w <= 6; $w++) {
            $row = $schedule->get($w);
            $rows[] = [
                'weekday'      => $w,
                'weekday_name' => ClinicSchedule::WEEKDAYS[$w],
                'is_open'      => $row?->is_open ?? ($w !== 0),
                'open_time'    => $row ? substr((string) $row->open_time, 0, 5) : '08:00',
                'close_time'   => $row ? substr((string) $row->close_time, 0, 5) : '19:00',
                'slot_minutes' => $row?->slot_minutes ?? 30,
                'max_per_slot' => $row?->max_per_slot ?? 1,
            ];
        }

        $settings = ClinicBookingSettings::firstOrCreate(
            ['clinic_id' => $c->id],
            ['bookings_enabled' => true]
        );

        return [
            'id' => $c->id,
            'slug' => $c->slug,
            'name' => $c->name,
            'full_name' => $c->full_name,
            'county' => $c->county,
            'tagline' => $c->tagline,
            'address' => $c->address,
            'phone' => $c->phone,
            'email' => $c->email,
            'hours' => $c->hours,
            'is_active' => $c->is_active,
            'schedule' => $rows,
            'settings' => $settings,
        ];
    }
}
