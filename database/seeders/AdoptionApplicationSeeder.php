<?php

namespace Database\Seeders;

use App\Enums\AdoptionApplicationStatus;
use App\Enums\AdoptionDocumentKind;
use App\Models\AdoptionApplication;
use App\Models\AdoptionApplicationFile;
use App\Models\ShelterAnimal;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdoptionApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'user@pawlse.test')->first() ?? User::first();
        $userId = $user ? $user->id : null;

        $luna = ShelterAnimal::where('name', 'Luna')->first() ?? ShelterAnimal::first();
        $milo = ShelterAnimal::where('name', 'Milo')->first() ?? ShelterAnimal::skip(1)->first();

        // 1. Approved Application for Luna
        $app1 = AdoptionApplication::create([
            'user_id' => $userId,
            'shelter_animal_id' => $luna ? $luna->id : 1,
            'status' => AdoptionApplicationStatus::Approved->value,
            'full_name' => 'Pawlse User',
            'address' => 'Iligan City, Lanao del Norte',
            'phone' => '09123456789',
            'email' => 'user@pawlse.test',
            'birth_date' => '1995-06-15',
            'occupation' => 'Software Engineer',
            'company' => 'Tech Corp',
            'social_media' => 'facebook.com/pawlseuser',
            'status_marital' => 'Single',
            'pronouns' => 'He/Him',
            'adoption_source' => ['Website', 'Social Media'],
            'adopted_before' => false,
            'emergency_name' => 'Jane Doe',
            'emergency_relationship' => 'Sister',
            'emergency_phone' => '09987654321',
            'emergency_email' => 'janedoe@example.com',
            'adoption_preference' => 'Dog',
            'residence_type' => 'House',
            'is_renting' => false,
            'moving_plan' => 'No plans to move in the near future.',
            'lives_with' => ['Sister'],
            'has_allergies' => false,
            'daily_care_handler' => 'Myself',
            'expenses_handler' => 'Myself',
            'emergency_handler' => 'Myself and my sister',
            'hours_alone' => '1-2 hours',
            'introduction_plan' => 'Keep inside a quiet room for the first few days and gradually introduce to other family members.',
            'family_support' => true,
            'family_support_explanation' => 'Yes, everyone is excited to welcome Luna.',
            'current_pets' => false,
            'past_pets' => true,
            'preferred_date' => now()->addDays(2)->format('Y-m-d'),
            'preferred_time' => '10:00:00',
            'can_visit_shelter' => true,
            'notes' => 'Home environment verified. Very promising candidate.',
        ]);

        AdoptionApplicationFile::create([
            'adoption_application_id' => $app1->id,
            'kind' => AdoptionDocumentKind::Id->value,
            'path' => 'adoptions/proofs/user_id.jpg',
            'original_filename' => 'valid_id.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 150000,
        ]);

        AdoptionApplicationFile::create([
            'adoption_application_id' => $app1->id,
            'kind' => AdoptionDocumentKind::LivingRoom->value,
            'path' => 'adoptions/proofs/living_room.jpg',
            'original_filename' => 'living_room.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 300000,
        ]);

        // 2. Pending Application for Milo
        $app2 = AdoptionApplication::create([
            'user_id' => $userId,
            'shelter_animal_id' => $milo ? $milo->id : 2,
            'status' => AdoptionApplicationStatus::Pending->value,
            'full_name' => 'Pawlse User',
            'address' => 'Iligan City, Lanao del Norte',
            'phone' => '09123456789',
            'email' => 'user@pawlse.test',
            'birth_date' => '1995-06-15',
            'occupation' => 'Software Engineer',
            'company' => 'Tech Corp',
            'social_media' => 'facebook.com/pawlseuser',
            'status_marital' => 'Single',
            'pronouns' => 'He/Him',
            'adoption_source' => ['Website'],
            'adopted_before' => false,
            'emergency_name' => 'Jane Doe',
            'emergency_relationship' => 'Sister',
            'emergency_phone' => '09987654321',
            'emergency_email' => 'janedoe@example.com',
            'adoption_preference' => 'Dog',
            'residence_type' => 'Apartment',
            'is_renting' => true,
            'moving_plan' => 'Will find a pet-friendly apartment if moving is required.',
            'lives_with' => ['Alone'],
            'has_allergies' => false,
            'daily_care_handler' => 'Myself',
            'expenses_handler' => 'Myself',
            'emergency_handler' => 'Myself',
            'hours_alone' => '4-6 hours',
            'introduction_plan' => 'Set up a comfortable kennel area in the apartment.',
            'family_support' => true,
            'current_pets' => false,
            'past_pets' => false,
            'preferred_date' => now()->addDays(5)->format('Y-m-d'),
            'preferred_time' => '14:00:00',
            'can_visit_shelter' => true,
        ]);

        AdoptionApplicationFile::create([
            'adoption_application_id' => $app2->id,
            'kind' => AdoptionDocumentKind::Id->value,
            'path' => 'adoptions/proofs/user_id2.jpg',
            'original_filename' => 'valid_id_copy.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 150000,
        ]);
    }
}
