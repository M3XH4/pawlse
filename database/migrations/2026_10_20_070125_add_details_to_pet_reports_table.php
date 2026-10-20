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
            $table->string('size')->nullable()->after('color');
            $table->string('reward')->nullable()->after('size');
            $table->text('medical_conditions')->nullable()->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pet_reports', function (Blueprint $table) {
            $table->dropColumn(['size', 'reward', 'medical_conditions']);
        });
    }
};
