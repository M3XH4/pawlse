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
        Schema::table('foster_parents', function (Blueprint $table) {
            $table->string('location')->nullable()->after('capacity');
            $table->string('pet_preference')->nullable()->after('location'); // dogs, cats, both
            $table->string('housing_type')->nullable()->after('pet_preference'); // house_with_yard, apartment, etc.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('foster_parents', function (Blueprint $table) {
            $table->dropColumn(['location', 'pet_preference', 'housing_type']);
        });
    }
};
