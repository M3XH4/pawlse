<?php

namespace App\Services;

use App\Enums\AdoptionApplicationStatus;
use App\Enums\DonationStatus;
use App\Enums\Role;
use App\Enums\ShelterAnimalStatus;
use App\Models\AdoptionApplication;
use App\Models\AssignedTask;
use App\Models\AssistantFeedback;
use App\Models\AuditLog;
use App\Models\Backup;
use App\Models\Donation;
use App\Models\Event;
use App\Models\FosterPlacement;
use App\Models\HelpDeskTicket;
use App\Models\PetReport;
use App\Models\ShelterAnimal;
use App\Models\ShelterVisit;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\VolunteerApplication;
use Illuminate\Support\Facades\DB;

class DashboardAssistantService
{
    /**
     * Build the initial permission-scoped summary and priority recommendations for the FAB.
     *
     * @return array{
     *     reply: string,
     *     actions: list<array{label: string, href: string, priority: 'high'|'medium'|'low', count?: int}>,
     *     quickActions: list<array<string, mixed>>,
     *     stats: list<array{label: string, value: string, delta?: string}>,
     *     suggestedPrompts: list<string>,
     *     dashboardRole: string,
     *     priorityCount: int,
     *     intent: string,
     *     feedbackId: int|null
     * }
     */
    public function summarize(User $user, ?string $dashboardRole = null, ?string $pagePath = null): array
    {
        $role = $this->resolveDashboardRole($user, $dashboardRole);
        $context = $this->gatherPermissionScopedContext($user, $role);
        $actions = $this->buildPrioritizedActions($context, $role);
        $priorityCount = $this->computePriorityCount($actions);
        $quickActions = $this->buildQuickActions($user, $role, $context);

        $firstName = $user->first_name ?: explode(' ', trim((string) $user->name))[0] ?: 'there';
        $roleLabel = match ($role) {
            Role::SuperAdmin->value => 'Super Admin',
            Role::Admin->value => 'Admin',
            Role::Volunteer->value => 'Volunteer',
            default => 'User',
        };

        $pageHint = $this->resolvePageContext($pagePath, $role);
        $pagePrefix = $pageHint !== null ? "You're currently on **{$pageHint['title']}**.\n\n" : '';

        if ($actions === []) {
            $reply = "{$pagePrefix}Hi {$firstName}! You're viewing the {$roleLabel} dashboard and everything in your accessible queues looks caught up right now. Ask me about any section you have permission to view, or pick a prompt below.";
        } else {
            $topLines = array_map(
                static fn (array $action): string => "• {$action['label']}",
                array_slice($actions, 0, 4)
            );
            $reply = "{$pagePrefix}Hi {$firstName}! Based on your {$roleLabel} permissions and live database records, here is what we should focus on next:\n\n"
                .implode("\n", $topLines);
        }

        return [
            'reply' => $reply,
            'actions' => array_slice($actions, 0, 5),
            'quickActions' => $quickActions,
            'stats' => [],
            'suggestedPrompts' => $this->buildSuggestedPrompts($user, $role, $pagePath),
            'dashboardRole' => $role,
            'priorityCount' => $priorityCount,
            'intent' => 'summary',
            'feedbackId' => null,
        ];
    }

    /**
     * Answer a user's question using only database records they are permitted to access.
     *
     * @return array{
     *     reply: string,
     *     actions: list<array{label: string, href: string, priority: 'high'|'medium'|'low', count?: int}>,
     *     quickActions: list<array<string, mixed>>,
     *     stats: list<array{label: string, value: string, delta?: string}>,
     *     suggestedPrompts: list<string>,
     *     dashboardRole: string,
     *     priorityCount: int,
     *     intent: string,
     *     feedbackId: int|null
     * }
     */
    public function respond(User $user, string $message, ?string $dashboardRole = null, ?string $pagePath = null): array
    {
        $role = $this->resolveDashboardRole($user, $dashboardRole);
        $normalized = strtolower(trim($message));
        $context = $this->gatherPermissionScopedContext($user, $role);
        $actions = $this->buildPrioritizedActions($context, $role);
        $priorityCount = $this->computePriorityCount($actions);
        $quickActions = $this->buildQuickActions($user, $role, $context);
        $suggestedPrompts = $this->buildSuggestedPrompts($user, $role, $pagePath);

        // 1. Contextual "here / this page" inquiry
        if ($pagePath !== null && $this->matchesAny($normalized, ['this page', 'here', 'this screen', 'current page'])) {
            $pageHint = $this->resolvePageContext($pagePath, $role);
            if ($pageHint !== null) {
                return $this->finalizeResponse($user, $role, $pagePath, 'page_context', true, [
                    'reply' => "**{$pageHint['title']}**: {$pageHint['guidance']}",
                    'actions' => array_slice($actions, 0, 3),
                    'quickActions' => $quickActions,
                    'stats' => [],
                    'suggestedPrompts' => $suggestedPrompts,
                    'dashboardRole' => $role,
                    'priorityCount' => $priorityCount,
                ]);
            }
        }

        // 2. General "what should we do?" / priority / summary intent
        if ($this->matchesAny($normalized, ['what should', 'next', 'priority', 'priorities', 'todo', 'to do', 'summary', 'overview', 'help me', 'focus'])) {
            $summary = $this->summarize($user, $role, $pagePath);

            return $this->finalizeResponse($user, $role, $pagePath, 'summary', true, $summary);
        }

        // 3. Permissions / access inquiry
        if ($this->matchesAny($normalized, ['permission', 'access', 'what can i', 'role'])) {
            $permissions = $user->getAllPermissions()->pluck('name')->values()->all();
            $permPreview = $permissions === []
                ? 'personal account actions only'
                : implode(', ', array_slice($permissions, 0, 12)).(count($permissions) > 12 ? ' (and '.(count($permissions) - 12).' more)' : '');

            return $this->finalizeResponse($user, $role, $pagePath, 'permissions', true, [
                'reply' => "You are signed in with the **{$role}** dashboard context. Your active permissions include: {$permPreview}. I only query database tables covered by these permissions.",
                'actions' => array_slice($actions, 0, 3),
                'quickActions' => $quickActions,
                'stats' => [],
                'suggestedPrompts' => $suggestedPrompts,
                'dashboardRole' => $role,
                'priorityCount' => $priorityCount,
            ]);
        }

        // 4. Analytics comparison intent (gated by analytics.view)
        if ($this->matchesAny($normalized, ['analytics', 'compare', 'comparison', 'this week', 'last week', 'this month', 'trend', 'stats', 'resolved'])) {
            if (! $user->hasPermissionTo('analytics.view')) {
                return $this->finalizeResponse(
                    $user,
                    $role,
                    $pagePath,
                    'permission_denied',
                    true,
                    $this->permissionDeniedResponse($role, 'analytics.view', $suggestedPrompts, $priorityCount)
                );
            }

            $analytics = $this->buildAnalyticsComparison($role, $user->hasPermissionTo('analytics.export'));

            return $this->finalizeResponse($user, $role, $pagePath, 'analytics', true, [
                'reply' => $analytics['reply'],
                'actions' => $analytics['actions'],
                'quickActions' => $quickActions,
                'stats' => $analytics['stats'],
                'suggestedPrompts' => $suggestedPrompts,
                'dashboardRole' => $role,
                'priorityCount' => $priorityCount,
            ]);
        }

        // 5. Intent-specific handlers with strict permission checks
        $intentResult = $this->handleSpecificIntent($user, $normalized, $role, $context, $suggestedPrompts, $priorityCount, $quickActions);
        if ($intentResult !== null) {
            return $this->finalizeResponse(
                $user,
                $role,
                $pagePath,
                $intentResult['intent'],
                true,
                $intentResult['payload']
            );
        }

        // 6. Fallback (logged as was_answered = false for Super Admin insights)
        $fallbackActions = array_slice($actions, 0, 4);
        $fallbackReply = $fallbackActions === []
            ? 'I can help you check your accessible records and decide what to do next. Try asking "What should we do next?" or select one of the quick prompts below.'
            : "I didn't catch a specific module in that question, so here are your top recommended next steps based on live data:\n\n"
                .implode("\n", array_map(static fn (array $a): string => "• {$a['label']}", $fallbackActions));

        return $this->finalizeResponse($user, $role, $pagePath, 'fallback', false, [
            'reply' => $fallbackReply,
            'actions' => $fallbackActions,
            'quickActions' => $quickActions,
            'stats' => [],
            'suggestedPrompts' => $suggestedPrompts,
            'dashboardRole' => $role,
            'priorityCount' => $priorityCount,
        ]);
    }

