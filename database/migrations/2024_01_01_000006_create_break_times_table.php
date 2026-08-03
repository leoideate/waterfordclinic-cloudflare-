<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Doctor / staff break times. Either a one-off (date set, recurrence=once) or
 * recurring weekly (weekday set, recurrence=weekly). clinic_id NULL = both clinics.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('break_times', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable()->constrained()->nullOnDelete(); // NULL = both
            $table->tinyInteger('weekday')->unsigned()->nullable();   // 0-6, for weekly recurrence
            $table->date('date')->nullable();                          // for one-off
            $table->time('start_time');
            $table->time('end_time');
            $table->string('reason')->default('custom');               // lunch|doctor_unavailable|emergency|staff_meeting|training|custom
            $table->string('custom_reason')->nullable();
            $table->string('recurrence')->default('once');             // once|weekly
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['clinic_id', 'weekday']);
            $table->index(['date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('break_times');
    }
};
