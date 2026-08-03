<?php

namespace Database\Seeders;

use App\Models\Clinic;
use Illuminate\Database\Seeder;

class ClinicSeeder extends Seeder
{
    public function run(): void
    {
        // ⚠️ Waterford Clinic is a single location. Address and opening
        // hours are NOT published anywhere on waterfordclinic.ie (checked
        // home, about, services and contact pages) — left as explicit TODOs
        // rather than guessed, since sending an unwell patient to the wrong
        // place or at the wrong time is a real-world harm, not a cosmetic bug.
        // MUST be confirmed with the client before launch.
        Clinic::updateOrCreate(
            ['slug' => 'waterford'],
            [
                'name' => 'Waterford',
                'full_name' => 'Waterford Clinic',
                'county' => 'Co. Waterford',
                'tagline' => 'Walk-in and out-of-hours GP care in Waterford',
                'address' => 'TODO: confirm full street address with client',
                'phone' => '051 552424',
                'email' => 'info@waterfordclinic.ie',
                'hours' => [
                    ['day' => 'Mon – Fri', 'time' => 'TODO: confirm'],
                    ['day' => 'Saturday',  'time' => 'TODO: confirm'],
                    ['day' => 'Sunday',    'time' => 'TODO: confirm'],
                ],
                'is_active' => true,
            ]
        );
    }
}
