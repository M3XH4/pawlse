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
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->foreignId('shelter_animal_id')->nullable()->after('author_id')->constrained('shelter_animals')->nullOnDelete();
            $table->foreignId('adoption_application_id')->nullable()->after('shelter_animal_id')->constrained('adoption_applications')->nullOnDelete();
            $table->unsignedTinyInteger('rating')->nullable()->after('status');
            $table->text('rejection_reason')->nullable()->after('rating');
            $table->foreignId('reviewed_by')->nullable()->after('rejection_reason')->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropForeign(['shelter_animal_id']);
            $table->dropForeign(['adoption_application_id']);
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn([
                'shelter_animal_id',
                'adoption_application_id',
                'rating',
                'rejection_reason',
                'reviewed_by',
                'reviewed_at',
            ]);
        });
    }
};
