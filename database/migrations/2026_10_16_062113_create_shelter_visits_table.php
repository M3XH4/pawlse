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
        Schema::create('shelter_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('full_name');
            $table->string('contact_number');
            $table->string('email')->nullable();
            $table->date('preferred_date');
            $table->string('preferred_time_slot')->nullable();
            $table->unsignedInteger('number_of_visitors')->default(1);
            $table->string('purpose');
            $table->foreignId('shelter_animal_id')->nullable()->constrained('shelter_animals')->nullOnDelete();
            $table->text('additional_notes')->nullable();
            $table->string('status')->default('pending'); // pending, confirmed, completed, cancelled
            $table->date('confirmed_date')->nullable();
            $table->string('confirmed_time_slot')->nullable();
            $table->text('admin_notes')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('preferred_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shelter_visits');
    }
};