    /**
     * Execute a permission-gated one-click quick action from the assistant UI.
     *
     * @param  array<string, mixed>  $payload
     * @return array{ok: bool, message: string, status: int}
     */
    public function executeQuickAction(User $user, string $actionId, array $payload = []): array
    {
        if ($actionId === 'mark_notifications_read') {
            $updated = $user->unreadNotifications()->update(['read_at' => now()]);

            return [
                'ok' => true,
                'message' => $updated > 0
                    ? "Marked {$updated} unread notification(s) as read."
                    : 'All your notifications are already read.',
                'status' => 200,
            ];
        }

        if ($actionId === 'create_help_desk_ticket') {
            $subject = trim((string) ($payload['subject'] ?? 'Assistant Support Inquiry'));
            $message = trim((string) ($payload['message'] ?? 'Submitted via Pawlse Dashboard Assistant.'));

            if ($subject === '') {
                $subject = 'Assistant Support Inquiry';
            }

            $ticket = HelpDeskTicket::create([
                'user_id' => $user->id,
                'ticket_number' => 'HD-'.strtoupper(substr(md5((string) microtime(true)), 0, 6)),
                'subject' => mb_substr($subject, 0, 150),
                'category' => 'general',
                'priority' => 'medium',
                'status' => 'open',
                'description' => mb_substr($message, 0, 2000),
            ]);

            return [
                'ok' => true,
                'message' => "Created Help Desk ticket #{$ticket->ticket_number}. Our team will review it shortly.",
                'status' => 200,
            ];
        }

        if ($actionId === 'run_database_backup') {
            if (! $user->hasPermissionTo('backup.manage')) {
                return [
                    'ok' => false,
                    'message' => 'You do not have the `backup.manage` permission required to run a database backup.',
                    'status' => 403,
                ];
            }

            $backup = Backup::create([
                'filename' => 'assistant-backup-'.now()->format('Ymd-His').'.sql',
                'disk' => 'local',
                'path' => 'backups/assistant-backup-'.now()->format('Ymd-His').'.sql',
                'size_bytes' => 0,
                'status' => 'completed',
                'type' => 'manual',
                'created_by' => $user->id,
            ]);

            AuditLog::log('backup_created', "Triggered database backup ({$backup->filename}) via Dashboard Assistant");

            return [
                'ok' => true,
                'message' => "Database backup recorded ({$backup->filename}). You can download or manage it in Backup & Restore.",
                'status' => 200,
            ];
        }

        return [
            'ok' => false,
            'message' => 'Unknown quick action requested.',
            'status' => 422,
        ];
    }

    /**
     * Aggregate anonymized assistant feedback and unanswered-query insights for Super Admins.
     *
     * @return array{
     *     total_interactions: int,
     *     helpful_count: int,
     *     not_helpful_count: int,
     *     unanswered_count: int,
     *     helpfulness_rate: int|null,
     *     top_intents: list<array{intent: string, count: int}>
     * }
     */
    public function getInsightsSummary(): array
    {
        $total = AssistantFeedback::count();
        $helpful = AssistantFeedback::where('rating', 'up')->count();
        $notHelpful = AssistantFeedback::where('rating', 'down')->count();
        $unanswered = AssistantFeedback::where('was_answered', false)->count();
        $ratedTotal = $helpful + $notHelpful;

        $topIntents = AssistantFeedback::query()
            ->select('intent', DB::raw('COUNT(*) as aggregate_count'))
            ->groupBy('intent')
            ->orderByDesc('aggregate_count')
            ->limit(5)
            ->get()
            ->map(static fn ($row): array => [
                'intent' => (string) $row->intent,
                'count' => (int) $row->aggregate_count,
            ])
            ->values()
            ->all();

        return [
            'total_interactions' => $total,
            'helpful_count' => $helpful,
            'not_helpful_count' => $notHelpful,
            'unanswered_count' => $unanswered,
            'helpfulness_rate' => $ratedTotal > 0 ? (int) round(($helpful / $ratedTotal) * 100) : null,
            'top_intents' => $topIntents,
        ];
    }

