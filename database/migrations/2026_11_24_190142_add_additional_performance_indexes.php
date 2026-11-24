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
        if (Schema::hasTable('assigned_tasks')) {
            Schema::table('assigned_tasks', function (Blueprint $table): void {
                if (Schema::hasColumns('assigned_tasks', ['user_id', 'status'])) {
                    $table->index(['user_id', 'status'], 'assigned_tasks_user_status_index');
                }
                if (Schema::hasColumns('assigned_tasks', ['event_id', 'status'])) {
                    $table->index(['event_id', 'status'], 'assigned_tasks_event_status_index');
                }
                if (Schema::hasColumns('assigned_tasks', ['feeding_schedule_id', 'status'])) {
                    $table->index(['feeding_schedule_id', 'status'], 'assigned_tasks_feeding_status_index');
                }
            });
        }

        if (Schema::hasTable('events') && Schema::hasColumn('events', 'approval_status')) {
            Schema::table('events', function (Blueprint $table): void {
                $table->index('approval_status', 'events_approval_status_index');
            });
        }

        if (Schema::hasTable('adoption_applications') && Schema::hasColumns('adoption_applications', ['user_id', 'status'])) {
            Schema::table('adoption_applications', function (Blueprint $table): void {
                $table->index(['user_id', 'status'], 'adoption_applications_user_status_index');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('assigned_tasks')) {
            Schema::table('assigned_tasks', function (Blueprint $table): void {
                $table->dropIndex('assigned_tasks_user_status_index');
                $table->dropIndex('assigned_tasks_event_status_index');
                $table->dropIndex('assigned_tasks_feeding_status_index');
            });
        }

        if (Schema::hasTable('events') && Schema::hasColumn('events', 'approval_status')) {
            Schema::table('events', function (Blueprint $table): void {
                $table->dropIndex('events_approval_status_index');
            });
        }

        if (Schema::hasTable('adoption_applications')) {
            Schema::table('adoption_applications', function (Blueprint $table): void {
                $table->dropIndex('adoption_applications_user_status_index');
            });
        }
    }
};
