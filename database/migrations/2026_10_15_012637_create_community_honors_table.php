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
        Schema::create('community_honors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->default('community_supporter'); // donor, volunteer, sponsor, community_supporter
            $table->string('tier')->nullable(); // platinum, gold, silver, core_member
            $table->string('role_title')->nullable(); // Feeding Supporter, Recurring Supporter, ISF Supporter, Core Volunteer
            $table->text('description')->nullable();
            $table->json('badges')->nullable(); // ["Recurring Donor", "Feeding Volunteer"]
            $table->string('initials', 10)->nullable();
            $table->string('avatar_url')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_public')->default(true);
            $table->integer('display_order')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_honors');
    }
};
