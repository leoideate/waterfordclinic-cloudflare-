<?php

namespace Database\Seeders;

use App\Models\Clinic;
use Illuminate\Database\Seeder;

class ClinicSeeder extends Seeder
{
    public function run(): void
    {
        // ⚠️ Waterford Walk In Clinic is a single location. Address and opening
        // hours are NOT published anywhere on waterfordclinic.ie (checked
        // home, about, services and contact pages) — left as explicit TODOs
        // rather than guessed, since sending an unwell patient to the wrong
        // place or at the wrong time is a real-world harm, not a cosmetic bug.
        // MUST be confirmed with the client before launch.
        //
        // 'address' and each hours row's 'time' are '' (empty), NOT a
        // placeholder string like "TODO: confirm...". `address` flows
        // straight into the patient-facing booking confirmation email
        // (AppointmentController -> AppointmentConfirmed mailable) — a
        // placeholder string there is not a TODO note, it's an email a
        // real patient reads. The frontend and the email template both
        // treat empty as "not yet known" and hide the row.
        Clinic::updateOrCreate(
            ['slug' => 'waterford'],
            [
                'name' => 'Waterford',
                'full_name' => 'Waterford Walk In Clinic',
                'county' => 'Co. Waterford',
                'tagline' => 'Walk-in and out-of-hours medical care in Waterford',
                'address' => '',
                'phone' => '051 552424',
                'email' => 'info@waterfordclinic.ie',
                'hours' => [
                    ['day' => 'Mon – Fri', 'time' => ''],
                    ['day' => 'Saturday',  'time' => ''],
                    ['day' => 'Sunday',    'time' => ''],
                ],
                'is_active' => true,
            ]
        );
    }
}
