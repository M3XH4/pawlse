<?php

namespace Database\Seeders;

use App\Models\FrequentProblem;
use App\Models\HelpDeskTicket;
use App\Models\User;
use Illuminate\Database\Seeder;

class HelpDeskSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = User::role('super-admin')->first() ?? User::first();
        $admin = User::role('admin')->first() ?? $superAdmin;
        $volunteer = User::role('volunteer')->first() ?? $admin;
        $user = User::role('user')->first() ?? $admin;

        // Frequent Problems & How to Fix Them
        $frequentProblems = [
            [
                'title' => 'Adoption application status not updating after 48 hours',
                'category' => 'Adoption',
                'problem_description' => 'Adopters often wonder why their adoption application shows "Under Review" for more than 2 business days.',
                'solution' => "1. Check your Adoption Applications tab to see if the shelter requested additional photos or landlord verification.\n2. In-person home assessments and interviews are scheduled in batches by our adoption coordinators.\n3. If 72 hours have passed without contact, submit a support ticket quoting your application reference number so our team can follow up directly.",
                'target_audience' => 'user',
                'is_published' => true,
                'display_order' => 1,
                'helpful_count' => 24,
                'created_by_user_id' => $admin?->id,
            ],
            [
                'title' => 'How to submit proof of donation for GCash or Bank Transfer',
                'category' => 'Donations & Inventory',
                'problem_description' => 'Users making cash donations via QR code or bank transfer need to know how to upload receipts for official verification.',
                'solution' => "1. Go to your Donations tab in the user dashboard.\n2. Locate the donation item marked 'Pending Verification'.\n3. Click 'Upload Proof', attach a clear screenshot of the transaction showing the Reference Number and Date, and submit.\n4. Finance volunteers verify submissions within 24 hours.",
                'target_audience' => 'user',
                'is_published' => true,
                'display_order' => 2,
                'helpful_count' => 19,
                'created_by_user_id' => $admin?->id,
            ],
            [
                'title' => 'Foster pet needs prescription food refill or emergency medication',
                'category' => 'Foster Care',
                'problem_description' => 'Foster parents run out of specialized diet kibble or need urgent refills from shelter inventory.',
                'solution' => "1. Open the My Foster Pets tab in your volunteer dashboard.\n2. Click 'Post Care Update' and check the 'Medical / Supply Request' checkbox.\n3. Indicate the medication or brand needed and current quantity.\n4. Admin inventory will reserve the items at the shelter clinic for pickup within 12 hours.",
                'target_audience' => 'volunteer',
                'is_published' => true,
                'display_order' => 1,
                'helpful_count' => 31,
                'created_by_user_id' => $admin?->id,
            ],
            [
                'title' => 'Unable to attend an assigned feeding route or rescue operation',
                'category' => 'Volunteer Tasks',
                'problem_description' => 'Volunteers facing unexpected schedule conflicts need to hand over duties responsibly.',
                'solution' => "1. Navigate to 'Assigned Tasks' in your volunteer dashboard.\n2. If at least 4 hours before your shift, click 'Request Shift Swap' or submit an urgent ticket here.\n3. The Volunteer Coordinator will dispatch a backup volunteer or reassign your route.\n4. Never abandon a route without notifying coordinators as stray animals depend on scheduled meals.",
                'target_audience' => 'volunteer',
                'is_published' => true,
                'display_order' => 2,
                'helpful_count' => 15,
                'created_by_user_id' => $admin?->id,
            ],
            [
                'title' => 'How admins can request Super Admin approval for role permission changes or system overrides',
                'category' => 'Admin & System Operations',
                'problem_description' => 'Admins requiring elevated access or shelter-wide policy exemptions need a clear audit-logged channel to request Super Admin assistance.',
                'solution' => "1. Go to Admin Help Desk and click 'Ask Super Admin' in the top action bar.\n2. Select 'Admin & System Operations' and provide the target user's email, the required permission, and the operational reason.\n3. Super Admins will review the audit logs and grant permission or provide policy instructions directly in the ticket thread.",
                'target_audience' => 'admin',
                'is_published' => true,
                'display_order' => 1,
                'helpful_count' => 8,
                'created_by_user_id' => $superAdmin?->id,
            ],
            [
                'title' => 'SOS emergency report coordinates mismatch or duplicate reports filed',
                'category' => 'Rescue & SOS',
                'problem_description' => 'Multiple callers report the same injured animal, creating duplicate entries or slightly varied GPS pins.',
                'solution' => "1. Open Rescue Management and use the 'Resolve Duplicate' button to merge secondary reports into the primary case.\n2. Inform the reporting citizen via ticket or SMS that their report has been linked to the ongoing rescue case.\n3. Use the Rescue Map coordinates to direct the nearest field responder.",
                'target_audience' => 'admin',
                'is_published' => true,
                'display_order' => 2,
                'helpful_count' => 12,
                'created_by_user_id' => $admin?->id,
            ],
        ];

        foreach ($frequentProblems as $fpData) {
            FrequentProblem::firstOrCreate(
                ['title' => $fpData['title']],
                $fpData
            );
        }

        // Sample ticket: User inquiry to Admin
        if ($user && $admin) {
            $userTicket = HelpDeskTicket::firstOrCreate(
                ['subject' => 'Question regarding cat adoption home visit schedule'],
                [
                    'ticket_number' => 'HD-2610-0101',
                    'user_id' => $user->id,
                    'category' => 'Adoption',
                    'priority' => 'medium',
                    'status' => 'in_progress',
                    'description' => 'Hi, I submitted an application for adopting Milo (Tabby cat). Can I schedule the home visit on a Saturday morning since I work weekdays?',
                    'target_role' => 'admin',
                    'assigned_to_user_id' => $admin->id,
                ]
            );

            if ($userTicket->replies()->count() === 0) {
                $userTicket->replies()->create([
                    'user_id' => $admin->id,
                    'message' => 'Hello! Yes, Saturday morning visits are available between 9:00 AM and 11:30 AM. Our adoption team will give you a call to confirm the exact time slot.',
                    'is_internal_note' => false,
                ]);
            }
        }

        // Sample ticket: Admin asking Super Admin for answers
        if ($admin && $superAdmin) {
            $adminTicket = HelpDeskTicket::firstOrCreate(
                ['subject' => 'Request guidance on bulk donation tax receipt and NGO partner MOU'],
                [
                    'ticket_number' => 'HD-2610-0202',
                    'user_id' => $admin->id,
                    'category' => 'Admin & System Operations',
                    'priority' => 'high',
                    'status' => 'open',
                    'description' => 'We received an inquiry from a corporate donor wanting to donate 50 sacks of dog kibble with formal tax exemption documentation. Super Admin guidance is requested on the official MOU template and whether we issue the standard certificate of donation.',
                    'target_role' => 'super-admin',
                    'is_escalated' => true,
                    'escalated_to_super_admin_at' => now(),
                    'escalation_reason' => 'Corporate partnership tax documentation policy guidance needed from Super Admin.',
                    'assigned_to_user_id' => $superAdmin->id,
                ]
            );

            if ($adminTicket->replies()->count() === 0) {
                $adminTicket->replies()->create([
                    'user_id' => $superAdmin->id,
                    'message' => 'Hi Admin team! Yes, please use the NGO Partner MOU template stored in Super Admin > File & Resources > Legal Documents. For donations above 20 sacks, issue the stamped Official Certificate of In-Kind Donation.',
                    'is_internal_note' => false,
                ]);
            }
        }
    }
}
