<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained()->cascadeOnDelete();

            // Public, opaque reference shown to the patient
            $table->string('reference')->unique();

            // Patient details
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->date('dob')->nullable();
            $table->boolean('is_existing_patient')->nullable();

            // Visit details
            $table->string('service');
            $table->date('preferred_date');
            $table->time('preferred_time');
            $table->text('notes')->nullable();

            // Workflow
            $table->string('status')->default('requested'); // requested, confirmed, cancelled, completed
            $table->string('source')->default('website');
            $table->string('ip_address')->nullable();

            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();

            $table->index(['clinic_id', 'preferred_date']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
