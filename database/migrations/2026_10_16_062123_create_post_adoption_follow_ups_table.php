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
        Schema::create('post_adoption_follow_ups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shelter_animal_id')->constrained('shelter_animals')->cascadeOnDelete();
            $table->foreignId('adoption_application_id')->nullable()->constrained('adoption_applications')->nullOnDelete();
            $table->date('follow_up_date');
            $table->string('method'); // chat, call, photo_update, video, home_visit
            $table->string('status')->default('completed'); // scheduled, completed, cancelled
            $table->string('pet_condition')->default('Good'); // Excellent, Good, Fair, Needs Attention
            $table->text('notes');
            $table->string('photo_path')->nullable();
            $table->date('next_follow_up_date')->nullable();
            $table->foreignId('conducted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['shelter_animal_id', 'follow_up_date']);
            $table->index('method');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_adoption_follow_ups');
    }
};
