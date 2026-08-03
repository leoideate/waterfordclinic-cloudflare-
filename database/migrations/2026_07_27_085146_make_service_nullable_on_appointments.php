<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // "Reason for visit / service" is now optional — allow NULL.
            $table->string('service')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Backfill NULLs so the NOT NULL constraint can be re-applied safely.
        \DB::table('appointments')->whereNull('service')->update(['service' => 'General consultation']);

        Schema::table('appointments', function (Blueprint $table) {
            $table->string('service')->nullable(false)->change();
        });
    }
};
