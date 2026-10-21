<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('assigned_tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->string('guest_name')->nullable()->after('user_id');
            $table->string('guest_email')->nullable()->after('guest_name');
            $table->string('guest_phone')->nullable()->after('guest_email');
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->string('role')->default('Volunteer')->after('event_id');
            $table->string('guest_name')->nullable()->after('role');
            $table->string('guest_email')->nullable()->after('guest_name');
        });

        // Clean up legacy seeded status='open' and unlinked ai_validation_status or dummy seeded 'pet_report_validation' logs
        DB::table('pet_reports')
            ->where('status', 'open')
            ->update(['status' => 'pending']);

        DB::table('pet_reports')
            ->whereNull('ai_prediction_log_id')
            ->whereNotNull('ai_validation_status')
            ->update(['ai_validation_status' => null]);

        $dummyLogIds = DB::table('ai_prediction_logs')
            ->where('feature', 'pet_report_validation')
            ->pluck('id');

        if ($dummyLogIds->isNotEmpty()) {
            DB::table('pet_reports')
                ->whereIn('ai_prediction_log_id', $dummyLogIds)
                ->update([
                    'ai_prediction_log_id' => null,
                    'ai_validation_status' => null,
                ]);

            // Remove duplicate seeded reports created by multiple PetReportSeeder runs
            $keepIds = DB::table('pet_reports')
                ->whereIn('name', ['Brownie', 'Stray Cat'])
                ->selectRaw('MIN(id) as id')
                ->groupBy('name', 'type')
                ->pluck('id');

            DB::table('pet_reports')
                ->whereIn('name', ['Brownie', 'Stray Cat'])
                ->whereNotIn('id', $keepIds)
                ->delete();

            DB::table('pet_reports')
                ->where('description', 'Image contains trash, not a stray animal.')
                ->delete();

            DB::table('ai_prediction_logs')
                ->whereIn('id', $dummyLogIds)
                ->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropColumn(['role', 'guest_name', 'guest_email']);
        });

        Schema::table('assigned_tasks', function (Blueprint $table) {
            $table->dropColumn(['guest_name', 'guest_email', 'guest_phone']);
        });
    }
};
