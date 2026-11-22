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
        if (! Schema::hasColumn('assigned_tasks', 'partner_food_pickup_id')) {
            Schema::table('assigned_tasks', function (Blueprint $table) {
                $table->unsignedBigInteger('partner_food_pickup_id')->nullable()->after('pet_report_id');
            });
        }

        Schema::table('assigned_tasks', function (Blueprint $table) {
            $table->foreign('partner_food_pickup_id')
                ->references('id')
                ->on('partner_food_pickups')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assigned_tasks', function (Blueprint $table) {
            $table->dropConstrainedForeignId('partner_food_pickup_id');
        });
    }
};
