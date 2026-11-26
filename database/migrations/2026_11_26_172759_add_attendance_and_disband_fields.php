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
        Schema::table('assigned_tasks', function (Blueprint $table): void {
            if (! Schema::hasColumn('assigned_tasks', 'completed_at')) {
                $table->timestamp('completed_at')->nullable()->after('hours_logged');
            }
            if (! Schema::hasColumn('assigned_tasks', 'attendance_marked_by')) {
                $table->foreignId('attendance_marked_by')->nullable()->after('completed_at')->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('assigned_tasks', 'attendance_marked_at')) {
                $table->timestamp('attendance_marked_at')->nullable()->after('attendance_marked_by');
            }
        });

        Schema::table('events', function (Blueprint $table): void {
            if (! Schema::hasColumn('events', 'disbanded_at')) {
                $table->timestamp('disbanded_at')->nullable()->after('approved_at');
            }
        });

        Schema::table('feeding_schedules', function (Blueprint $table): void {
            if (! Schema::hasColumn('feeding_schedules', 'disbanded_at')) {
                $table->timestamp('disbanded_at')->nullable()->after('completed_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assigned_tasks', function (Blueprint $table): void {
            if (Schema::hasColumn('assigned_tasks', 'attendance_marked_by')) {
                $table->dropConstrainedForeignId('attendance_marked_by');
            }
            $columns = array_filter(
                ['completed_at', 'attendance_marked_at'],
                fn (string $col): bool => Schema::hasColumn('assigned_tasks', $col)
            );
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });

        Schema::table('events', function (Blueprint $table): void {
            if (Schema::hasColumn('events', 'disbanded_at')) {
                $table->dropColumn('disbanded_at');
            }
        });

        Schema::table('feeding_schedules', function (Blueprint $table): void {
            if (Schema::hasColumn('feeding_schedules', 'disbanded_at')) {
                $table->dropColumn('disbanded_at');
            }
        });
    }
};
