<?php

namespace Database\Seeders;

use App\Enums\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role as PermissionRole;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Platform permissions organized by functional group.
     *
     * @var array<string, array<string, string>>
     */
    public const PERMISSIONS_BY_MODULE = [
        'User Management' => [
            'users.view' => 'View users list and profiles',
            'users.create' => 'Create new user accounts',
            'users.edit' => 'Edit user profiles and roles',
            'users.delete' => 'Archive or delete users',
            'roles.manage' => 'Manage system roles and permission matrix',
        ],
        'Pet Management & Adoption' => [
            'pets.view' => 'Browse and view pet directory',
            'pets.create' => 'List new pets for adoption',
            'pets.edit' => 'Update pet status and profiles',
            'pets.delete' => 'Remove or archive pet records',
            'adoptions.review' => 'Review and process adoption applications',
            'adoptions.manage' => 'Manage all adoption operations and records',
        ],
        'Rescue Operations' => [
            'rescues.view' => 'View rescue alerts and incidents',
            'rescues.create' => 'File new animal rescue reports',
            'rescues.edit' => 'Update rescue situation and timeline',
            'rescues.delete' => 'Archive rescue incident reports',
            'rescues.assign' => 'Assign rescue field missions',
        ],
        'Volunteer Operations' => [
            'volunteers.view' => 'View volunteer applications and roster',
            'volunteers.approve' => 'Approve or decline volunteer applications',
            'volunteers.assign_tasks' => 'Assign volunteer tasks and schedules',
            'volunteers.certify' => 'Issue volunteer certificates and awards',
        ],
        'Donations & Events' => [
            'donations.view' => 'View donation entries and history',
            'donations.manage' => 'Manage animal donation needs and wishlists',
            'donations.export' => 'Export financial and donation reports',
            'events.view' => 'Browse shelter community events',
            'events.manage' => 'Create and manage outreach events',
            'events.approve' => 'Review, approve, or reject proposed outreach events',
        ],
        'Foster Care & Placements' => [
            'foster.view' => 'View foster management dashboard and roster',
            'foster.manage' => 'Assign, transfer, and manage foster home placements',
            'foster.care' => 'Provide foster care and submit care logs',
        ],
        'Partners & Collaborations' => [
            'partners.view' => 'Browse and inspect partner directories',
            'partners.create' => 'Register new clinical and supply partners',
            'partners.edit' => 'Update partner details, contracts, and services',
            'partners.delete' => 'Archive or remove partner records',
        ],
        'File & Resource Management' => [
            'resources.view' => 'Access pet care guides and protocol documents',
            'resources.create' => 'Upload new educational and protocol files',
            'resources.edit' => 'Modify resource details and metadata',
            'resources.delete' => 'Archive or remove resource documents',
        ],
        'Community Recognition' => [
            'community_honor.view' => 'View recognized supporters and public honors',
            'community_honor.create' => 'Add new community honors and achievements',
            'community_honor.edit' => 'Update recognition details and badges',
            'community_honor.delete' => 'Archive or remove recognized records',
        ],
        'Help Desk & Inquiries' => [
            'help_desk.view' => 'Browse support tickets and staff inquiries',
            'help_desk.manage' => 'Manage ticket status, priorities, and assignments',
            'help_desk.reply' => 'Post official replies and internal staff notes',
            'help_desk.delete' => 'Archive or purge support tickets',
        ],
        'Advanced Analytics & Reporting' => [
            'analytics.view' => 'Inspect platform metrics and performance charts',
            'analytics.export' => 'Download analytical reports and audit data',
        ],
        'Blog & Content Management' => [
            'blogs.view' => 'View published and draft blog stories',
            'blogs.create' => 'Publish new shelter and adoption articles',
            'blogs.edit' => 'Edit blog posts and editorial content',
            'blogs.delete' => 'Archive or delete blog stories',
        ],
        'System & Security' => [
            'audit_logs.view' => 'Access system audit trails',
            'archives.manage' => 'Restore or purge archived records',
            'security.view' => 'Inspect login history and security alerts',
            'backup.manage' => 'Run and restore database backups',
            'ai_config.manage' => 'Configure AI features and calibration',
            'settings.manage' => 'Update global application configurations',
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // 1. Create all permissions
        $allPermissionNames = [];
        foreach (self::PERMISSIONS_BY_MODULE as $group => $permissions) {
            foreach ($permissions as $name => $description) {
                Permission::findOrCreate($name, 'web');
                $allPermissionNames[] = $name;
            }
        }

        // 2. Create standard roles
        $superAdminRole = PermissionRole::findOrCreate(Role::SuperAdmin->value, 'web');
        $adminRole = PermissionRole::findOrCreate(Role::Admin->value, 'web');
        $volunteerRole = PermissionRole::findOrCreate(Role::Volunteer->value, 'web');
        $userRole = PermissionRole::findOrCreate(Role::User->value, 'web');

        // 3. Assign permission sets
        $superAdminRole->syncPermissions($allPermissionNames);

        $adminPermissions = [
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'pets.view', 'pets.create', 'pets.edit', 'pets.delete', 'adoptions.review', 'adoptions.manage',
            'rescues.view', 'rescues.create', 'rescues.edit', 'rescues.delete', 'rescues.assign',
            'volunteers.view', 'volunteers.approve', 'volunteers.assign_tasks', 'volunteers.certify',
            'donations.view', 'donations.manage', 'donations.export',
            'events.view', 'events.manage',
            'foster.view', 'foster.manage',
            'partners.view', 'partners.create', 'partners.edit', 'partners.delete',
            'resources.view', 'resources.create', 'resources.edit', 'resources.delete',
            'community_honor.view', 'community_honor.create', 'community_honor.edit', 'community_honor.delete',
            'help_desk.view', 'help_desk.manage', 'help_desk.reply',
            'analytics.view', 'analytics.export',
            'blogs.view', 'blogs.create', 'blogs.edit', 'blogs.delete',
            'audit_logs.view',
        ];
        $adminRole->syncPermissions($adminPermissions);

        $volunteerPermissions = [
            'pets.view',
            'rescues.view', 'rescues.create',
            'events.view',
        ];
        $volunteerRole->syncPermissions($volunteerPermissions);

        $userPermissions = [
            'pets.view',
            'rescues.create',
            'donations.view',
            'events.view',
        ];
        $userRole->syncPermissions($userPermissions);
    }
}
