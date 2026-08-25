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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category'); // Feeding, Medical, Social, Adoption
            $table->date('date');
            $table->string('time');
            $table->string('location');
            $table->string('img')->nullable();
            $table->integer('spots')->nullable(); // null means unlimited
            $table->text('desc');
            $table->json('keywords')->nullable();
            $table->string('status')->default('open'); // open, closed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
