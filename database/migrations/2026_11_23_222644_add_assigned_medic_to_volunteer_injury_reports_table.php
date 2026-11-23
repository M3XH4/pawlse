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
        Schema::table('volunteer_injury_reports', function (Blueprint $table): void {
            $table->foreignId('assigned_medic_user_id')
                ->nullable()
                ->after('initiated_by_user_id')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('volunteer_injury_reports', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('assigned_medic_user_id');
        });
    }
};
