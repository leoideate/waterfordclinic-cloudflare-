<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds the default demo admin on first run. CHANGE THIS PASSWORD before
 * going live (it's controllable from the Admin Users section in the
 * dashboard).
 *
 * Deliberately NOT `updateOrCreate` with password in the update payload —
 * that resets the password to the public default on every reseed, which is
 * exactly what happened in production here: an admin changed their
 * password, a later `db:seed --force` silently reset it back to
 * ChangeMe123!, the same value sitting in plaintext in this file's git
 * history. Password is only ever set when the row is first created;
 * re-running this seeder against an existing admin now only keeps
 * name/username/role/is_active in sync and never touches the password.
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'admin@waterfordclinic.ie')->first();

        if ($user) {
            $user->update([
                'name' => 'Waterford Walk In Clinic Admin',
                'username' => 'admin',
                'role' => 'admin',
                'is_active' => true,
            ]);
            return;
        }

        User::create([
            'email' => 'admin@waterfordclinic.ie',
            'name' => 'Waterford Walk In Clinic Admin',
            'username' => 'admin',
            'password' => Hash::make('ChangeMe123!'),   // bcrypt-hashed, never plain-text
            'role' => 'admin',
            'is_active' => true,
        ]);
    }
}
