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
        Schema::table('adoption_applications', function (Blueprint $table) {
            $table->index(['status', 'created_at']);
            $table->index('email');
        });

        Schema::table('shelter_animals', function (Blueprint $table) {
            $table->index('status');
            $table->index('adoption_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('adoption_applications', function (Blueprint $table) {
            $table->dropIndex(['status', 'created_at']);
            $table->dropIndex(['email']);
        });

        Schema::table('shelter_animals', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['adoption_date']);
        });
    }
};
