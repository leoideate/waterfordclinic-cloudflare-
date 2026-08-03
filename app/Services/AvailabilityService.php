<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\BreakTime;
use App\Models\Clinic;
use App\Models\ClinicBookingSettings;
use App\Models\ClinicSchedule;
use App\Models\Holiday;
use App\Models\TemporaryClosure;
use Illuminate\Support\Carbon;

/**
 * =====================================================================
 * The single source of truth for "what slots can a patient book?".
 * =====================================================================
 *
 * One entry point: slotsFor($clinicSlug, $dateYmd).
 * Also exposes isSlotBookable() for the server-side store check.
 *
 * Precedence (first match wins; a slot is shown only if every gate passes):
 *   1. Clinic bookings disabled         → whole day unavailable
 *   2. Holiday (full day or time band)  → whole day or band unavailable
 *   3. Temporary closure (range+window) → whole day or band unavailable
 *   4. Weekday schedule (Sun = closed)  → if closed, no slots
 *   5. Generate base slots from open/close/minutes
 *   6. Subtract weekly + one-off breaks (per time band)
 *   7. Mark slots full (existing appointments ≥ max_per_slot)
 *
 * The result is used by:
 *   - GET /api/availability           (public form populates the time picker)
 *   - AppointmentController@store     (server-side re-validation before insert)
 */
class AvailabilityService
{
    /**
     * Full availability payload for a clinic on a given date.
     *
     * @return array{
     *   available: bool,
     *   reason: ?string,
     *   reason_code: ?string,
     *   weekday: int,
     *   open_time: string|null,
     *   close_time: string|null,
     *   slot_minutes: int,
     *   slots: array<int, array{time:string, label:string, available:bool, reason:?string}>
     * }
     */
    public function slotsFor(string $clinicSlug, string $dateYmd): array
    {
        $clinic = Clinic::where('slug', $clinicSlug)->where('is_active', true)->first();
        $date = Carbon::parse($dateYmd)->startOfDay();
        $weekday = (int) $date->format('w');   // 0 Sun – 6 Sat

        $empty = $this->emptyResult($weekday);

        if (! $clinic) {
            return array_merge($empty, [
                'available' => false,
                'reason' => 'This clinic could not be found.',
                'reason_code' => 'clinic_not_found',
            ]);
        }

        // 1. Master bookings-enabled switch
        $settings = ClinicBookingSettings::firstOrCreate(
            ['clinic_id' => $clinic->id],
            ['bookings_enabled' => true]
        );
        if (! $settings->bookings_enabled) {
            return array_merge($empty, [
                'available' => false,
                'reason' => $settings->unavailable_message
                    ?: ClinicBookingSettings::DEFAULT_UNAVAILABLE,
                'reason_code' => 'bookings_disabled',
            ]);
        }

        // 1.5. Sundays are phone-only — no online slots, regardless of the
        // weekday schedule (clinics are open, but online booking is not).
        if ($weekday === 0) {
            return array_merge($empty, [
                'available' => false,
                'reason' => 'Sunday appointments are by phone only. Please call the clinic to book.',
                'reason_code' => 'sunday_phone_only',
            ]);
        }

        // 2. Holidays — full-day blocks entirely; partial blocks a time band (applied per-slot)
        $holidayBlock = $this->checkHolidays($clinicSlug, $date);
        if ($holidayBlock && $holidayBlock['full_day']) {
            return array_merge($empty, [
                'available' => false,
                'reason' => 'Closed for ' . $holidayBlock['name'] . '.',
                'reason_code' => 'holiday',
            ]);
        }
        $holidayBand = ($holidayBlock && ! $holidayBlock['full_day']) ? $holidayBlock : null;

        // 3. Temporary closures — same logic as holidays
        $closureBlock = $this->checkClosures($clinicSlug, $date);
        if ($closureBlock && $closureBlock['full_day']) {
            return array_merge($empty, [
                'available' => false,
                'reason' => $closureBlock['reason'] ? 'Closed: ' . $closureBlock['reason'] : 'Temporarily closed.',
                'reason_code' => 'closure',
            ]);
        }
        $closureBand = ($closureBlock && ! $closureBlock['full_day']) ? $closureBlock : null;

        // 4. Weekday schedule
        $schedule = ClinicSchedule::where('clinic_id', $clinic->id)
            ->where('weekday', $weekday)
            ->first();

        $open = $schedule?->open_time ? substr((string) $schedule->open_time, 0, 5) : '08:00';
        $close = $schedule?->close_time ? substr((string) $schedule->close_time, 0, 5) : '19:00';
        $minutes = $schedule?->slot_minutes ?: 15;
        $maxPerSlot = $schedule?->max_per_slot ?: 1;

        if (! $schedule || ! $schedule->is_open) {
            return array_merge($empty, [
                'available' => false,
                'reason' => $weekday === 0
                    ? 'Closed on Sundays. Please choose another day.'
                    : 'This clinic is closed on ' . ClinicSchedule::WEEKDAYS[$weekday] . 's.',
                'reason_code' => 'closed_day',
            ]);
        }

        // 5. Base slots
        $slots = $this->generateSlots($open, $close, $minutes);

        // 6. Subtract breaks (weekly + one-off), holiday bands, closure bands
        $breakBands = $this->breakBandsFor($clinic->id, $clinicSlug, $date, $weekday);
        $slotUnavailableMsg = ClinicBookingSettings::DEFAULT_SLOT_UNAVAILABLE;

        foreach ($slots as &$slot) {
            // inside a holiday time band?
            if ($holidayBand && $this->timeWithin($slot['time'], $holidayBand['start'], $holidayBand['end'])) {
                $slot['available'] = false;
                $slot['reason'] = $slotUnavailableMsg;
                continue;
            }
            // inside a closure time band?
            if ($closureBand && $this->timeWithin($slot['time'], $closureBand['start'], $closureBand['end'])) {
                $slot['available'] = false;
                $slot['reason'] = $slotUnavailableMsg;
                continue;
            }
            // inside any break band?
            foreach ($breakBands as $band) {
                if ($this->timeWithin($slot['time'], $band['start'], $band['end'])) {
                    $slot['available'] = false;
                    $slot['reason'] = $slotUnavailableMsg;
                    break;
                }
            }
        }
        unset($slot);

        // 7. Subtract full slots (capacity)
        $taken = $this->slotTakenCounts($clinic->id, $dateYmd);
        foreach ($slots as &$slot) {
            if (! $slot['available']) continue;
            $count = $taken[$slot['time']] ?? 0;
            if ($count >= $maxPerSlot) {
                $slot['available'] = false;
                $slot['reason'] = $slotUnavailableMsg;
            }
        }
        unset($slot);

        $anyOpen = collect($slots)->contains(fn ($s) => $s['available']);

        return [
            'available' => $anyOpen,
            'reason' => $anyOpen ? null : 'All slots for this day are taken or unavailable.',
            'reason_code' => $anyOpen ? null : 'all_slots_full',
            'weekday' => $weekday,
            'weekday_name' => ClinicSchedule::WEEKDAYS[$weekday],
            'open_time' => $open,
            'close_time' => $close,
            'slot_minutes' => $minutes,
            'slots' => $slots,
        ];
    }

