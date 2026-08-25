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
                'photo_url' => 'https://cdn.britannica.com/70/234870-050-D4D024BB/Orange-colored-cat-yawns-displaying-teeth.jpg?w=300',
                'vaccinated' => true,
                'admitted_at' => now()->subDays(245)->format('Y-m-d'),
                'status' => ShelterAnimalStatus::Available,
            ],
            [
                'name' => 'Milo',
                'type' => AnimalType::Dog,
                'breed' => 'Aspin-Mix',
                'age' => '8 mos',
                'age_category' => AnimalAgeCategory::Puppy,
                'gender' => AnimalGender::Male,
                'color' => 'Black & White',
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
                'photo_url' => 'https://news.orvis.com/wp-content/uploads/2019/08/stray.jpg',
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
                'photo_url' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCPacSaJWfPdtLtxmEeD2ZbNxtn2n12DMziQ&s',
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
                'photo_url' => 'https://images.ctfassets.net/mrbo2ykgx5lt/32670/23cb097f16b30963b5be00e22c848d36/frontiers-psychology-stray-dogs-human-cues-behavior.jpg',
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
                'photo_url' => 'https://tnrireland.ie/wp-content/uploads/ngg_featured/tc01.jpg',
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
                'photo_url' => 'https://th-thumbnailer.cdn-si-edu.com/nSG89vchaPYMu-swpgA0RmIJZA4=/1280x720/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer/Surprising-Science-Feral-Cats-631.jpg',
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
                'photo_url' => 'https://www.thespruce.com/thmb/PrfluQWFB8RhXABxIUeN5nNHrIo=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/discourage-feral-cats-386479-hero-50eeb16535844e75853d52720baeaec5.jpg',
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
                'photo_url' => 'https://www.funpawcare.com/wp-content/uploads/2013/03/IMAG2691.jpg',
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
                'photo_url' => 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202508/order-to-remove-all-delhi-street-dogs-sparks-outcry-from-animal-welfare-groups-113703314-16x9_0.jpg?VersionId=ed0u.hul0.ib0yhgCKasG_hK2zBwCHLS&size=690:388',
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
