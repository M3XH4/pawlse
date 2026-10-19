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
        Schema::table('animal_medical_records', function (Blueprint $table) {
            $table->string('severity')->nullable()->after('dosage'); // mild, moderate, severe, critical
            $table->text('treatment_plan')->nullable()->after('severity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('animal_medical_records', function (Blueprint $table) {
            $table->dropColumn(['severity', 'treatment_plan']);
        });
    }
};
