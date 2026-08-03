<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds the default demo admin. CHANGE THIS PASSWORD before going live
 * (it's controllable from the Admin Users section in the dashboard).
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@walkingp.ie'],
            [
                'name' => 'Walk In GP Admin',
                'username' => 'admin',
                'password' => Hash::make('ChangeMe123!'),   // bcrypt-hashed, never plain-text
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}
