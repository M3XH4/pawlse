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
        Schema::table('partners', function (Blueprint $table) {
            $table->boolean('provides_daily_food')->default(false)->after('is_featured');
            $table->string('daily_food_notes')->nullable()->after('provides_daily_food');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->dropColumn(['provides_daily_food', 'daily_food_notes']);
        });
    }
};
