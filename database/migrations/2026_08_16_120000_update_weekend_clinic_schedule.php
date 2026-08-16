<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Client confirmed weekend hours (Aug 2026): Saturday and Sunday now run
 * 12:00-18:00 with online booking enabled, replacing the previous
 * Sat 09:00-14:00 / Sun-closed defaults. ClinicScheduleSeeder was updated
 * to match, but seeders don't re-run on deploy — this migration carries
 * the same change to already-seeded environments (including production).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('clinic_schedules')
            ->whereIn('weekday', [0, 6]) // Sunday, Saturday
            ->update([
                'is_open' => true,
                'open_time' => '12:00:00',
                'close_time' => '18:00:00',
            ]);
    }

    public function down(): void
    {
        DB::table('clinic_schedules')
            ->where('weekday', 0) // Sunday
            ->update([
                'is_open' => false,
                'open_time' => '08:00:00',
                'close_time' => '19:00:00',
            ]);

        DB::table('clinic_schedules')
            ->where('weekday', 6) // Saturday
            ->update([
                'is_open' => true,
                'open_time' => '09:00:00',
                'close_time' => '14:00:00',
            ]);
    }
};
