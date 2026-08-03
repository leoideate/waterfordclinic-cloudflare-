<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Per-clinic, per-weekday opening schedule. Sunday is weekday 0 with is_open=false by default;
 * the admin "Enable Sunday bookings" toggle simply flips is_open for that row.
 *
 *   weekday: 0 = Sunday, 1 = Monday, ... 6 = Saturday (PHP/Carbon "day of week".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinic_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('weekday')->unsigned();           // 0 (Sun) – 6 (Sat)
            $table->boolean('is_open')->default(true);
            $table->time('open_time')->default('08:00:00');
            $table->time('close_time')->default('19:00:00');
            $table->unsignedSmallInteger('slot_minutes')->default(30);
            $table->unsignedSmallInteger('max_per_slot')->default(1);
            $table->timestamps();

            $table->unique(['clinic_id', 'weekday']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinic_schedules');
    }
};
