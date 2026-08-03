<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ad-hoc temporary closures: full day, half day, custom date range, or specific
 * time window. clinic_id NULL = both clinics. Examples handled here:
 *   "Tullamore closed 12 Aug 1pm-3pm", "Kildare closed Friday 9am-12pm",
 *   "Both clinics closed on a public holiday", "Doctor unavailable 2:30pm-4pm".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('temporary_closures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable()->constrained()->nullOnDelete(); // NULL = both
            $table->date('start_date');
            $table->date('end_date')->nullable();             // NULL = single day
            $table->boolean('is_full_day')->default(true);
            $table->time('start_time')->nullable();           // when is_full_day = false
            $table->time('end_time')->nullable();
            $table->string('reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['start_date', 'end_date']);
            $table->index(['clinic_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('temporary_closures');
    }
};