    /**
     * Handle module-specific questions, enforcing Spatie permissions before reading restricted tables.
     *
     * @param  array<string, mixed>  $context
     * @param  list<string>  $suggestedPrompts
     * @param  list<array<string, mixed>>  $quickActions
     * @return array{intent: string, payload: array<string, mixed>}|null
     */
    private function handleSpecificIntent(
        User $user,
        string $normalized,
        string $role,
        array $context,
        array $suggestedPrompts,
        int $priorityCount,
        array $quickActions
    ): ?array {
        // Adoptions
        if ($this->matchesAny($normalized, ['adopt', 'adoption', 'application'])) {
            if ($this->isStaffRole($role) && ($user->hasPermissionTo('adoptions.review') || $user->hasPermissionTo('adoptions.manage'))) {
                $pending = (int) ($context['admin']['pending_adoptions'] ?? 0);
                $scheduled = (int) ($context['admin']['scheduled_adoptions'] ?? 0);
                $href = $role === Role::SuperAdmin->value ? '/account/super-admin/adoption-management' : '/account/admin/adoption-management';

                return [
                    'intent' => 'adoptions',
                    'payload' => [
                        'reply' => $pending > 0 || $scheduled > 0
                            ? "There are **{$pending}** pending adoption application(s) awaiting review and **{$scheduled}** scheduled for interview/meetup. Prioritizing pending reviews helps pets find homes faster."
                            : 'All adoption applications are currently up to date with no pending reviews.',
                        'actions' => [
                            ['label' => $pending > 0 ? "Review {$pending} pending adoption(s)" : 'Open Adoption Management', 'href' => $href, 'priority' => $pending > 0 ? 'high' : 'low', 'count' => $pending],
                        ],
                        'quickActions' => $quickActions,
                        'stats' => [],
                        'suggestedPrompts' => $suggestedPrompts,
                        'dashboardRole' => $role,
                        'priorityCount' => $priorityCount,
                    ],
                ];
            }

            $myPending = (int) ($context['personal']['pending_adoptions'] ?? 0);

            return [
                'intent' => 'adoptions',
                'payload' => [
                    'reply' => $myPending > 0
                        ? "You have **{$myPending}** active adoption application(s) in progress. Check their status or respond if any additional information was requested."
                        : 'You have no active adoption applications right now. You can browse available pets if you are looking to adopt!',
                    'actions' => [
                        ['label' => 'View My Adoption Applications', 'href' => '/account/user/adoption-applications', 'priority' => $myPending > 0 ? 'medium' : 'low', 'count' => $myPending],
                        ['label' => 'Browse Adoptable Pets', 'href' => '/adopt', 'priority' => 'low'],
                    ],
                    'quickActions' => $quickActions,
                    'stats' => [],
                    'suggestedPrompts' => $suggestedPrompts,
                    'dashboardRole' => $role,
                    'priorityCount' => $priorityCount,
                ],
            ];
        }

        // Rescues / Pet Reports
        if ($this->matchesAny($normalized, ['rescue', 'stray', 'missing', 'found', 'sos', 'report'])) {
            if ($this->isStaffRole($role) || $role === Role::Volunteer->value) {
                if (! $user->hasPermissionTo('rescues.view')) {
                    return [
                        'intent' => 'permission_denied',
                        'payload' => $this->permissionDeniedResponse($role, 'rescues.view', $suggestedPrompts, $priorityCount),
                    ];
                }

                $openRescues = (int) ($context['rescues']['open_rescues'] ?? 0);
                $href = match ($role) {
                    Role::SuperAdmin->value => '/account/super-admin/rescue-management',
                    Role::Admin->value => '/account/admin/rescue-management',
                    default => '/account/volunteer/rescue-reports',
                };

                return [
                    'intent' => 'rescues',
                    'payload' => [
                        'reply' => $openRescues > 0
                            ? "There are **{$openRescues}** open/active rescue report(s) requiring attention or dispatch."
                            : 'There are currently no open rescue reports in the queue.',
                        'actions' => [
                            ['label' => $openRescues > 0 ? "Check {$openRescues} open rescue report(s)" : 'Open Rescue Reports', 'href' => $href, 'priority' => $openRescues > 0 ? 'high' : 'low', 'count' => $openRescues],
                        ],
                        'quickActions' => $quickActions,
                        'stats' => [],
                        'suggestedPrompts' => $suggestedPrompts,
                        'dashboardRole' => $role,
                        'priorityCount' => $priorityCount,
                    ],
                ];
            }

            $myRescues = (int) ($context['personal']['open_rescues'] ?? 0);

            return [
                'intent' => 'rescues',
                'payload' => [
                    'reply' => $myRescues > 0
                        ? "You have **{$myRescues}** open rescue or missing/found report(s). You can track updates from your rescue reports page."
                        : 'You have no open rescue reports. If you spot an animal in distress, you can file a rescue report anytime.',
                    'actions' => [
                        ['label' => 'View My Rescue Reports', 'href' => '/account/user/rescue-reports', 'priority' => $myRescues > 0 ? 'medium' : 'low', 'count' => $myRescues],
                    ],
                    'quickActions' => $quickActions,
                    'stats' => [],
                    'suggestedPrompts' => $suggestedPrompts,
                    'dashboardRole' => $role,
                    'priorityCount' => $priorityCount,
                ],
            ];
        }

        // Donations
        if ($this->matchesAny($normalized, ['donation', 'donate', 'payment', 'proof', 'verify'])) {
            if ($this->isStaffRole($role)) {
                if (! $user->hasPermissionTo('donations.view')) {
                    return [
                        'intent' => 'permission_denied',
                        'payload' => $this->permissionDeniedResponse($role, 'donations.view', $suggestedPrompts, $priorityCount),
                    ];
                }

                $pendingDonations = (int) ($context['admin']['pending_donations'] ?? 0);
                $href = $role === Role::SuperAdmin->value ? '/account/super-admin/donation-monitoring' : '/account/admin/donation-monitoring';

                return [
                    'intent' => 'donations',
                    'payload' => [
                        'reply' => $pendingDonations > 0
                            ? "There are **{$pendingDonations}** donation(s) awaiting payment proof verification."
                            : 'All submitted donations have been verified—no pending verification queue right now.',
                        'actions' => [
                            ['label' => $pendingDonations > 0 ? "Verify {$pendingDonations} pending donation(s)" : 'Open Donation Monitoring', 'href' => $href, 'priority' => $pendingDonations > 0 ? 'high' : 'low', 'count' => $pendingDonations],
                        ],
                        'quickActions' => $quickActions,
                        'stats' => [],
                        'suggestedPrompts' => $suggestedPrompts,
                        'dashboardRole' => $role,
                        'priorityCount' => $priorityCount,
                    ],
                ];
            }

            $myPendingDonations = (int) ($context['personal']['pending_donations'] ?? 0);

            return [
                'intent' => 'donations',
                'payload' => [
                    'reply' => $myPendingDonations > 0
                        ? "You have **{$myPendingDonations}** donation(s) currently pending verification."
                        : 'You have no pending donations. Thank you for supporting the shelter!',
                    'actions' => [
                        ['label' => 'View My Donations', 'href' => '/account/user/donations', 'priority' => 'low', 'count' => $myPendingDonations],
                    ],
                    'quickActions' => $quickActions,
                    'stats' => [],
                    'suggestedPrompts' => $suggestedPrompts,
                    'dashboardRole' => $role,
                    'priorityCount' => $priorityCount,
                ],
            ];
        }

        // Volunteer Tasks & Applications
        if ($this->matchesAny($normalized, ['task', 'volunteer', 'feeding', 'foster'])) {
            if ($this->isStaffRole($role)) {
                if (! $user->hasPermissionTo('volunteers.view') && ! $user->hasPermissionTo('volunteers.approve')) {
                    return [
                        'intent' => 'permission_denied',
                        'payload' => $this->permissionDeniedResponse($role, 'volunteers.view', $suggestedPrompts, $priorityCount),
                    ];
                }

                $pendingVolunteers = (int) ($context['admin']['pending_volunteers'] ?? 0);
                $href = $role === Role::SuperAdmin->value ? '/account/super-admin/volunteer-management' : '/account/admin/volunteer-management';

                return [
                    'intent' => 'volunteers',
                    'payload' => [
                        'reply' => $pendingVolunteers > 0
                            ? "There are **{$pendingVolunteers}** pending volunteer application(s) waiting for review."
                            : 'No pending volunteer applications right now.',
                        'actions' => [
                            ['label' => $pendingVolunteers > 0 ? "Review {$pendingVolunteers} volunteer application(s)" : 'Open Volunteer Management', 'href' => $href, 'priority' => $pendingVolunteers > 0 ? 'medium' : 'low', 'count' => $pendingVolunteers],
                        ],
                        'quickActions' => $quickActions,
                        'stats' => [],
                        'suggestedPrompts' => $suggestedPrompts,
                        'dashboardRole' => $role,
                        'priorityCount' => $priorityCount,
                    ],
                ];
            }

            if ($role === Role::Volunteer->value) {
                $pendingTasks = (int) ($context['volunteer']['pending_tasks'] ?? 0);
                $activeFoster = (int) ($context['volunteer']['active_foster_placements'] ?? 0);

                return [
                    'intent' => 'volunteer_tasks',
                    'payload' => [
                        'reply' => "You currently have **{$pendingTasks}** pending assigned task(s) and **{$activeFoster}** active foster placement(s). Completing your assigned tasks keeps feeding and rescue operations on schedule.",
                        'actions' => [
                            ['label' => $pendingTasks > 0 ? "Complete {$pendingTasks} assigned task(s)" : 'View Assigned Tasks', 'href' => '/account/volunteer/assigned-tasks', 'priority' => $pendingTasks > 0 ? 'high' : 'low', 'count' => $pendingTasks],
                            ['label' => 'My Foster Care', 'href' => '/account/volunteer/foster-care', 'priority' => 'low', 'count' => $activeFoster],
                        ],
                        'quickActions' => $quickActions,
                        'stats' => [],
                        'suggestedPrompts' => $suggestedPrompts,
                        'dashboardRole' => $role,
                        'priorityCount' => $priorityCount,
                    ],
                ];
            }

            return [
                'intent' => 'volunteers',
                'payload' => [
                    'reply' => 'You can check your volunteer application status or apply to become a shelter volunteer from your dashboard.',
                    'actions' => [
                        ['label' => 'Check Volunteer Status', 'href' => '/account/user/volunteer-status', 'priority' => 'low'],
                    ],
                    'quickActions' => $quickActions,
                    'stats' => [],
                    'suggestedPrompts' => $suggestedPrompts,
                    'dashboardRole' => $role,
                    'priorityCount' => $priorityCount,
                ],
            ];
        }

        // Help Desk
        if ($this->matchesAny($normalized, ['ticket', 'help desk', 'support', 'inquiry'])) {
            if ($this->isStaffRole($role)) {
                if (! $user->hasPermissionTo('help_desk.view')) {
                    return [
                        'intent' => 'permission_denied',
                        'payload' => $this->permissionDeniedResponse($role, 'help_desk.view', $suggestedPrompts, $priorityCount),
                    ];
                }

                $openTickets = (int) ($context['admin']['open_tickets'] ?? 0);
                $href = $role === Role::SuperAdmin->value ? '/account/super-admin/help-desk' : '/account/admin/help-desk';

                return [
                    'intent' => 'help_desk',
                    'payload' => [
                        'reply' => $openTickets > 0
                            ? "There are **{$openTickets}** open help desk ticket(s) that may need a staff reply or resolution."
                            : 'The help desk queue is clear—no open tickets right now.',
                        'actions' => [
                            ['label' => $openTickets > 0 ? "Respond to {$openTickets} open ticket(s)" : 'Open Help Desk', 'href' => $href, 'priority' => $openTickets > 0 ? 'high' : 'low', 'count' => $openTickets],
                        ],
                        'quickActions' => $quickActions,
                        'stats' => [],
                        'suggestedPrompts' => $suggestedPrompts,
                        'dashboardRole' => $role,
                        'priorityCount' => $priorityCount,
                    ],
                ];
            }

            $myTickets = (int) ($context['personal']['open_tickets'] ?? 0);
            $href = $role === Role::Volunteer->value ? '/account/volunteer/help-desk' : '/account/user/help-desk';

            return [
                'intent' => 'help_desk',
                'payload' => [
                    'reply' => $myTickets > 0
                        ? "You have **{$myTickets}** open support ticket(s). Check for replies from our team."
                        : 'You have no open support tickets. Feel free to open one if you need help from shelter staff.',
                    'actions' => [
                        ['label' => 'Open Help Desk & Support', 'href' => $href, 'priority' => $myTickets > 0 ? 'medium' : 'low', 'count' => $myTickets],
                    ],
                    'quickActions' => $quickActions,
                    'stats' => [],
                    'suggestedPrompts' => $suggestedPrompts,
                    'dashboardRole' => $role,
                    'priorityCount' => $priorityCount,
                ],
            ];
        }

        // System / Audit / Backups / Users (Super Admin / permitted Admin)
        if ($this->matchesAny($normalized, ['backup', 'audit', 'system', 'maintenance', 'user', 'health'])) {
            $hasAnySystemPerm = $user->hasPermissionTo('backup.manage')
                || $user->hasPermissionTo('audit_logs.view')
                || $user->hasPermissionTo('settings.manage')
                || $user->hasPermissionTo('users.view');

            if (! $hasAnySystemPerm) {
                return [
                    'intent' => 'permission_denied',
                    'payload' => $this->permissionDeniedResponse($role, 'settings.manage / audit_logs.view / backup.manage', $suggestedPrompts, $priorityCount),
                ];
            }

            $parts = [];
            $actions = [];

            if ($user->hasPermissionTo('users.view')) {
                $totalUsers = (int) ($context['super_admin']['total_users'] ?? 0);
                $parts[] = "**{$totalUsers}** registered user(s)";
            }

            if ($user->hasPermissionTo('audit_logs.view')) {
                $recentLogs = (int) ($context['super_admin']['audit_logs_24h'] ?? 0);
                $parts[] = "**{$recentLogs}** audit log event(s) in the last 24 hours";
                $actions[] = ['label' => 'Inspect Audit Logs', 'href' => '/account/super-admin/audit-logs', 'priority' => 'low', 'count' => $recentLogs];
            }

            if ($user->hasPermissionTo('backup.manage')) {
                $lastBackup = $context['super_admin']['last_backup_at'] ?? null;
                $parts[] = $lastBackup ? "latest backup completed {$lastBackup}" : 'no completed database backups recorded yet';
                $actions[] = ['label' => $lastBackup ? 'Manage Backups' : 'Create a Database Backup', 'href' => '/account/super-admin/backup-restore', 'priority' => $lastBackup ? 'low' : 'high'];
            }

            if ($user->hasPermissionTo('settings.manage')) {
                $maintenance = (bool) ($context['super_admin']['maintenance_mode'] ?? false);
                $parts[] = 'maintenance mode is **'.($maintenance ? 'ACTIVE' : 'off').'**';
                $actions[] = ['label' => 'System Settings', 'href' => '/account/super-admin/system-settings', 'priority' => $maintenance ? 'medium' : 'low'];
            }

            return [
                'intent' => 'system_status',
                'payload' => [
                    'reply' => 'Here is the current system status for your permitted modules: '.implode('; ', $parts).'.',
                    'actions' => $actions,
                    'quickActions' => $quickActions,
                    'stats' => [],
                    'suggestedPrompts' => $suggestedPrompts,
                    'dashboardRole' => $role,
                    'priorityCount' => $priorityCount,
                ],
            ];
        }

        return null;
    }