    /**
     * Server-side check used by AppointmentController@store.
     * Returns ['ok' => bool, 'reason' => ?string, 'reason_code' => ?string].
     */
    public function isSlotBookable(string $clinicSlug, string $dateYmd, string $hhmm): array
    {
        $payload = $this->slotsFor($clinicSlug, $dateYmd);

        if (! $payload['available']) {
            return ['ok' => false, 'reason' => $payload['reason'], 'reason_code' => $payload['reason_code']];
        }

        foreach ($payload['slots'] as $slot) {
            if ($slot['time'] === $hhmm) {
                return $slot['available']
                    ? ['ok' => true, 'reason' => null, 'reason_code' => null]
                    : ['ok' => false, 'reason' => $slot['reason'] ?: ClinicBookingSettings::DEFAULT_SLOT_UNAVAILABLE, 'reason_code' => 'slot_unavailable'];
            }
        }

        return ['ok' => false, 'reason' => ClinicBookingSettings::DEFAULT_SLOT_UNAVAILABLE, 'reason_code' => 'slot_not_in_schedule'];
    }

    /* ============================================================
     * Internals
     * ============================================================ */

    private function emptyResult(int $weekday): array
    {
        return [
            'available' => false,
            'reason' => null,
            'reason_code' => null,
            'weekday' => $weekday,
            'weekday_name' => ClinicSchedule::WEEKDAYS[$weekday] ?? null,
            'open_time' => null,
            'close_time' => null,
            'slot_minutes' => 15,
            'slots' => [],
        ];
    }

