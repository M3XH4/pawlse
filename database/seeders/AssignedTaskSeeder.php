<?php

namespace Database\Seeders;

use App\Models\AssignedTask;
use App\Models\Event;
use App\Models\FeedingSchedule;
use App\Models\PetReport;
use App\Models\User;
use Illuminate\Database\Seeder;

class AssignedTaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $volunteer = User::where('email', 'volunteer@pawlse.test')->first() ?? User::first();
        $volunteerId = $volunteer ? $volunteer->id : null;

        $event = Event::where('title', 'Weekend Adoption Drive')->first() ?? Event::first();
        $schedule = FeedingSchedule::where('zone', 'like', '%Zone A%')->first() ?? FeedingSchedule::first();
        $petReport = PetReport::where('name', 'Brownie')->first() ?? PetReport::first();

        // 1. Task for Adoption Event
        AssignedTask::create([
            'user_id' => $volunteerId,
            'event_id' => $event ? $event->id : null,
            'role' => 'Adoption Booth Volunteer',
            'status' => 'pending',
            'hours_logged' => 0.00,
        ]);

        // 2. Task for Feeding Schedule
        AssignedTask::create([
            'user_id' => $volunteerId,
            'feeding_schedule_id' => $schedule ? $schedule->id : null,
            'role' => 'Feeder',
            'status' => 'completed',
            'hours_logged' => 2.50,
        ]);

        // 3. Task for Rescue Pet Report
        AssignedTask::create([
            'user_id' => $volunteerId,
            'pet_report_id' => $petReport ? $petReport->id : null,
            'role' => 'Rescue Transporter',
            'status' => 'completed',
            'hours_logged' => 4.00,
        ]);
    }
}