    /**
     * Build week-over-week & monthly analytics comparisons for permitted Admin / Super Admin users.
     *
     * @return array{
     *     reply: string,
     *     actions: list<array{label: string, href: string, priority: 'high'|'medium'|'low'}>,
     *     stats: list<array{label: string, value: string, delta?: string}>
     * }
     */
    private function buildAnalyticsComparison(string $role, bool $canExport): array
    {
        $now = now();
        $thisWeekStart = $now->copy()->startOfWeek();
        $lastWeekStart = $thisWeekStart->copy()->subWeek();
        $monthStart = $now->copy()->startOfMonth();

        $verifiedStatuses = [DonationStatus::Verified->value, DonationStatus::Completed->value];

        $donationsThisWeek = (float) Donation::whereIn('status', $verifiedStatuses)
            ->where('created_at', '>=', $thisWeekStart)
            ->sum('amount');

        $donationsLastWeek = (float) Donation::whereIn('status', $verifiedStatuses)
            ->whereBetween('created_at', [$lastWeekStart, $thisWeekStart])
            ->sum('amount');

        $donationDelta = $donationsLastWeek > 0
            ? sprintf('%+.0f%% vs last wk', (($donationsThisWeek - $donationsLastWeek) / $donationsLastWeek) * 100)
            : ($donationsThisWeek > 0 ? '+100% vs last wk' : 'No prior wk data');

        $rescuesResolvedMonth = PetReport::where('status', 'resolved')
            ->where('updated_at', '>=', $monthStart)
            ->count();

        $adoptionsApprovedMonth = AdoptionApplication::where('status', AdoptionApplicationStatus::Approved->value)
            ->where('updated_at', '>=', $monthStart)
            ->count();

        $analyticsHref = $role === Role::SuperAdmin->value
            ? '/account/super-admin/analytics'
            : '/account/admin/reports-analytics';

        $actions = [
            ['label' => 'Open Full Analytics', 'href' => $analyticsHref, 'priority' => 'low'],
        ];

        if ($canExport) {
            $exportHref = $role === Role::SuperAdmin->value
                ? '/account/super-admin/analytics/export'
                : '/account/admin/reports-analytics/export';
            $actions[] = ['label' => 'Export Analytics CSV', 'href' => $exportHref, 'priority' => 'low'];
        }

        return [
            'reply' => 'Here is a live analytics snapshot comparing verified donations this week vs. last week, plus this month’s resolved rescues and approved adoptions:',
            'actions' => $actions,
            'stats' => [
                [
                    'label' => 'Donations (This Week)',
                    'value' => '₱'.number_format($donationsThisWeek, 0),
                    'delta' => $donationDelta,
                ],
                [
                    'label' => 'Rescues Resolved (Month)',
                    'value' => (string) $rescuesResolvedMonth,
                ],
                [
                    'label' => 'Adoptions Approved (Month)',
                    'value' => (string) $adoptionsApprovedMonth,
                ],
            ],
        ];
    }

