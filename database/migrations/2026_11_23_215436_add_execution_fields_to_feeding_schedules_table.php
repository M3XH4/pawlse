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
        Schema::table('feeding_schedules', function (Blueprint $table): void {
            $table->string('execution_status')->default('scheduled')->after('status');
            $table->timestamp('started_at')->nullable()->after('execution_status');
            $table->foreignId('started_by_user_id')->nullable()->after('started_at')->constrained('users')->nullOnDelete();
            $table->timestamp('completed_at')->nullable()->after('started_by_user_id');
            $table->foreignId('completed_by_user_id')->nullable()->after('completed_at')->constrained('users')->nullOnDelete();
            $table->unsignedInteger('total_food_distributed')->default(0)->after('completed_by_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feeding_schedules', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('started_by_user_id');
            $table->dropConstrainedForeignId('completed_by_user_id');
            $table->dropColumn([
                'execution_status',
                'started_at',
                'completed_at',
                'total_food_distributed',
            ]);
        });
    }
};
