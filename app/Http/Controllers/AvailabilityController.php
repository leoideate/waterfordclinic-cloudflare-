<?php

namespace App\Http\Controllers;

use App\Services\AvailabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * PUBLIC endpoint that the booking form calls to populate its time picker.
 * No auth. The same service is also used server-side on store.
 *
 *   GET /api/availability?clinic=tullamore&date=2026-08-12
 */
class AvailabilityController extends Controller
{
    public function __construct(private readonly AvailabilityService $availability)
    {
    }

    public function show(Request $request): JsonResponse
    {
        $data = $request->validate([
            'clinic' => ['required', 'string'],
            'date'   => ['required', 'date'],
        ]);

        try {
            $payload = $this->availability->slotsFor($data['clinic'], $data['date']);
            return response()->json(['data' => $payload]);
        } catch (\Throwable $e) {
            // Never leak a raw 500 to the booking form — return a structured
            // error so the form can fall back to its static slot list.
            logger()->error('Availability lookup failed', [
                'clinic' => $data['clinic'] ?? null,
                'date'   => $data['date'] ?? null,
                'error'  => $e->getMessage(),
            ]);
            return response()->json([
                'data' => [
                    'available'   => false,
                    'reason'      => 'Could not load availability right now. Please call the clinic to book.',
                    'reason_code' => 'lookup_failed',
                    'slots'       => [],
                ],
            ]);
        }
    }
}