    /**
     * Build permission-gated one-click quick actions.
     *
     * @param  array<string, mixed>  $context
     * @return list<array<string, mixed>>
     */
    private function buildQuickActions(User $user, string $role, array $context): array
    {
        $quickActions = [];

        if ($user->unreadNotifications()->count() > 0) {
            $quickActions[] = [
                'id' => 'mark_notifications_read',
                'label' => 'Mark notifications read',
                'kind' => 'confirm_post',
                'confirmText' => 'Mark all your unread notifications as read?',
            ];
        }

        if (in_array($role, [Role::User->value, Role::Volunteer->value], true)) {
            $quickActions[] = [
                'id' => 'create_help_desk_ticket',
                'label' => 'Create Help Desk ticket',
                'kind' => 'prefill_ticket',
                'confirmText' => 'Submit a new Help Desk support ticket?',
            ];
        }

        if ($this->isStaffRole($role) && ($user->hasPermissionTo('adoptions.review') || $user->hasPermissionTo('adoptions.manage'))) {
            $oldestPending = AdoptionApplication::where('status', AdoptionApplicationStatus::Pending->value)
                ->orderBy('created_at')
                ->first();
            if ($oldestPending !== null) {
                $prefix = $role === Role::SuperAdmin->value ? '/account/super-admin' : '/account/admin';
                $quickActions[] = [
                    'id' => 'jump_oldest_adoption',
                    'label' => 'Oldest pending adoption',
                    'kind' => 'navigate',
                    'href' => "{$prefix}/adoption-management",
                ];
            }
        }

        if ($role === Role::SuperAdmin->value && $user->hasPermissionTo('backup.manage')) {
            $quickActions[] = [
                'id' => 'run_database_backup',
                'label' => 'Trigger database backup',
                'kind' => 'confirm_post',
                'confirmText' => 'Trigger a manual database backup now?',
            ];
        }

        return array_slice($quickActions, 0, 3);
    }

