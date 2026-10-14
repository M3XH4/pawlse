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
        Schema::table('volunteer_applications', function (Blueprint $table) {
            $table->unsignedSmallInteger('foster_capacity')->nullable()->after('experience');
            $table->string('foster_preference')->nullable()->after('foster_capacity'); // 'cats', 'dogs', 'both'
            $table->text('foster_needs')->nullable()->after('foster_preference');
            $table->text('medic_experience')->nullable()->after('foster_needs');
            $table->text('medic_certifications')->nullable()->after('medic_experience');
            $table->boolean('transport_has_license')->default(false)->after('medic_certifications');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('volunteer_applications', function (Blueprint $table) {
            $table->dropColumn([
                'foster_capacity',
                'foster_preference',
                'foster_needs',
                'medic_experience',
                'medic_certifications',
                'transport_has_license',
            ]);
        });
    }
};
