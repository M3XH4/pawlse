<?php

namespace Database\Seeders;

use App\Enums\AnimalAgeCategory;
use App\Enums\AnimalGender;
use App\Enums\AnimalType;
use App\Enums\ShelterAnimalStatus;
use App\Models\ShelterAnimal;
use Illuminate\Database\Seeder;

class ShelterAnimalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pets = [
            [
                'name' => 'Luna',
                'type' => AnimalType::Dog,
                'breed' => 'Aspin',
                'age' => '2 yrs',
                'age_category' => AnimalAgeCategory::Young,
                'gender' => AnimalGender::Female,
                'color' => 'Brown',
                'behavior' => 'Friendly, calm',
                'story' => 'Rescued near a market in 2023.',
                'photo_url' => 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800',
                'vaccinated' => true,
                'admitted_at' => now()->subDays(245)->format('Y-m-d'),
                'status' => ShelterAnimalStatus::Available,
            ],
            [
                'name' => 'Milo',
                'type' => AnimalType::Cat,
                'breed' => 'Puspin',
                'age' => '8 mos',
                'age_category' => AnimalAgeCategory::Kitten,
                'gender' => AnimalGender::Male,
                'color' => 'Orange & White',
                'behavior' => 'Playful, energetic',
                'story' => 'Found in a box during a storm.',
                'photo_url' => 'https://cdn.manilastandard.net/wp-content/uploads/2023/01/campus_cats3-750x525.jpg',
                'vaccinated' => true,
                'admitted_at' => now()->subDays(89)->format('Y-m-d'),
                'status' => ShelterAnimalStatus::Available,
            ],
            [
                'name' => 'Bella',
                'type' => AnimalType::Dog,
                'breed' => 'Aspin',
                'age' => '1 yr',
                'age_category' => AnimalAgeCategory::Young,
                'gender' => AnimalGender::Female,
                'color' => 'White',
                'behavior' => 'Shy but sweet',
                'story' => 'Lost pet that was never claimed.',
                'photo_url' => 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
                'vaccinated' => true,
                'admitted_at' => now()->subDays(156)->format('Y-m-d'),
                'status' => ShelterAnimalStatus::Available,
            ],
            [
                'name' => 'Cooper',
                'type' => AnimalType::Dog,
                'breed' => 'Labrador-Mix',
                'age' => '3 yrs',
                'age_category' => AnimalAgeCategory::Adult,
                'gender' => AnimalGender::Male,
                'color' => 'Golden',
                'behavior' => 'Protective, loyal',
                'story' => 'Former guard dog needing love.',
                'photo_url' => 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80',
                'vaccinated' => true,
                'admitted_at' => now()->subDays(432)->format('Y-m-d'),
                'status' => ShelterAnimalStatus::Available,
            ],
            [
                'name' => 'Coco',
                'type' => AnimalType::Cat,
                'breed' => 'Puspin',
                'age' => '1 yr',
                'age_category' => AnimalAgeCategory::Young,
                'gender' => AnimalGender::Female,
                'color' => 'Orange',
                'behavior' => 'Vocal, cuddly',
                'story' => 'Rescued from a drainage pipe.',
                'photo_url' => 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
                'vaccinated' => true,
                'admitted_at' => now()->subDays(178)->format('Y-m-d'),
                'status' => ShelterAnimalStatus::Available,
            ],
            [
                'name' => 'Simba',
                'type' => AnimalType::Cat,
                'breed' => 'Puspin',
                'age' => '6 mos',
                'age_category' => AnimalAgeCategory::Kitten,
                'gender' => AnimalGender::Male,
                'color' => 'Gray',
                'behavior' => 'Adventurous',
                'story' => 'Found wandering in a subdivision.',
                'photo_url' => 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80',
                'vaccinated' => false,
                'admitted_at' => now()->subDays(45)->format('Y-m-d'),
                'status' => ShelterAnimalStatus::Available,
            ],
            [
                'name' => 'Max',
                'type' => AnimalType::Dog,
                'breed' => 'Shih Tzu Mix',
                'age' => '5 yrs',
                'age_category' => AnimalAgeCategory::Senior,
                'gender' => AnimalGender::Male,
                'color' => 'White & Brown',
                'behavior' => 'Gentle, quiet',
                'story' => 'Owner passed away, needs a loving home.',
                'photo_url' => 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&q=80',
                'vaccinated' => true,
                'admitted_at' => now()->subDays(567)->format('Y-m-d'),
                'status' => ShelterAnimalStatus::Available,
            ],
            [
                'name' => 'Daisy',
                'type' => AnimalType::Dog,
                'breed' => 'Aspin',
                'age' => '4 mos',
                'age_category' => AnimalAgeCategory::Puppy,
                'gender' => AnimalGender::Female,
                'color' => 'Brown & White',
                'behavior' => 'Curious, loving',
                'story' => 'Abandoned puppy found near the highway.',
                'photo_url' => 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
                'vaccinated' => true,
                'admitted_at' => now()->subDays(34)->format('Y-m-d'),
                'status' => ShelterAnimalStatus::Available,
            ],
            [
                'name' => 'Charlie',
                'type' => AnimalType::Dog,
                'breed' => 'Beagle Mix',
                'age' => '2 yrs',
                'age_category' => AnimalAgeCategory::Adult,
                'gender' => AnimalGender::Male,
                'color' => 'Tricolor',
                'behavior' => 'Friendly, vocal',
                'story' => 'Rescued from animal hoarder situation.',
                'photo_url' => 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
                'vaccinated' => true,
                'admitted_at' => now()->subDays(298)->format('Y-m-d'),
                'status' => ShelterAnimalStatus::Available,
            ],
            [
                'name' => 'Whiskers',
                'type' => AnimalType::Cat,
                'breed' => 'Puspin',
                'age' => '3 yrs',
                'age_category' => AnimalAgeCategory::Adult,
                'gender' => AnimalGender::Male,
                'color' => 'Black',
                'behavior' => 'Independent, affectionate',
                'story' => 'Street cat that sought shelter during typhoon.',
                'photo_url' => 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&q=80',
                'vaccinated' => false,
                'admitted_at' => now()->subDays(123)->format('Y-m-d'),
                'status' => ShelterAnimalStatus::Available,
            ],
        ];

        foreach ($pets as $pet) {
            ShelterAnimal::create($pet);
        }
    }
}