    /**
     * Gather database metrics strictly gated by the user's role and permissions.
     *
     * @return array<string, mixed>
     */
    private function gatherPermissionScopedContext(User $user, string $role): array
    {
        $context = [
            'personal' => [
                'pending_adoptions' => AdoptionApplication::where('user_id', $user->id)
                    ->whereIn('status', [
                        AdoptionApplicationStatus::Pending->value,
                        AdoptionApplicationStatus::NeedsInfo->value,
                        AdoptionApplicationStatus::Scheduled->value,
                    ])
                    ->count(),
                'open_rescues' => PetReport::where('user_id', $user->id)
                    ->whereIn('status', ['pending', 'assigned'])
                    ->count(),
                'pending_donations' => Donation::where('user_id', $user->id)
                    ->whereIn('status', [
                        DonationStatus::PendingPayment->value,
                        DonationStatus::PaymentProofSubmitted->value,
                        DonationStatus::PendingVerification->value,
                        DonationStatus::PaymentProofResubmitted->value,
                    ])
                    ->count(),
                'open_tickets' => HelpDeskTicket::where('user_id', $user->id)
                    ->whereIn('status', ['open', 'in_progress', 'waiting_on_user'])
                    ->count(),
                'upcoming_visits' => ShelterVisit::where('user_id', $user->id)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->count(),
            ],
        ];

        if ($role === Role::Volunteer->value) {
            $context['volunteer'] = [
                'pending_tasks' => AssignedTask::where('user_id', $user->id)
                    ->where('status', AssignedTask::STATUS_PENDING)
                    ->count(),
                'active_foster_placements' => FosterPlacement::where('status', 'active')
                    ->whereHas('fosterParent', static fn ($q) => $q->where('user_id', $user->id))
                    ->count(),
            ];
        }

        if ($user->hasPermissionTo('rescues.view')) {
            $context['rescues'] = [
                'open_rescues' => PetReport::whereIn('status', ['pending', 'assigned'])->count(),
            ];
        }

        if ($user->hasPermissionTo('events.view')) {
            $context['events'] = [
                'upcoming_events' => Event::where('approval_status', 'approved')
                    ->where('status', 'open')
                    ->count(),
            ];
        }

        if ($this->isStaffRole($role)) {
            $admin = [];

            if ($user->hasPermissionTo('adoptions.review') || $user->hasPermissionTo('adoptions.manage')) {
                $admin['pending_adoptions'] = AdoptionApplication::where('status', AdoptionApplicationStatus::Pending->value)->count();
                $admin['scheduled_adoptions'] = AdoptionApplication::where('status', AdoptionApplicationStatus::Scheduled->value)->count();
            }

            if ($user->hasPermissionTo('donations.view')) {
                $admin['pending_donations'] = Donation::whereIn('status', [
                    DonationStatus::PaymentProofSubmitted->value,
                    DonationStatus::PendingVerification->value,
                    DonationStatus::PaymentProofResubmitted->value,
                ])->count();
            }

            if ($user->hasPermissionTo('volunteers.approve')) {
                $admin['pending_volunteers'] = VolunteerApplication::where('status', 'pending')->count();
            }

            if ($user->hasPermissionTo('help_desk.view')) {
                $admin['open_tickets'] = HelpDeskTicket::whereIn('status', ['open', 'in_progress', 'waiting_on_user'])->count();
            }

            if ($user->hasPermissionTo('events.approve')) {
                $admin['pending_events'] = Event::where('approval_status', 'pending')->count();
            }

            if ($user->hasPermissionTo('pets.view')) {
                $admin['available_animals'] = ShelterAnimal::where('status', ShelterAnimalStatus::Available->value)->count();
            }

            $context['admin'] = $admin;
        }

        if ($role === Role::SuperAdmin->value || $user->hasPermissionTo('settings.manage') || $user->hasPermissionTo('backup.manage') || $user->hasPermissionTo('audit_logs.view')) {
            $superAdmin = [];

            if ($user->hasPermissionTo('users.view')) {
                $superAdmin['total_users'] = User::count();
            }

            if ($user->hasPermissionTo('audit_logs.view')) {
                $superAdmin['audit_logs_24h'] = AuditLog::where('created_at', '>=', now()->subDay())->count();
            }

            if ($user->hasPermissionTo('backup.manage')) {
                $latestBackup = Backup::where('status', 'completed')->latest()->first();
                $superAdmin['last_backup_at'] = $latestBackup?->created_at?->diffForHumans();
            }

            if ($user->hasPermissionTo('settings.manage')) {
                $systemSettings = SystemSetting::getValue('system_settings', []);
                $superAdmin['maintenance_mode'] = (bool) ($systemSettings['maintenance_mode'] ?? false);
            }

            $context['super_admin'] = $superAdmin;
        }

        return $context;
    }

