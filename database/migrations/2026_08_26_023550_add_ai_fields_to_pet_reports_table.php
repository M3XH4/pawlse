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
        Schema::table('pet_reports', function (Blueprint $table) {
            $table->foreignId('ai_prediction_log_id')->nullable()->constrained('ai_prediction_logs')->nullOnDelete();
            $table->string('ai_validation_status')->nullable()->index(); // null, pending, approved, rejected
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pet_reports', function (Blueprint $table) {
            $table->dropForeign(['ai_prediction_log_id']);
            $table->dropColumn(['ai_prediction_log_id', 'ai_validation_status']);
        });
    }
};
