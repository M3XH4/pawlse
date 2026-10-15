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
        Schema::create('resource_files', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category')->default('general'); // care_guide, boarding, insurance, training, memorial, portrait, emergency_protocol, general
            $table->string('badge')->nullable(); // COMMUNITY DIRECTORY, INFORMATIONAL RESOURCE, COMMUNITY RESOURCE
            $table->text('description')->nullable();
            $table->text('content')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_size')->nullable();
            $table->string('file_type')->nullable(); // pdf, docx, guide, link
            $table->string('external_url')->nullable();
            $table->string('image_url')->nullable();
            $table->unsignedInteger('download_count')->default(0);
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
        Schema::dropIfExists('resource_files');
    }
};
