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
        Schema::create('rehoming_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('full_name');
            $table->string('contact_number');
            $table->string('email');
            $table->string('animal_name');
            $table->string('species')->default('Dog'); // Dog, Cat, Other
            $table->string('breed')->nullable();
            $table->string('gender')->default('Unknown'); // Male, Female, Unknown
            $table->string('age')->nullable();
            $table->string('current_location');
            $table->string('reason'); // Moving, Allergies, Financial, Time, Rescued stray, Other
            $table->text('health_notes')->nullable();
            $table->text('description')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('status')->default('pending'); // pending, reviewed, posted, home_found, declined
            $table->text('admin_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('species');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rehoming_requests');
    }
};
