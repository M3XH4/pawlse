<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('care_sustainabilities', function (Blueprint $table) {
            $table->id();
            $table->decimal('verified_funds', 12, 2)->default(4250.00);
            $table->decimal('daily_cost', 12, 2)->default(500.00);
            $table->string('resource_category')->default('General Animal Care');
            $table->timestamp('sustainability_endpoint')->nullable();
            $table->decimal('threshold_stable_days', 6, 2)->default(7.00);
            $table->decimal('threshold_needs_support_days', 6, 2)->default(3.00);
            $table->decimal('threshold_urgent_days', 6, 2)->default(1.00);
            $table->decimal('threshold_critical_days', 6, 2)->default(0.25);
            $table->text('calculation_notes')->nullable();
            $table->string('updated_by_name')->default('ISF Admin');
            $table->foreignId('updated_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('care_sustainability_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('care_sustainability_id')->constrained('care_sustainabilities')->cascadeOnDelete();
            $table->string('action', 50); // recalculate, config_update, timer_extend, donation_verified
            $table->decimal('funds_amount', 12, 2)->nullable();
            $table->decimal('daily_cost', 12, 2)->default(500.00);
            $table->decimal('amount_added', 12, 2)->default(0.00);
            $table->decimal('days_added', 8, 2)->default(0.00);
            $table->timestamp('endpoint_before')->nullable();
            $table->timestamp('endpoint_after')->nullable();
            $table->text('notes')->nullable();
            $table->string('performed_by')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('donation_id')->nullable()->constrained('donations')->nullOnDelete();
            $table->timestamp('created_at')->nullable();
        });

        // Insert default initial record matching system configuration
        $now = now();
        $initialEndpoint = $now->copy()->addDays(round(4250 / 500, 2));

        $sustainabilityId = DB::table('care_sustainabilities')->insertGetId([
            'verified_funds' => 4250.00,
            'daily_cost' => 500.00,
            'resource_category' => 'General Animal Care',
            'sustainability_endpoint' => $initialEndpoint,
            'threshold_stable_days' => 7.00,
            'threshold_needs_support_days' => 3.00,
            'threshold_urgent_days' => 1.00,
            'threshold_critical_days' => 0.25,
            'calculation_notes' => 'Initial baseline care sustainability configuration based on verified care funds and daily operating expenses.',
            'updated_by_name' => 'ISF Admin',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('care_sustainability_histories')->insert([
            'care_sustainability_id' => $sustainabilityId,
            'action' => 'recalculated',
            'funds_amount' => 4250.00,
            'daily_cost' => 500.00,
            'amount_added' => 4250.00,
            'days_added' => 8.50,
            'endpoint_before' => null,
            'endpoint_after' => $initialEndpoint,
            'notes' => 'Initial system sustainability setup',
            'performed_by' => 'ISF Admin',
            'created_at' => $now,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('care_sustainability_histories');
        Schema::dropIfExists('care_sustainabilities');
    }
};
