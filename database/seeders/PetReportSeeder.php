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
            'path' => 'reports/stray_dog_1.jpg',
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
            'path' => 'reports/stray_cat_1.jpg',
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
            'path' => 'reports/trash_1.jpg',
            'original_filename' => 'trash_1.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 78000,
        ]);
    }
}
