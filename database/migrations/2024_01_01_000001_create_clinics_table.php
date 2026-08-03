<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinics', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();          // 'tullamore', 'kildare'
            $table->string('name');                    // 'Tullamore'
            $table->string('full_name');               // 'Walk In GP — Tullamore'
            $table->string('county')->nullable();
            $table->string('tagline')->nullable();
            $table->text('address');
            $table->string('phone');
            $table->string('email');
            $table->json('hours')->nullable();         // opening hours
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinics');
    }
};
