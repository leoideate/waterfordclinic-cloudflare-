<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\ClinicBookingSettings;
use App\Models\ClinicSchedule;
use Illuminate\Database\Seeder;

/**
 * Seeds default availability for both clinics:
 *   Mon–Fri  08:00–19:00, 30-min slots, 1 per slot
 *   Saturday 09:00–14:00, 30-min slots, 1 per slot
 *   Sunday   CLOSED  (is_open = false)  ← admin can flip this
 */
class ClinicScheduleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Clinic::all() as $clinic) {
            for ($weekday = 0; $weekday <= 6; $weekday++) {
                $isSunday = $weekday === 0;
                $isSaturday = $weekday === 6;

                ClinicSchedule::updateOrCreate(
                    ['clinic_id' => $clinic->id, 'weekday' => $weekday],
                    [
                        'is_open'      => ! $isSunday,
                        'open_time'    => $isSaturday ? '09:00:00' : '08:00:00',
                        'close_time'   => $isSaturday ? '14:00:00' : '19:00:00',
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
