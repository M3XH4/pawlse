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
        $kokey = ShelterAnimal::where('name', 'Kokey')->first() ?? ShelterAnimal::first();
        $brownie = ShelterAnimal::where('name', 'Brownie')->first() ?? ShelterAnimal::skip(1)->first();
        $elite = ShelterAnimal::where('name', 'Elite')->first() ?? ShelterAnimal::skip(2)->first();
        $beauty = ShelterAnimal::where('name', 'Beauty')->first() ?? ShelterAnimal::skip(3)->first();
        $nadnad = ShelterAnimal::where('name', 'NadNad')->first() ?? ShelterAnimal::skip(4)->first();

        $needs = [
            [
                'shelter_animal_id' => $kokey ? $kokey->id : 1,
                'item' => 'Annual Anti-Rabies & 5-in-1 Vaccine Vial',
                'quantity' => '2 vials',
                'priority' => NeedPriority::High->value,
                'status' => NeedStatus::Open->value,
            ],
            [
                'shelter_animal_id' => $brownie ? $brownie->id : 2,
                'item' => 'Puppy Growth Kibble & Milk Replacer',
                'quantity' => '2 bags (5kg)',
                'priority' => NeedPriority::Medium->value,
                'status' => NeedStatus::Open->value,
            ],
            [
                'shelter_animal_id' => $elite ? $elite->id : 3,
                'item' => 'Nutri-Plus Gel & High-Protein Recovery Supplement',
                'quantity' => '3 tubes',
                'priority' => NeedPriority::Urgent->value,
                'status' => NeedStatus::Open->value,
            ],
            [
                'shelter_animal_id' => $beauty ? $beauty->id : 4,
                'item' => 'Gentle Ocular Saline Wash & Cotton Cleansing Pads',
                'quantity' => '2 sets',
                'priority' => NeedPriority::Medium->value,
                'status' => NeedStatus::Fulfilled->value,
            ],
            [
                'shelter_animal_id' => $nadnad ? $nadnad->id : 5,
                'item' => 'NexGard Spectra (10-15kg) Parasite Protection',
                'quantity' => '2 boxes',
                'priority' => NeedPriority::High->value,
                'status' => NeedStatus::Open->value,
            ],
        ];

        foreach ($needs as $need) {
            AnimalDonationNeed::updateOrCreate(
                [
                    'shelter_animal_id' => $need['shelter_animal_id'],
                    'item' => $need['item'],
                ],
                $need
            );
        }
    }
}
