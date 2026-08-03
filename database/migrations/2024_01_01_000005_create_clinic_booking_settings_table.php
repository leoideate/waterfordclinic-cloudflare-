<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One row per clinic controlling booking on/off + the messages shown on the
 * public form. Lives beside `clinics` so the base table stays display-only.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinic_booking_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('bookings_enabled')->default(true);
            $table->text('confirmation_message')->nullable();
            $table->text('unavailable_message')->nullable();
            $table->string('notification_email')->nullable();   // where new-booking alerts go
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinic_booking_settings');
    }
};
