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
        Schema::create('ai_prediction_logs', function (Blueprint $table) {
            $table->id();
            $table->string('feature');
            $table->json('input_data')->nullable();
            $table->json('output_data')->nullable();
            $table->double('confidence')->nullable();
            $table->boolean('is_accurate')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_prediction_logs');
    }
};
