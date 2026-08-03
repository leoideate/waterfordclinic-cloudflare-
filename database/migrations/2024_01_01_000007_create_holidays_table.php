<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Public holidays / full-day closures. scope = tullamore|kildare|both.
 * A full-day holiday blocks the whole date; a partial holiday blocks a time window.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('date');
            $table->string('scope')->default('both');        // tullamore|kildare|both
            $table->boolean('is_full_day')->default(true);
            $table->time('start_time')->nullable();          // when is_full_day = false
            $table->time('end_time')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['date', 'scope']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};
