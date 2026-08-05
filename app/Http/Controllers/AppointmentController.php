<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAppointmentRequest;
use App\Mail\AppointmentConfirmed;
use App\Mail\AppointmentRequested;
use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\ClinicBookingSettings;
use App\Services\AvailabilityService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AppointmentController extends Controller
{
    public function __construct(private readonly AvailabilityService $availability)
    {
    }

    /**
     * POST /api/appointments — create a booking request (public).
     *
     * Validates the payload, then RE-CHECKS availability on the server via
     * AvailabilityService (defends against forged requests, race conditions,
     * and any client-side staleness). Returns 422 with the spec's exact
     * message if the slot can't be booked.
     *
     * The entire DB-touching path is wrapped so the endpoint NEVER returns a
     * bare 500. If the DB isn't ready (tables missing, MySQL unreachable,
     * seeders not run), we return a clear 503 with a developer-friendly
     * message so the React frontend can show a useful error instead of
     * "Something went wrong."
     */
    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            // Defensive clinic lookup — raw exists:clinics,slug in the validator
            // would 500 if the clinics table is empty or unmigrated. This way
            // we return a friendly 422 instead.
            $clinic = Clinic::active()->forSlug($data['clinic'])->first();
            if (! $clinic) {
                return response()->json([
                    'message' => 'Sorry, that clinic is not currently available for online booking.',
                    // Generic on purpose: with one clinic there's nothing to
                    // "choose between" — this only fires if the clinic slug
                    // sent by the form doesn't match a seeded, active clinic.
                    'errors'  => ['clinic' => ['Please refresh the page and try again.']],
                    'reason_code' => 'clinic_not_found',
                ], 422);
            }

            // Server-side availability re-check (the critical guard).
            $check = $this->availability->isSlotBookable($clinic->slug, $data['date'], $data['time']);
            if (! $check['ok']) {
                return response()->json([
                    'message' => $check['reason'],
                    'errors'  => ['time' => [$check['reason']]],
                    'reason_code' => $check['reason_code'],
                ], 422);
            }

            $appt = Appointment::create([
                'clinic_id' => $clinic->id,
                'first_name' => $data['firstName'],
                'last_name' => $data['lastName'],
                'phone' => $data['phone'],
                'email' => $data['email'] ?? null,
                'dob' => $data['dob'] ?? null,
                'address' => $data['address'] ?? null,
                'is_existing_patient' => ($data['isExisting'] ?? null) === 'Yes' ? true : (($data['isExisting'] ?? null) === 'No' ? false : null),
                'service' => $data['service'] ?? null,
                'preferred_date' => $data['date'],
                'preferred_time' => $data['time'],
                'notes' => $data['notes'] ?? null,
                'status' => 'new',
                'source' => 'website',
                'ip_address' => $request->ip(),
            ]);

            // Notify the clinic (queued). Never block on mail — failures are logged.
            $settings = ClinicBookingSettings::firstOrCreate(
                ['clinic_id' => $clinic->id], ['bookings_enabled' => true]
            );
            // notification_email supports a comma-separated list (e.g. clinic
            // owner + reception), falling back to the clinic's main email.
            $to = $settings->notification_email
                ? array_filter(array_map('trim', explode(',', $settings->notification_email)))
                : array_filter([$clinic->email]);
            try {
                if (! empty($to)) {
                    Mail::to($to)->queue(new AppointmentRequested($appt, $clinic->name));
                }
            } catch (\Throwable $e) {
                logger()->warning('Failed to send appointment notification email', [
                    'appointment' => $appt->id, 'error' => $e->getMessage(),
                ]);
            }

            // Send a confirmation email to the PATIENT (only if they provided
            // an email). Branded acknowledgement with reference + €60 / no
            // Medical Card notice. Wrapped in try/catch so mail failure never
            // blocks a successful booking.
            try {
                if (! empty($data['email'])) {
                    Mail::to($data['email'])->queue(
                        new AppointmentConfirmed($appt, $clinic->name, $clinic->phone, $clinic->address ?? '')
                    );
                }
            } catch (\Throwable $e) {
                logger()->warning('Failed to send patient confirmation email', [
                    'appointment' => $appt->id, 'error' => $e->getMessage(),
                ]);
            }

            $confirmation = $settings->confirmation_message
                ?: ClinicBookingSettings::DEFAULT_CONFIRMATION;

            return response()->json([
                'message' => $confirmation,
                'data' => $this->present($appt, $clinic),
            ], 201);

        } catch (QueryException $e) {
            // Almost always: missing/unmigrated tables, or DB unreachable.
            logger()->error('Appointment booking DB error', [
                'error' => $e->getMessage(),
                'sql' => $e->getSql(),
            ]);
            return response()->json([
                'message' => 'Our booking system is being set up and is not ready yet. '
                           . 'Please call the clinic to book, or try again shortly.',
                'reason_code' => 'database_not_configured',
            ], 503);
        } catch (\Throwable $e) {
            logger()->error('Appointment booking failed', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'We could not complete your booking right now. '
                           . 'Please try again, or call the clinic to book.',
                'reason_code' => 'booking_error',
            ], 503);
        }
    }

    /**
     * GET /api/appointments — list bookings.
     * NOTE: protect in production (wrap with admin middleware).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::with('clinic')->latest();

        if ($request->filled('clinic')) {
            $query->whereHas('clinic', fn ($q) => $q->where('slug', $request->string('clinic')));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json([
            'data' => $query->limit(200)->get()->map(fn (Appointment $a) => $this->present($a, $a->clinic)),
        ]);
    }

    /** GET /api/appointments/{ref} — fetch a booking by public reference. */
    public function show(string $ref): JsonResponse
    {
        $appt = Appointment::with('clinic')->where('reference', $ref)->first();
        if (! $appt) {
            return response()->json(['message' => 'Not found.'], 404);
        }
        return response()->json(['data' => $this->present($appt, $appt->clinic)]);
    }

    private function present(Appointment $a, ?Clinic $c): array
    {
        return [
            'reference' => $a->reference,
            'clinic' => $c?->only(['slug', 'name', 'full_name', 'phone', 'email']),
            'firstName' => $a->first_name,
            'lastName' => $a->last_name,
            'phone' => $a->phone,
            'email' => $a->email,
            'service' => $a->service,
            'preferredDate' => optional($a->preferred_date)->toDateString(),
            'preferredTime' => $a->preferred_time ? substr((string) $a->preferred_time, 0, 5) : null,
            'status' => $a->status,
            'createdAt' => $a->created_at?->toIso8601String(),
        ];
    }
}
