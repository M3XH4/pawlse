<?php

namespace Database\Seeders;

use App\Models\AiPredictionLog;
use App\Models\PetReport;
use App\Models\PetReportPhoto;
use App\Models\User;
use Illuminate\Database\Seeder;

class PetReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'user@pawlse.test')->first() ?? User::first();
        $userId = $user ? $user->id : null;

        $volunteer = User::where('email', 'volunteer@pawlse.test')->first();
        $volunteerId = $volunteer ? $volunteer->id : null;

        // 1. Create AI Prediction Log for a stray report
        $log1 = AiPredictionLog::create([
            'feature' => 'pet_report_validation',
            'input_data' => ['image' => 'reports/stray_dog_1.jpg', 'location' => '8.224, 124.241'],
            'output_data' => ['label' => 'Dog', 'is_animal' => true, 'breed' => 'Aspin', 'color' => 'Brown'],
            'confidence' => 0.92,
            'is_accurate' => true,
        ]);

        $log2 = AiPredictionLog::create([
            'feature' => 'pet_report_validation',
            'input_data' => ['image' => 'reports/stray_cat_1.jpg', 'location' => '8.228, 124.244'],
            'output_data' => ['label' => 'Cat', 'is_animal' => true, 'breed' => 'Puspin', 'color' => 'Black & White'],
            'confidence' => 0.88,
            'is_accurate' => true,
        ]);

        $log3 = AiPredictionLog::create([
            'feature' => 'pet_report_validation',
            'input_data' => ['image' => 'reports/trash_1.jpg', 'location' => '8.219, 124.238'],
            'output_data' => ['label' => 'Object', 'is_animal' => false],
            'confidence' => 0.95,
            'is_accurate' => true,
        ]);

        // 2. Create Pet Reports
        $report1 = PetReport::create([
            'user_id' => $userId,
            'type' => 'rescue',
            'status' => 'assigned',
            'animal_type' => 'Dog',
            'breed' => 'Aspin',
            'age_category' => 'Adult',
            'gender' => 'Male',
            'name' => 'Brownie',
            'color' => 'Brown',
            'last_seen_date' => now()->subDays(2),
            'description' => 'A brown dog wandering near the public market looking skinny and hungry.',
            'location' => '8.224, 124.241 (Near Public Market)',
            'contact_name' => 'John Doe',
            'contact_phone' => '09123456789',
            'contact_email' => 'user@pawlse.test',
            'assigned_volunteer_id' => $volunteerId,
            'ai_prediction_log_id' => $log1->id,
            'ai_validation_status' => 'approved',
        ]);

        PetReportPhoto::create([
            'pet_report_id' => $report1->id,
            'path' => 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
            'original_filename' => 'stray_dog_1.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 124500,
        ]);

        $report2 = PetReport::create([
            'user_id' => $userId,
            'type' => 'sos',
            'status' => 'pending',
            'animal_type' => 'Cat',
            'breed' => 'Puspin',
            'age_category' => 'Kitten',
            'gender' => 'Unknown',
            'name' => 'Stray Cat',
            'color' => 'Black & White',
            'last_seen_date' => now()->subHours(6),
            'urgency' => 'high',
            'situation_type' => 'Injured',
            'description' => 'A small kitten limping and unable to walk, hidden behind the trash bin near the school.',
            'location' => '8.228, 124.244 (Behind City High School)',
            'contact_name' => 'John Doe',
            'contact_phone' => '09123456789',
            'contact_email' => 'user@pawlse.test',
            'ai_prediction_log_id' => $log2->id,
            'ai_validation_status' => 'approved',
        ]);

        PetReportPhoto::create([
            'pet_report_id' => $report2->id,
            'path' => 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
            'original_filename' => 'stray_cat_1.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 98500,
        ]);

        // A duplicate or spam report that was rejected by AI/Admin
        $report3 = PetReport::create([
            'user_id' => $userId,
            'type' => 'rescue',
            'status' => 'cancelled',
            'animal_type' => 'Other',
            'description' => 'Image contains trash, not a stray animal.',
            'location' => '8.219, 124.238 (Boulevard Trash Bin)',
            'contact_name' => 'John Doe',
            'ai_prediction_log_id' => $log3->id,
            'ai_validation_status' => 'rejected',
        ]);

        PetReportPhoto::create([
            'pet_report_id' => $report3->id,
            'path' => 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
            'original_filename' => 'trash_1.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 78000,
        ]);

        // 3. Create Missing Pet Reports
        $missingReports = [
            [
                'name' => 'Bamba',
                'animal_type' => 'Dog',
                'breed' => 'Aspin (Mixed Breed)',
                'age_category' => 'Adult',
                'gender' => 'Male',
                'color' => 'Brown with white patches',
                'size' => 'Medium',
                'reward' => '2000',
                'medical_conditions' => 'None',
                'status' => 'open',
                'location' => 'Tambo Market Area, Iligan City',
                'last_seen_date' => now()->subDays(3),
                'description' => 'Very friendly and responds to his name. Wearing a blue collar with a bell. Has a small scar above his right eye.',
                'contact_name' => 'Maria Santos',
                'contact_phone' => '0917 123 4567',
                'contact_email' => 'maria.santos@email.com',
                'photo' => 'https://plus.unsplash.com/premium_photo-1666777247416-ee7a95235559?w=500&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Mimi',
                'animal_type' => 'Cat',
                'breed' => 'Puspin (Domestic Shorthair)',
                'age_category' => 'Young',
                'gender' => 'Female',
                'color' => 'Calico',
                'size' => 'Small',
                'reward' => null,
                'medical_conditions' => 'Needs daily asthma inhaler checkup',
                'status' => 'resolved',
                'location' => 'Tibanga Near 7-Eleven, Iligan City',
                'last_seen_date' => now()->subHours(12),
                'description' => 'Friendly calico cat with distinct orange and black patches. Wearing a small green collar with contact capsule.',
                'contact_name' => 'Carlo Mendoza',
                'contact_phone' => '0918 234 5678',
                'contact_email' => 'carlo.mendoza@email.com',
                'photo' => 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Sherlock',
                'animal_type' => 'Dog',
                'breed' => 'Golden Retriever Mix',
                'age_category' => 'Adult',
                'gender' => 'Male',
                'color' => 'Golden',
                'size' => 'Large',
                'reward' => '3000',
                'medical_conditions' => 'Sensitive stomach, requires special diet',
                'status' => 'open',
                'location' => 'Suarez Heights, Iligan City',
                'last_seen_date' => now()->subHours(6),
                'description' => 'Energetic and friendly golden dog. Responds to whistling and his name. Wearing a dark leather collar.',
                'contact_name' => 'Anna Lim',
                'contact_phone' => '0919 345 6789',
                'contact_email' => 'anna.lim@email.com',
                'photo' => 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Sparky',
                'animal_type' => 'Cat',
                'breed' => 'Puspin',
                'age_category' => 'Kitten',
                'gender' => 'Male',
                'color' => 'Brown Tabby',
                'size' => 'Small',
                'reward' => '1000',
                'medical_conditions' => 'None',
                'status' => 'open',
                'location' => 'Iligan City Public Plaza',
                'last_seen_date' => now()->subDays(7),
                'description' => 'Small tabby kitten with white paws and large ears. Very timid around loud crowds, may hide under parked cars.',
                'contact_name' => 'Roberto Garcia',
                'contact_phone' => '0920 456 7890',
                'contact_email' => 'roberto.garcia@email.com',
                'photo' => 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Luna',
                'animal_type' => 'Cat',
                'breed' => 'Persian Mix',
                'age_category' => 'Young',
                'gender' => 'Female',
                'color' => 'White with gray spots',
                'size' => 'Small',
                'reward' => '1500',
                'medical_conditions' => 'Allergic to standard flea collars',
                'status' => 'open',
                'location' => 'Mahayahay Area, Iligan City',
                'last_seen_date' => now()->subDays(2),
                'description' => 'Indoor cat who escaped through an open window. Wearing a pink collar with her name tag. Very fluffy.',
                'contact_name' => 'Sarah Reyes',
                'contact_phone' => '0921 567 8901',
                'contact_email' => 'sarah.reyes@email.com',
                'photo' => 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=500&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Whiskers',
                'animal_type' => 'Cat',
                'breed' => 'Tabby Mix',
                'age_category' => 'Adult',
                'gender' => 'Male',
                'color' => 'Gray with black stripes',
                'size' => 'Medium',
                'reward' => null,
                'medical_conditions' => 'Missing a tiny tip of his left ear from previous TNR',
                'status' => 'open',
                'location' => 'Pala-o Market, Iligan City',
                'last_seen_date' => now()->subHours(18),
                'description' => 'Spotted near the fish section. Friendly and vocal, missing a tiny tip of his left ear.',
                'contact_name' => 'Mark Dela Cruz',
                'contact_phone' => '0922 678 9012',
                'contact_email' => 'mark.delacruz@email.com',
                'photo' => 'https://images.unsplash.com/photo-1503777119540-ce54b422baff?w=500&auto=format&fit=crop&q=80',
            ],
        ];

        foreach ($missingReports as $data) {
            $photoUrl = $data['photo'];
            unset($data['photo']);

            $data['user_id'] = $userId;
            $data['type'] = 'missing';
            $data['urgency'] = 'medium';
            $data['situation_type'] = 'Lost';
            $data['ai_validation_status'] = 'approved';

            $report = PetReport::updateOrCreate(
                ['name' => $data['name'], 'type' => 'missing'],
                $data
            );

            PetReportPhoto::updateOrCreate(
                ['pet_report_id' => $report->id],
                [
                    'path' => $photoUrl,
                    'original_filename' => strtolower($data['name']).'.jpg',
                    'mime_type' => 'image/jpeg',
                    'file_size' => 115000,
                ]
            );
        }
    }
}
