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
        Schema::table('shelter_animals', function (Blueprint $table) {
            $table->string('breed')->nullable()->after('type');
            $table->string('age_category')->nullable()->after('age');
            $table->string('gender')->nullable()->after('age_category');
            $table->string('color')->nullable()->after('gender');
            $table->string('behavior')->nullable()->after('color');
            $table->text('story')->nullable()->after('behavior');
            $table->boolean('vaccinated')->default(false)->after('story');
            $table->date('admitted_at')->nullable()->after('vaccinated');
            $table->string('status')->default('available')->after('admitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shelter_animals', function (Blueprint $table) {
            $table->dropColumn([
                'breed',
                'age_category',
                'gender',
                'color',
                'behavior',
                'story',
                'vaccinated',
                'admitted_at',
                'status',
            ]);
        });
    }
};