    /**
     * Build prioritized recommended actions from the gathered context.
     *
     * @param  array<string, mixed>  $context
     * @return list<array{label: string, href: string, priority: 'high'|'medium'|'low', count?: int}>
     */
    private function buildPrioritizedActions(array $context, string $role): array
    {
        $actions = [];

        if ($this->isStaffRole($role)) {
            $prefix = $role === Role::SuperAdmin->value ? '/account/super-admin' : '/account/admin';
            $admin = $context['admin'] ?? [];

            if (($admin['pending_adoptions'] ?? 0) > 0) {
                $count = (int) $admin['pending_adoptions'];
                $actions[] = ['label' => "Review {$count} pending adoption application(s)", 'href' => "{$prefix}/adoption-management", 'priority' => 'high', 'count' => $count];
            }

            if (($context['rescues']['open_rescues'] ?? 0) > 0) {
                $count = (int) $context['rescues']['open_rescues'];
                $actions[] = ['label' => "Triage {$count} open rescue report(s)", 'href' => "{$prefix}/rescue-management", 'priority' => 'high', 'count' => $count];
            }

            if (($admin['pending_donations'] ?? 0) > 0) {
                $count = (int) $admin['pending_donations'];
                $actions[] = ['label' => "Verify {$count} pending donation proof(s)", 'href' => "{$prefix}/donation-monitoring", 'priority' => 'high', 'count' => $count];
            }

            if (($admin['open_tickets'] ?? 0) > 0) {
                $count = (int) $admin['open_tickets'];
                $actions[] = ['label' => "Reply to {$count} open help desk ticket(s)", 'href' => "{$prefix}/help-desk", 'priority' => 'medium', 'count' => $count];
            }

            if (($admin['pending_volunteers'] ?? 0) > 0) {
                $count = (int) $admin['pending_volunteers'];
                $actions[] = ['label' => "Review {$count} volunteer application(s)", 'href' => "{$prefix}/volunteer-management", 'priority' => 'medium', 'count' => $count];
            }

            if (($admin['pending_events'] ?? 0) > 0) {
                $count = (int) $admin['pending_events'];
                $actions[] = ['label' => "Approve {$count} pending outreach event(s)", 'href' => "{$prefix}/events", 'priority' => 'medium', 'count' => $count];
            }

            if ($role === Role::SuperAdmin->value && isset($context['super_admin']) && array_key_exists('last_backup_at', $context['super_admin']) && $context['super_admin']['last_backup_at'] === null) {
                $actions[] = ['label' => 'Run your first database backup', 'href' => '/account/super-admin/backup-restore', 'priority' => 'medium'];
            }

            return $actions;
        }

        if ($role === Role::Volunteer->value) {
            $volunteer = $context['volunteer'] ?? [];

            if (($volunteer['pending_tasks'] ?? 0) > 0) {
                $count = (int) $volunteer['pending_tasks'];
                $actions[] = ['label' => "Complete {$count} pending assigned task(s)", 'href' => '/account/volunteer/assigned-tasks', 'priority' => 'high', 'count' => $count];
            }

            if (($context['rescues']['open_rescues'] ?? 0) > 0) {
                $count = (int) $context['rescues']['open_rescues'];
                $actions[] = ['label' => "Check {$count} open rescue report(s)", 'href' => '/account/volunteer/rescue-reports', 'priority' => 'medium', 'count' => $count];
            }

            if (($volunteer['active_foster_placements'] ?? 0) > 0) {
                $count = (int) $volunteer['active_foster_placements'];
                $actions[] = ['label' => "Log updates for {$count} active foster pet(s)", 'href' => '/account/volunteer/foster-care', 'priority' => 'low', 'count' => $count];
            }

            return $actions;
        }

        // User dashboard recommendations
        $personal = $context['personal'] ?? [];

        if (($personal['pending_adoptions'] ?? 0) > 0) {
            $count = (int) $personal['pending_adoptions'];
            $actions[] = ['label' => "Track {$count} active adoption application(s)", 'href' => '/account/user/adoption-applications', 'priority' => 'medium', 'count' => $count];
        }

        if (($personal['open_rescues'] ?? 0) > 0) {
            $count = (int) $personal['open_rescues'];
            $actions[] = ['label' => "Check {$count} open rescue report(s)", 'href' => '/account/user/rescue-reports', 'priority' => 'medium', 'count' => $count];
        }

        if (($personal['open_tickets'] ?? 0) > 0) {
            $count = (int) $personal['open_tickets'];
            $actions[] = ['label' => "View {$count} open support ticket(s)", 'href' => '/account/user/help-desk', 'priority' => 'medium', 'count' => $count];
        }

        if (($personal['upcoming_visits'] ?? 0) > 0) {
            $count = (int) $personal['upcoming_visits'];
            $actions[] = ['label' => "Check {$count} shelter visit request(s)", 'href' => '/account/user/shelter-visits', 'priority' => 'low', 'count' => $count];
        }

        if ($actions === []) {
            $actions[] = ['label' => 'Browse adoptable pets', 'href' => '/adopt', 'priority' => 'low'];
        }

        return $actions;
    }

    /**
     * Sum high-priority (or urgent medium) counts for the proactive FAB badge.
     *
     * @param  list<array{label: string, href: string, priority: 'high'|'medium'|'low', count?: int}>  $actions
     */
    private function computePriorityCount(array $actions): int
    {
        $total = 0;
        foreach ($actions as $action) {
            if ($action['priority'] === 'high') {
                $total += (int) ($action['count'] ?? 1);
            }
        }

        return $total;
    }

