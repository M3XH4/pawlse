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
        Schema::create('pet_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('type'); // rescue, missing, sos
            $table->string('status')->default('pending'); // pending, assigned, resolved, duplicate, cancelled
            $table->boolean('is_duplicate')->default(false);
            $table->foreignId('duplicate_of_id')->nullable()->constrained('pet_reports')->nullOnDelete();
            $table->string('animal_type'); // Cat, Dog, Other
            $table->string('breed')->nullable();
            $table->string('age_category')->nullable();
            $table->string('gender')->nullable();
            $table->string('name')->nullable(); // suggested or actual pet name
            $table->string('color')->nullable();
            $table->dateTime('last_seen_date')->nullable();
            $table->string('urgency')->nullable(); // low, medium, high (for sos)
            $table->string('situation_type')->nullable(); // Abuse, Injured, Trapped, Sick (for sos)
            $table->text('description')->nullable();
            $table->string('location');
            $table->string('contact_name')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->foreignId('assigned_volunteer_id')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pet_reports');
    }
};
