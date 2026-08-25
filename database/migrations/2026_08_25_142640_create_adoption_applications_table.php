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
        Schema::create('adoption_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('shelter_animal_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending');

            // Personal Info
            $table->string('full_name');
            $table->string('address');
            $table->string('phone');
            $table->string('email');
            $table->date('birth_date');
            $table->string('occupation')->nullable();
            $table->string('company');
            $table->string('social_media')->nullable();
            $table->string('status_marital');
            $table->string('pronouns');
            $table->json('adoption_source');
            $table->boolean('adopted_before');

            // Emergency Contact
            $table->string('emergency_name');
            $table->string('emergency_relationship');
            $table->string('emergency_phone');
            $table->string('emergency_email');

            // Questionnaire
            $table->string('adoption_preference');
            $table->string('residence_type');
            $table->boolean('is_renting');
            $table->string('moving_plan');
            $table->json('lives_with');
            $table->boolean('has_allergies');
            $table->string('daily_care_handler');
            $table->string('expenses_handler');
            $table->string('emergency_handler');
            $table->string('hours_alone');
            $table->text('introduction_plan');
            $table->boolean('family_support');
            $table->text('family_support_explanation')->nullable();
            $table->boolean('current_pets');
            $table->boolean('past_pets');

            // Schedule
            $table->date('preferred_date');
            $table->time('preferred_time');
            $table->boolean('can_visit_shelter');

            // Admin Actions
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adoption_applications');
    }
};
