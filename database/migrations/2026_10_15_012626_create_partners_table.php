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
        Schema::create('partners', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category')->default('veterinary'); // veterinary, food_supply, collaborator, sponsor
            $table->string('badge_title')->nullable(); // e.g. "Frequently Contacted by ISF"
            $table->json('badges')->nullable(); // ["Frequently Contacted by ISF", "Emergency Option"]
            $table->text('short_description')->nullable();
            $table->text('description')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->default('Iligan City');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website_url')->nullable();
            $table->string('social_url')->nullable();
            $table->string('operating_hours')->nullable();
            $table->json('services')->nullable();
            $table->string('image_url')->nullable();
            $table->string('logo_url')->nullable();
            $table->boolean('is_emergency')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
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
        Schema::dropIfExists('partners');
    }
};
