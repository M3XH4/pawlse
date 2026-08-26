<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $events = [
            [
                'title' => 'Weekend Adoption Drive',
                'category' => 'Adoption',
                'date' => now()->addDays(7)->format('Y-m-d'),
                'time' => '09:00 AM - 03:00 PM',
                'location' => 'Robinsons Mall Activity Center',
                'img' => 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600',
                'spots' => 20,
                'desc' => 'Come and meet our lovely adoptable dogs and cats! Get a chance to match with your future best friend.',
                'keywords' => ['adoption', 'pets', 'weekend', 'mall'],
                'status' => 'open',
            ],
            [
                'title' => 'Free Rabies Vaccination Clinic',
                'category' => 'Medical',
                'date' => now()->addDays(3)->format('Y-m-d'),
                'time' => '08:00 AM - 12:00 PM',
                'location' => 'Pawlse Shelter Grounds',
                'img' => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600',
                'spots' => 50,
                'desc' => 'We are providing free anti-rabies vaccinations for up to 50 local stray and community animals.',
                'keywords' => ['vaccination', 'medical', 'rabies', 'free'],
                'status' => 'open',
            ],
            [
                'title' => 'Community Stray Feeding Drive',
                'category' => 'Feeding',
                'date' => now()->addDays(12)->format('Y-m-d'),
                'time' => '06:00 AM - 09:00 AM',
                'location' => 'Zone C: Boulevard Waterfront',
                'img' => 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?q=80&w=600',
                'spots' => null, // unlimited
                'desc' => 'Join us as we hand out meals and clean water to stray animals along the Boulevard Zone.',
                'keywords' => ['feeding', 'stray', 'volunteer', 'boulevard'],
                'status' => 'open',
            ],
            [
                'title' => 'Responsible Pet Ownership Seminar',
                'category' => 'Social',
                'date' => now()->subDays(15)->format('Y-m-d'),
                'time' => '02:00 PM - 05:00 PM',
                'location' => 'City Hall Conference Hall',
                'img' => 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600',
                'spots' => 100,
                'desc' => 'A seminar highlighting the basic requirements, laws, and best practices for raising domestic pets.',
                'keywords' => ['seminar', 'education', 'pet-care', 'social'],
                'status' => 'closed',
            ],
        ];

        foreach ($events as $event) {
            Event::create($event);
        }
    }
}
