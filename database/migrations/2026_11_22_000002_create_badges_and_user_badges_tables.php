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
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('audience', 32)->index(); // 'user' or 'volunteer'
            $table->string('category', 64)->index();
            $table->string('tier', 32)->default('bronze'); // bronze, silver, gold, platinum
            $table->string('name');
            $table->string('description');
            $table->string('task_label');
            $table->string('metric_key', 64);
            $table->unsignedInteger('target_value')->default(1);
            $table->unsignedInteger('xp_reward')->default(50);
            $table->string('image_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('badge_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('progress_value')->default(0);
            $table->timestamp('unlocked_at')->nullable()->index();
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'badge_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badges');
    }
};