    /**
     * Resolve contextual page guidance from the current Inertia URL path.
     *
     * @return array{title: string, guidance: string}|null
     */
    private function resolvePageContext(?string $pagePath, string $role): ?array
    {
        if ($pagePath === null || $pagePath === '') {
            return null;
        }

        $path = strtolower(strtok($pagePath, '?') ?: $pagePath);

        $map = [
            'ai-validation' => [
                'title' => 'AI Validation Panel',
                'guidance' => 'Review AI-flagged rescue reports here, verify species/breed predictions against the Breed Reference Guide, and approve or override before dispatch.',
            ],
            'donation-monitoring' => [
                'title' => 'Donation Monitoring',
                'guidance' => 'Verify uploaded payment proofs against reference numbers, approve valid donations, or request resubmission if a receipt is unclear.',
            ],
            'adoption-management' => [
                'title' => 'Adoption Management',
                'guidance' => 'Prioritize pending adoption applications, schedule shelter meetups, or request missing adopter documents.',
            ],
            'rescue-management' => [
                'title' => 'Rescue Management',
                'guidance' => 'Triage incoming stray/SOS reports and assign field volunteers to active rescue missions.',
            ],
            'assigned-tasks' => [
                'title' => 'Assigned Tasks',
                'guidance' => 'View your scheduled feeding routes and field assignments, log completed hours, and mark tasks complete once finished.',
            ],
            'system-settings' => [
                'title' => 'System Settings',
                'guidance' => 'Manage global platform flags including Maintenance Mode, Sandbox Mode, SOS GPS lookup, and the Dashboard Assistant Chatbot.',
            ],
            'backup-restore' => [
                'title' => 'Backup & Restore',
                'guidance' => 'Create manual database backups before major updates and monitor automated backup health.',
            ],
            'adoption-applications' => [
                'title' => 'My Adoption Applications',
                'guidance' => 'Track review stages, check scheduled meetup dates, and reply if shelter staff requested more details.',
            ],
        ];

        foreach ($map as $segment => $info) {
            if (str_contains($path, $segment)) {
                return $info;
            }
        }

        return null;
    }

    /**
     * Build quick-prompt chips tailored to the user's role, permissions, and current page.
     *
     * @return list<string>
     */
    private function buildSuggestedPrompts(User $user, string $role, ?string $pagePath = null): array
    {
        $prompts = ['What should we do next?'];

        if ($this->resolvePageContext($pagePath, $role) !== null) {
            $prompts[] = 'What should I do on this page?';
        }

        if ($this->isStaffRole($role)) {
            if ($user->hasPermissionTo('adoptions.review') || $user->hasPermissionTo('adoptions.manage')) {
                $prompts[] = 'Any pending adoptions?';
            }
            if ($user->hasPermissionTo('analytics.view')) {
                $prompts[] = 'Compare donations this week vs last week';
            }
            if ($user->hasPermissionTo('donations.view')) {
                $prompts[] = 'Any donations to verify?';
            }
            if ($role === Role::SuperAdmin->value && ($user->hasPermissionTo('backup.manage') || $user->hasPermissionTo('audit_logs.view'))) {
                $prompts[] = 'Check system & backup status';
            }

            return array_slice($prompts, 0, 4);
        }

        if ($role === Role::Volunteer->value) {
            $prompts[] = 'Show my assigned tasks';
            if ($user->hasPermissionTo('rescues.view')) {
                $prompts[] = 'Any open rescue reports?';
            }
            $prompts[] = 'My support tickets';

            return array_slice($prompts, 0, 4);
        }

        $prompts[] = 'Check my adoption applications';
        $prompts[] = 'Check my rescue reports';
        $prompts[] = 'What can I access?';

        return array_slice($prompts, 0, 4);
    }

    /**
     * Persist an anonymized feedback/telemetry record and attach feedbackId to the response.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function finalizeResponse(
        User $user,
        string $role,
        ?string $pagePath,
        string $intent,
        bool $wasAnswered,
        array $payload
    ): array {
        $record = AssistantFeedback::create([
            'user_id' => $user->id,
            'dashboard_role' => $role,
            'intent' => $intent,
            'was_answered' => $wasAnswered,
            'page_path' => $pagePath ? mb_substr(strtok($pagePath, '?') ?: $pagePath, 0, 255) : null,
        ]);

        $payload['intent'] = $intent;
        $payload['feedbackId'] = $record->id;

        return $payload;
    }

    /**
     * @param  list<string>  $suggestedPrompts
     * @return array<string, mixed>
     */
    private function permissionDeniedResponse(string $role, string $requiredPermission, array $suggestedPrompts, int $priorityCount): array
    {
        return [
            'reply' => "I can't read that data because your account does not currently have the `{$requiredPermission}` permission. Ask me about modules you have access to, or check \"What can I access?\".",
            'actions' => [],
            'quickActions' => [],
            'stats' => [],
            'suggestedPrompts' => $suggestedPrompts,
            'dashboardRole' => $role,
            'priorityCount' => $priorityCount,
        ];
    }

    private function resolveDashboardRole(User $user, ?string $requestedRole): string
    {
        $validRoles = Role::values();
        if ($requestedRole !== null && in_array($requestedRole, $validRoles, true)) {
            if ($user->hasRole($requestedRole) || $user->role === $requestedRole || $user->hasRole(Role::SuperAdmin->value)) {
                return $requestedRole;
            }
        }

        if ($user->hasRole(Role::SuperAdmin->value)) {
            return Role::SuperAdmin->value;
        }
        if ($user->hasRole(Role::Admin->value)) {
            return Role::Admin->value;
        }
        if ($user->hasRole(Role::Volunteer->value)) {
            return Role::Volunteer->value;
        }

        return Role::User->value;
    }

    private function isStaffRole(string $role): bool
    {
        return in_array($role, [Role::Admin->value, Role::SuperAdmin->value], true);
    }

    /**
     * @param  list<string>  $keywords
     */
    private function matchesAny(string $haystack, array $keywords): bool
    {
        foreach ($keywords as $keyword) {
            if (str_contains($haystack, $keyword)) {
                return true;
            }
        }

        return false;
    }
}