    /** Returns ['full_day'=>bool, ...] or null if no holiday applies that date. */
    private function checkHolidays(string $clinicSlug, Carbon $date): ?array
    {
        $holiday = Holiday::where('date', $date->toDateString())
            ->get()
            ->first(fn (Holiday $h) => $h->affects($clinicSlug));

        if (! $holiday) return null;

        if ($holiday->is_full_day) {
            return ['full_day' => true, 'name' => $holiday->name];
        }
        return [
            'full_day' => false,
            'name' => $holiday->name,
            'start' => $this->fmtTime($holiday->start_time),
            'end' => $this->fmtTime($holiday->end_time),
        ];
    }

    /** Returns ['full_day'=>bool, ...] or null if no closure applies that date. */
    private function checkClosures(string $clinicSlug, Carbon $date): ?array
    {
        $closure = TemporaryClosure::all()
            ->first(fn (TemporaryClosure $c) => $c->appliesOnDate($date->toDateString()) && $c->affects($clinicSlug));

        if (! $closure) return null;

        if ($closure->is_full_day) {
            return ['full_day' => true, 'reason' => $closure->reason];
        }
        return [
            'full_day' => false,
            'reason' => $closure->reason,
            'start' => $this->fmtTime($closure->start_time),
            'end' => $this->fmtTime($closure->end_time),
        ];
    }

    /** Collect break time bands for a clinic+date (both weekly and one-off). */
    private function breakBandsFor(int $clinicId, string $clinicSlug, Carbon $date, int $weekday): array
    {
        $breaks = BreakTime::where(function ($q) use ($clinicId) {
                $q->whereNull('clinic_id')->orWhere('clinic_id', $clinicId);
            })
            ->where(function ($q) use ($weekday, $date) {
                $q->where(function ($q2) use ($weekday) {
                    $q2->where('recurrence', 'weekly')->where('weekday', $weekday);
                })->orWhere(function ($q2) use ($date) {
                    $q2->where('recurrence', 'once')->where('date', $date->toDateString());
                });
            })
            ->get();

        return $breaks->map(fn (BreakTime $b) => [
            'start' => $this->fmtTime($b->start_time),
            'end' => $this->fmtTime($b->end_time),
            'reason' => $b->custom_reason ?: (BreakTime::REASONS[$b->reason] ?? $b->reason),
        ])->toArray();
    }

    private function generateSlots(string $open, string $close, int $minutes): array
    {
        $slots = [];
        // Use a plain DateTime on a fixed epoch so Carbon's strict parser
        // doesn't reject "08:00" as "trailing data". We only need a clock-
        // arithmetic cursor, not a real date.
        $cursor = new \DateTime('1970-01-01 ' . $open . ':00');
        $end    = new \DateTime('1970-01-01 ' . $close . ':00');
        while ($cursor < $end) {
            $label = $cursor->format('g:i a');                       // e.g. "2:30 pm"
            $time  = $cursor->format('H:i');                         // e.g. "14:30"
            $slots[] = ['time' => $time, 'label' => $label, 'available' => true, 'reason' => null];
            $cursor->modify("+{$minutes} minutes");
        }
        return $slots;
    }

    /** Map of "HH:MM" → count of active appointments for clinic+date. */
    private function slotTakenCounts(int $clinicId, string $dateYmd): array
    {
        return Appointment::where('clinic_id', $clinicId)
            ->where('preferred_date', $dateYmd)
            ->whereIn('status', Appointment::ACTIVE_STATUSES)
            ->selectRaw("SUBSTRING(preferred_time, 1, 5) as hhmm, COUNT(*) as cnt")
            ->groupBy('hhmm')
            ->pluck('cnt', 'hhmm')
            ->toArray();
    }

    private function timeWithin(string $hhmm, ?string $start, ?string $end): bool
    {
        if (! $start || ! $end) return false;
        return $hhmm >= $start && $hhmm < $end;
    }

    private function fmtTime($value): ?string
    {
        if (! $value) return null;
        // Accept Carbon, string "HH:MM:SS", or "HH:MM"
        if ($value instanceof \DateTimeInterface) return $value->format('H:i');
        return substr((string) $value, 0, 5);
    }
}
