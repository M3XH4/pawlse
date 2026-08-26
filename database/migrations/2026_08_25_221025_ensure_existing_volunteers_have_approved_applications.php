<?php

use App\Enums\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Wrap in a table check to be safe
        if (Schema::hasTable('users') && Schema::hasTable('volunteer_applications')) {
            $volunteers = DB::table('users')
                ->where('role', Role::Volunteer->value)
                ->get();

            foreach ($volunteers as $volunteer) {
                $hasApprovedApplication = DB::table('volunteer_applications')
                    ->where('user_id', $volunteer->id)
                    ->where('status', 'approved')
                    ->exists();

                if (! $hasApprovedApplication) {
                    DB::table('volunteer_applications')->insert([
                        'user_id' => $volunteer->id,
                        'full_name' => $volunteer->name,
                        'mobile' => '09123456789',
                        'email' => $volunteer->email,
                        'address' => 'Iligan City',
                        'role' => 'Feeding Route Volunteer',
                        'why' => 'I want to help stray animals (auto-created via migration).',
                        'experience' => 'Seeded volunteer.',
                        'status' => 'approved',
                        'reference_number' => 'VOL-'.time().'-'.random_int(100, 999).'-'.$volunteer->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse action needed for data migration
    }
};
