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
            $table->string('before_photo_url')->nullable()->after('photo_url');
            $table->string('after_photo_url')->nullable()->after('before_photo_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shelter_animals', function (Blueprint $table) {
            $table->dropColumn(['before_photo_url', 'after_photo_url']);
        });
    }
};
