<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('animal_donation_needs')->whereRaw('LOWER(priority) = ?', ['urgent'])->update(['priority' => 'Urgent']);
        DB::table('animal_donation_needs')->whereRaw('LOWER(priority) = ?', ['high'])->update(['priority' => 'High']);
        DB::table('animal_donation_needs')->whereRaw('LOWER(priority) = ?', ['medium'])->update(['priority' => 'Medium']);
        DB::table('animal_donation_needs')->whereRaw('LOWER(priority) = ?', ['low'])->update(['priority' => 'Low']);
        DB::table('animal_donation_needs')->whereRaw('LOWER(status) = ?', ['open'])->update(['status' => 'open']);
        DB::table('animal_donation_needs')->whereRaw('LOWER(status) = ?', ['fulfilled'])->update(['status' => 'fulfilled']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
