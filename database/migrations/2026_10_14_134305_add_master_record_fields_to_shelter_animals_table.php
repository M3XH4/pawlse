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
        Schema::table('shelter_animals', function (Blueprint $table) {
            $table->string('current_location')->nullable()->after('status');
            $table->string('microchip_id')->nullable()->after('current_location');
            $table->string('weight')->nullable()->after('microchip_id');
            $table->string('intake_type')->nullable()->after('weight');
            $table->date('rescue_date')->nullable()->after('intake_type');
            $table->string('rescue_location')->nullable()->after('rescue_date');
            $table->text('rescue_story')->nullable()->after('rescue_location');
            $table->foreignId('pet_report_id')->nullable()->after('rescue_story')->constrained('pet_reports')->nullOnDelete();
            $table->date('adoption_date')->nullable()->after('pet_report_id');
            $table->string('adopter_name')->nullable()->after('adoption_date');
            $table->string('adopter_phone')->nullable()->after('adopter_name');
            $table->string('adopter_email')->nullable()->after('adopter_phone');
            $table->text('adoption_notes')->nullable()->after('adopter_email');
            $table->date('deceased_at')->nullable()->after('adoption_notes');
            $table->text('deceased_notes')->nullable()->after('deceased_at');
            $table->text('special_needs')->nullable()->after('deceased_notes');

            $table->index('microchip_id');
            $table->index('current_location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shelter_animals', function (Blueprint $table) {
            $table->dropForeign(['pet_report_id']);
            $table->dropColumn([
                'current_location',
                'microchip_id',
                'weight',
                'intake_type',
                'rescue_date',
                'rescue_location',
                'rescue_story',
                'pet_report_id',
                'adoption_date',
                'adopter_name',
                'adopter_phone',
                'adopter_email',
                'adoption_notes',
                'deceased_at',
                'deceased_notes',
                'special_needs',
            ]);
        });
    }
};
