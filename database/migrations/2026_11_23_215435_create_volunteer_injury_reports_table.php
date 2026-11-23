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
        Schema::create('volunteer_injury_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_task_id')->nullable()->constrained('assigned_tasks')->nullOnDelete();
            $table->string('incident_type');
            $table->string('severity')->default('minor');
            $table->string('body_part')->nullable();
            $table->string('location')->nullable();
            $table->timestamp('incident_occurred_at');
            $table->text('description');
            $table->boolean('first_aid_applied')->default(false);
            $table->text('first_aid_notes')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('status')->default('reported');
            $table->string('medical_aid_type')->nullable();
            $table->string('medical_facility')->nullable();
            $table->text('medical_aid_notes')->nullable();
            $table->foreignId('initiated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('medical_aid_initiated_at')->nullable();
            $table->foreignId('confirmed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('confirmed_at')->nullable();
            $table->text('confirmation_notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('volunteer_injury_reports');
    }
};
