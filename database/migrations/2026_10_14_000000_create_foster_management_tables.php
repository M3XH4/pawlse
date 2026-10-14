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
        // 1. Foster Parents Directory & Authorizations
        Schema::create('foster_parents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('status')->default('approved'); // approved, pending, suspended, inactive
            $table->unsignedInteger('capacity')->default(2); // Maximum concurrent foster pets allowed
            $table->text('notes')->nullable(); // Preferences, experience, environment notes
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
        });

        // 2. Foster Placements & Transfer Histories
        Schema::create('foster_placements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shelter_animal_id')->constrained('shelter_animals')->cascadeOnDelete();
            $table->foreignId('foster_parent_id')->constrained('foster_parents')->cascadeOnDelete();
            $table->foreignId('foster_parent_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('active'); // active, transferred, ended, cancelled
            $table->date('start_date');
            $table->date('expected_review_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('care_instructions')->nullable();
            $table->text('medical_notes')->nullable();
            $table->text('dietary_requirements')->nullable();
            $table->text('special_needs')->nullable();
            $table->text('placement_notes')->nullable();
            $table->text('transfer_reason')->nullable();
            $table->text('end_reason')->nullable();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('transferred_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('previous_placement_id')->nullable()->constrained('foster_placements')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['shelter_animal_id', 'status']);
            $table->index(['foster_parent_id', 'status']);
            $table->index(['foster_parent_user_id', 'status']);
            $table->index('status');
        });

        // 3. Foster Care Updates & Progress Reports
        Schema::create('foster_care_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('foster_placement_id')->constrained('foster_placements')->cascadeOnDelete();
            $table->foreignId('shelter_animal_id')->constrained('shelter_animals')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('update_type')->default('routine'); // routine, medical, behavioral, emergency, milestone
            $table->string('urgency')->default('low'); // low, medium, high, critical
            $table->string('title');
            $table->text('notes');
            $table->string('weight')->nullable();
            $table->text('feeding_notes')->nullable();
            $table->text('medication_notes')->nullable();
            $table->date('next_appointment_date')->nullable();
            $table->text('admin_notes')->nullable();
            $table->foreignId('acknowledged_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['foster_placement_id', 'created_at']);
            $table->index(['shelter_animal_id', 'created_at']);
            $table->index(['urgency', 'acknowledged_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('foster_care_updates');
        Schema::dropIfExists('foster_placements');
        Schema::dropIfExists('foster_parents');
    }
};
