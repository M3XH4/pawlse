<?php

namespace Database\Seeders;

use App\Models\FeedingSchedule;
use Illuminate\Database\Seeder;

class FeedingScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schedules = [
            [
                'zone' => 'Zone A: Public Market Area',
                'latitude' => 8.2286500,
                'longitude' => 124.2412000,
                'day' => 'Every Monday',
                'time' => '08:00 AM',
                'volunteers' => 3,
                'strays' => 15,
                'status' => 'active',
            ],
            [
                'zone' => 'Zone B: Plaza & Central Park',
                'latitude' => 8.2279000,
                'longitude' => 124.2452000,
                'day' => 'Every Wednesday',
                'time' => '04:00 PM',
                'volunteers' => 2,
                'strays' => 8,
                'status' => 'active',
            ],
            [
                'zone' => 'Zone C: Boulevard Waterfront',
                'latitude' => 8.2314000,
                'longitude' => 124.2368000,
                'day' => 'Every Friday',
                'time' => '06:00 AM',
                'volunteers' => 4,
                'strays' => 22,
                'status' => 'active',
            ],
            [
                'zone' => 'Zone D: Highway Bypass (Near Shell)',
                'latitude' => 8.2195000,
                'longitude' => 124.2504000,
                'day' => 'Every Saturday',
                'time' => '09:30 AM',
                'volunteers' => 3,
                'strays' => 12,
                'status' => 'active',
            ],
            [
                'zone' => 'Zone E: Old Port Terminal (Inactive)',
                'latitude' => 8.2342000,
                'longitude' => 124.2335000,
                'day' => 'Every Sunday',
                'time' => '05:00 PM',
                'volunteers' => 1,
                'strays' => 5,
                'status' => 'closed',
            ],
        ];

        foreach ($schedules as $schedule) {
            FeedingSchedule::create($schedule);
        }
    }
}
