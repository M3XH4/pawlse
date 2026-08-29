<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'user@pawlse.test')->first();
        $volunteer = User::where('email', 'volunteer@pawlse.test')->first();
        $admin = User::where('email', 'admin@pawlse.test')->first();
        $superAdmin = User::where('email', 'superadmin@pawlse.test')->first();

        // 1. Regular User Notifications
        if ($user) {
            $userNotifications = [
                [
                    'title' => 'Adoption Application Approved',
                    'message' => 'Your adoption application for Bella has been approved. You may proceed with scheduling your shelter visit.',
                    'description' => 'Application for Bella approved.',
                    'url' => route('account.user.adoption-applications'),
                    'icon' => 'adoption',
                    'category' => 'adoption',
                    'read_at' => null, // Unread
                    'created_at' => now()->subMinutes(12),
                ],
                [
                    'title' => 'Donation Verified',
                    'message' => 'Your in-kind donation of 5 bags of puppy kibble (Ref: DON-2026-8910) has been verified and received into inventory.',
                    'description' => 'In-kind donation verified (Ref: DON-2026-8910).',
                    'url' => route('account.user.donations'),
                    'icon' => 'donation',
                    'category' => 'donation',
                    'read_at' => null, // Unread
                    'created_at' => now()->subHours(2),
                ],
                [
                    'title' => 'Rescue Report Status: Under Care',
                    'message' => 'The stray dog reported at Pala-o Market is now admitted for veterinary treatment.',
                    'description' => 'Report at Pala-o Market status: Under Care.',
                    'url' => route('account.user.rescue-reports'),
                    'icon' => 'rescue',
                    'category' => 'rescue',
                    'read_at' => now()->subHours(5), // Read
                    'created_at' => now()->subHours(6),
                ],
                [
                    'title' => 'Volunteer Application Approved',
                    'message' => 'Your volunteer application has been approved. Volunteer dashboard access is now enabled.',
                    'description' => 'Volunteer application approved.',
                    'url' => route('account.volunteer.index'),
                    'icon' => 'volunteer',
                    'category' => 'volunteer',
                    'read_at' => now()->subDays(1), // Read
                    'created_at' => now()->subDays(1),
                ],
                [
                    'title' => 'Account Registration Complete',
                    'message' => 'Your Pawlse account has been successfully verified.',
                    'description' => 'Account verified.',
                    'url' => route('home'),
                    'icon' => 'system',
                    'category' => 'system',
                    'read_at' => now()->subDays(3), // Read
                    'created_at' => now()->subDays(3),
                ],
            ];

            $this->seedNotificationsForUser($user, $userNotifications);
        }

        // 2. Volunteer Notifications
        if ($volunteer) {
            $volunteerNotifications = [
                [
                    'title' => 'Rescue Mission Assigned',
                    'message' => 'You have been assigned to the rescue report at Tibanga Highway (Injured stray cat).',
                    'description' => 'Rescue assignment at Tibanga Highway.',
                    'url' => route('account.volunteer.rescue-reports'),
                    'icon' => 'rescue',
                    'category' => 'rescue',
                    'read_at' => null, // Unread
                    'created_at' => now()->subMinutes(5),
                ],
                [
                    'title' => 'Certificate Issued',
                    'message' => 'Certificate "Outstanding Stray Caregiver Award" (Ref: CERT-2026-PAW88) has been issued.',
                    'description' => 'Certificate issued: Outstanding Stray Caregiver Award.',
                    'url' => route('account.volunteer.certificates'),
                    'icon' => 'certificate',
                    'category' => 'certificate',
                    'read_at' => null, // Unread
                    'created_at' => now()->subHours(1),
                ],
                [
                    'title' => 'Volunteer Task Assigned',
                    'message' => 'You have been assigned the role of Food Carrier for Central Route Feeding Schedule on Saturday 08:00 AM.',
                    'description' => 'Assigned as Food Carrier for Central Route.',
                    'url' => route('account.volunteer.assigned-tasks'),
                    'icon' => 'task',
                    'category' => 'volunteer',
                    'read_at' => now()->subHours(8), // Read
                    'created_at' => now()->subHours(9),
                ],
                [
                    'title' => 'Scheduled Event Reminder',
                    'message' => 'Reminder: Free Rabies Vaccination Drive is scheduled for tomorrow at 09:00 AM at the City Public Plaza.',
                    'description' => 'Vaccination drive event tomorrow.',
                    'url' => route('events'),
                    'icon' => 'event',
                    'category' => 'event',
                    'read_at' => now()->subDays(1), // Read
                    'created_at' => now()->subDays(1),
                ],
            ];

            $this->seedNotificationsForUser($volunteer, $volunteerNotifications);
        }

        // 3. Admin & Super Admin Notifications
        $admins = array_filter([$admin, $superAdmin]);
        foreach ($admins as $targetAdmin) {
            $adminNotifications = [
                [
                    'title' => 'Adoption Application Submitted',
                    'message' => 'Adoption application submitted for Milo by Sarah Johnson.',
                    'description' => 'Application for Milo submitted by Sarah Johnson.',
                    'url' => route('account.admin.adoption-management'),
                    'icon' => 'adoption',
                    'category' => 'adoption',
                    'read_at' => null, // Unread
                    'created_at' => now()->subMinutes(8),
                ],
                [
                    'title' => 'SOS Emergency Report Filed',
                    'message' => 'SOS emergency report submitted for 3 abandoned puppies at Hinaplanon Bridge.',
                    'description' => 'SOS emergency report at Hinaplanon Bridge.',
                    'url' => route('account.admin.rescue-management'),
                    'icon' => 'rescue',
                    'category' => 'rescue',
                    'read_at' => null, // Unread
                    'created_at' => now()->subMinutes(25),
                ],
                [
                    'title' => 'In-Kind Donation Scheduled',
                    'message' => 'In-kind donation drop-off scheduled for 10kg veterinary antiseptic supplies.',
                    'description' => 'In-kind donation drop-off scheduled.',
                    'url' => route('account.admin.donation-monitoring'),
                    'icon' => 'donation',
                    'category' => 'donation',
                    'read_at' => null, // Unread
                    'created_at' => now()->subHours(3),
                ],
                [
                    'title' => 'Volunteer Application Submitted',
                    'message' => 'Volunteer application submitted by David Lee for Rescue Transport Driver.',
                    'description' => 'Volunteer application from David Lee.',
                    'url' => route('account.admin.volunteer-management'),
                    'icon' => 'volunteer',
                    'category' => 'volunteer',
                    'read_at' => now()->subHours(6), // Read
                    'created_at' => now()->subHours(7),
                ],
                [
                    'title' => 'Cash Donation Received',
                    'message' => 'Cash donation of ₱5,000 received via GCash (Ref: DON-9921).',
                    'description' => '₱5,000 cash donation received.',
                    'url' => route('account.admin.donation-monitoring'),
                    'icon' => 'donation',
                    'category' => 'donation',
                    'read_at' => now()->subDays(1), // Read
                    'created_at' => now()->subDays(1),
                ],
                [
                    'title' => 'AI Model Validation Completed',
                    'message' => 'AI prediction calibration completed with 94.2% accuracy on recent reports.',
                    'description' => 'AI validation batch completed.',
                    'url' => route('account.admin.ai-validation'),
                    'icon' => 'ai',
                    'category' => 'system',
                    'read_at' => now()->subDays(2), // Read
                    'created_at' => now()->subDays(2),
                ],
            ];

            $this->seedNotificationsForUser($targetAdmin, $adminNotifications);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $notifications
     */
    private function seedNotificationsForUser(User $user, array $notifications): void
    {
        foreach ($notifications as $data) {
            $user->notifications()->create([
                'id' => (string) Str::uuid(),
                'type' => 'App\\Notifications\\SystemNotification',
                'data' => [
                    'title' => $data['title'],
                    'message' => $data['message'],
                    'description' => $data['description'],
                    'url' => $data['url'],
                    'icon' => $data['icon'],
                    'category' => $data['category'],
                ],
                'read_at' => $data['read_at'],
                'created_at' => $data['created_at'],
                'updated_at' => $data['created_at'],
            ]);
        }
    }
}
