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
            if (! Schema::hasColumn('feeding_schedules', 'feeding_sponsorship_id')) {
                $table->foreignId('feeding_sponsorship_id')->nullable()->after('completed_by_user_id')->constrained('feeding_sponsorships')->nullOnDelete();
            }
            if (! Schema::hasColumn('feeding_schedules', 'food_packs_allocated')) {
                $table->unsignedInteger('food_packs_allocated')->nullable()->after('total_food_distributed');
            }
        });

        Schema::table('feeding_sponsorships', function (Blueprint $table): void {
            if (! Schema::hasColumn('feeding_sponsorships', 'packs_distributed')) {
                $table->unsignedInteger('packs_distributed')->default(0)->after('amount');
            }
            if (! Schema::hasColumn('feeding_sponsorships', 'strays_fed')) {
                $table->unsignedInteger('strays_fed')->default(0)->after('packs_distributed');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feeding_schedules', function (Blueprint $table): void {
            if (Schema::hasColumn('feeding_schedules', 'feeding_sponsorship_id')) {
                $table->dropConstrainedForeignId('feeding_sponsorship_id');
            }
            if (Schema::hasColumn('feeding_schedules', 'food_packs_allocated')) {
                $table->dropColumn('food_packs_allocated');
            }
        });

        Schema::table('feeding_sponsorships', function (Blueprint $table): void {
            $columns = array_filter(
                ['packs_distributed', 'strays_fed'],
                fn (string $col): bool => Schema::hasColumn('feeding_sponsorships', $col)
            );
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
