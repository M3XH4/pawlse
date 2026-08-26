<?php

namespace Database\Seeders;

use App\Enums\NeedPriority;
use App\Enums\NeedStatus;
use App\Models\AnimalDonationNeed;
use App\Models\ShelterAnimal;
use Illuminate\Database\Seeder;

class AnimalDonationNeedSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $luna = ShelterAnimal::where('name', 'Luna')->first();
        $milo = ShelterAnimal::where('name', 'Milo')->first();
        $coco = ShelterAnimal::where('name', 'Coco')->first();
        $bella = ShelterAnimal::where('name', 'Bella')->first();
        $whiskers = ShelterAnimal::where('name', 'Whiskers')->first();

        $needs = [
            [
                'shelter_animal_id' => $luna ? $luna->id : 1,
                'item' => 'Anti-Rabies Vaccine',
                'quantity' => '1 vial',
                'priority' => NeedPriority::High->value,
                'status' => NeedStatus::Open->value,
            ],
            [
                'shelter_animal_id' => $milo ? $milo->id : 2,
                'item' => 'Puppy Kibble',
                'quantity' => '2 bags (5kg)',
                'priority' => NeedPriority::Medium->value,
                'status' => NeedStatus::Open->value,
            ],
            [
                'shelter_animal_id' => $coco ? $coco->id : 5,
                'item' => 'Kitten Formula',
                'quantity' => '3 cans',
                'priority' => NeedPriority::Urgent->value,
                'status' => NeedStatus::Fulfilled->value,
            ],
            [
                'shelter_animal_id' => $bella ? $bella->id : 3,
                'item' => 'Dog Collar & Leash',
                'quantity' => '1 set',
                'priority' => NeedPriority::Medium->value,
                'status' => NeedStatus::Open->value,
            ],
            [
                'shelter_animal_id' => $whiskers ? $whiskers->id : 10,
                'item' => 'Cat Litter (Bentonite)',
                'quantity' => '2 bags (10L)',
                'priority' => NeedPriority::Medium->value,
                'status' => NeedStatus::Open->value,
            ],
        ];

        foreach ($needs as $need) {
            AnimalDonationNeed::create($need);
        }
    }
}
