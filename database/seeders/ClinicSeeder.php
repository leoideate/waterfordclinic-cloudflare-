<?php

namespace Database\Seeders;

use App\Models\Clinic;
use Illuminate\Database\Seeder;

class ClinicSeeder extends Seeder
{
    public function run(): void
    {
        $hours = [
            ['day' => 'Mon – Fri', 'time' => '8:00 – 19:00'],
            ['day' => 'Saturday',  'time' => '9:00 – 14:00'],
            ['day' => 'Sunday',    'time' => 'Closed'],
        ];

        Clinic::updateOrCreate(
            ['slug' => 'tullamore'],
            [
                'name' => 'Tullamore',
                'full_name' => 'Walk In GP — Tullamore',
                'county' => 'Co. Offaly',
                'tagline' => 'Walk-in GP care in the heart of Tullamore',
                'address' => 'Offaly St, Tullamore, Co. Offaly, R35 C985, Ireland',
                'phone' => '+353 818 362 867',
                'email' => 'tullamore@walkingp.ie',
                'hours' => [
                    ['day' => 'Mon – Fri', 'time' => '10:00am – 8:00pm'],
                    ['day' => 'Saturday',  'time' => '10:00am – 6:00pm'],
                    ['day' => 'Sunday',    'time' => '10:00am – 6:00pm'],
                ],
                'is_active' => true,
            ]
        );

        Clinic::updateOrCreate(
            ['slug' => 'kildare'],
            [
                'name' => 'Kildare',
                'full_name' => 'Walk In GP — Kildare',
                'county' => 'Co. Kildare',
                'tagline' => 'Modern walk-in GP service in Kildare town',
                'address' => '3 Fairview Cottages, Kildare, R51 HV25, Ireland',
                'phone' => '+353 818 362 867',
                'email' => 'kildare@walkingp.ie',
                'hours' => [
                    ['day' => 'Mon – Fri', 'time' => '10:00am – 8:00pm'],
                    ['day' => 'Saturday',  'time' => '12:00pm – 6:00pm'],
                    ['day' => 'Sunday',    'time' => '12:00pm – 6:00pm'],
                ],
                'is_active' => true,
            ]
        );
    }
}
