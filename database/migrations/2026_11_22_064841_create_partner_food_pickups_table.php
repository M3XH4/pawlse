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
        Schema::create('partner_food_pickups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained('partners')->cascadeOnDelete();
            $table->date('pickup_date');
            $table->foreignId('assigned_volunteer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('pending'); // pending, assigned, fetched, completed, missed
            $table->string('food_summary')->nullable();
            $table->text('volunteer_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('fetched_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('missed_at')->nullable();
            $table->timestamps();

            $table->unique(['partner_id', 'pickup_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partner_food_pickups');
    }
};
