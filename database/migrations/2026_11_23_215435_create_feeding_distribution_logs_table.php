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
        Schema::create('feeding_distribution_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('feeding_schedule_id')->constrained('feeding_schedules')->cascadeOnDelete();
            $table->foreignId('recorded_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_task_id')->nullable()->constrained('assigned_tasks')->nullOnDelete();
            $table->string('street_or_stop');
            $table->string('food_type')->default('Dry Kibble');
            $table->unsignedInteger('food_packs_distributed');
            $table->unsignedInteger('strays_fed')->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index(['feeding_schedule_id', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feeding_distribution_logs');
    }
};
