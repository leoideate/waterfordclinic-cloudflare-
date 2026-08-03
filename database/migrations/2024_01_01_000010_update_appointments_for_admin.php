<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Aligns the appointments table with the admin workflow:
 *   - status default becomes 'new' (spec statuses: new|confirmed|cancelled|completed|no_show)
 *   - backfill any old 'requested' rows to 'new'
 *   - add admin_notes for internal admin-only notes
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->text('admin_notes')->nullable()->after('notes');
        });

        // Backfill old 'requested' rows to 'new' (idempotent; works on SQLite + MySQL).
        DB::table('appointments')->where('status', 'requested')->update(['status' => 'new']);
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('admin_notes');
        });
    }
};
