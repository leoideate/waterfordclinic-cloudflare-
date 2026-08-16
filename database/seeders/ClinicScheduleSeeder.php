<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\ClinicBookingSettings;
use App\Models\ClinicSchedule;
use Illuminate\Database\Seeder;

/**
 * Seeds default availability for both clinics:
 *   Mon–Fri            08:00–19:00, 15-min slots, 1 per slot
 *   Saturday & Sunday   12:00–18:00, 15-min slots, 1 per slot  ← confirmed by client, Aug 2026
 */
class ClinicScheduleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Clinic::all() as $clinic) {
            for ($weekday = 0; $weekday <= 6; $weekday++) {
                $isWeekend = $weekday === 0 || $weekday === 6;

                ClinicSchedule::updateOrCreate(
                    ['clinic_id' => $clinic->id, 'weekday' => $weekday],
                    [
                        'is_open'      => true,
                        'open_time'    => $isWeekend ? '12:00:00' : '08:00:00',
                        'close_time'   => $isWeekend ? '18:00:00' : '19:00:00',
                        'slot_minutes' => 15,
                        'max_per_slot' => 1,
                    ]
                );
            }

            ClinicBookingSettings::updateOrCreate(
                ['clinic_id' => $clinic->id],
                ['bookings_enabled' => true]
            );
        }
    }
}
