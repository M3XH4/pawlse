<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Events\GroupMessageSent;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\Event;
use App\Models\FeedingDistributionLog;
use App\Models\FeedingSchedule;
use App\Models\GroupMessage;
use App\Models\User;
use App\Models\VolunteerInjuryReport;
use App\Notifications\VolunteerInjuryReportedNotification;
use App\Services\FieldGroupLifecycleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GroupChatController extends Controller
{
    public function __construct(
        private FieldGroupLifecycleService $lifecycleService
    ) {}

    /**
     * Fetch group chat messages and metadata for a Feeding Route or Event team.
     */
    public function index(Request $request, string $type, int $id): JsonResponse
    {
        $user = $request->user();

        if (! $this->lifecycleService->canAccessGroupChat($user, $type, $id)) {
            abort(403, 'You do not have access to this group chat.');
        }

        $group = $this->resolveGroupModel($type, $id);
        $roleMap = $this->resolveMemberRoles($type, $id);

        $messages = GroupMessage::with('user:id,name,role,avatar_path')
            ->where('group_type', $type)
            ->where('group_id', $id)
            ->orderBy('created_at')
            ->limit(200)
            ->get()
            ->map(fn (GroupMessage $msg): array => $this->formatMessage($msg, $roleMap));

        return response()->json([
            'group' => [
                'type' => $type,
                'id' => $id,
                'name' => $type === 'feeding' ? $group->zone : $group->title,
                'is_disbanded' => $group->isDisbanded(),
                'disbanded_at' => $group->disbanded_at?->toIso8601String(),
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * Store and broadcast a new message in a Field Group chat.
     */
    public function store(Request $request, string $type, int $id): JsonResponse
    {
        $user = $request->user();

        if (! $this->lifecycleService->canAccessGroupChat($user, $type, $id)) {
            abort(403, 'You do not have access to this group chat.');
        }

        $group = $this->resolveGroupModel($type, $id);

        if ($group->isDisbanded()) {
            return response()->json([
                'message' => 'This group has been disbanded. Chat is read-only.',
            ], 422);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $trimmed = trim($validated['message']);
        if ($trimmed === '') {
            return response()->json([
                'message' => 'Message cannot be empty.',
            ], 422);
        }

        $groupMessage = GroupMessage::query()->create([
            'group_type' => $type,
            'group_id' => $id,
            'user_id' => $user->id,
            'message' => $trimmed,
        ]);

        $groupMessage->load('user:id,name,role,avatar_path');
        $roleMap = $this->resolveMemberRoles($type, $id);
        $payload = $this->formatMessage($groupMessage, $roleMap);

        broadcast(new GroupMessageSent($groupMessage, $payload))->toOthers();

        return response()->json([
            'message' => $payload,
        ], 201);
    }

    /**
     * Trigger an SOS / Injury Alert from the group chat drawer, notifying the group's Field Medic, Route Lead, and Admins.
     */
    public function sendSosAlert(Request $request, string $type, int $id): JsonResponse
    {
        $user = $request->user();

        if (! $this->lifecycleService->canAccessGroupChat($user, $type, $id)) {
            abort(403, 'You do not have access to this group.');
        }

        $group = $this->resolveGroupModel($type, $id);
        $column = $type === 'feeding' ? 'feeding_schedule_id' : 'event_id';

        $validated = $request->validate([
            'incident_type' => ['required', 'string', Rule::in(array_keys(VolunteerInjuryReport::INCIDENT_TYPES))],
            'severity' => ['required', 'string', Rule::in(array_keys(VolunteerInjuryReport::SEVERITIES))],
            'location' => ['nullable', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:1000'],
        ]);

        $senderTask = AssignedTask::query()
            ->where('user_id', $user->id)
            ->where($column, $id)
            ->first();

        $groupName = $type === 'feeding' ? $group->zone : $group->title;

        $report = VolunteerInjuryReport::query()->create([
            'user_id' => $user->id,
            'assigned_task_id' => $senderTask?->id,
            'incident_type' => $validated['incident_type'],
            'severity' => $validated['severity'],
            'location' => $validated['location'] ?: $groupName,
            'incident_occurred_at' => now(),
            'description' => $validated['description'],
            'status' => VolunteerInjuryReport::StatusReported,
        ]);

        // Notify group Field Medics, Route Leads, and Admins/SuperAdmins
        $groupResponders = AssignedTask::with('user')
            ->where($column, $id)
            ->whereIn('status', [AssignedTask::STATUS_PENDING, AssignedTask::STATUS_COMPLETED])
            ->get()
            ->filter(function (AssignedTask $task) use ($user): bool {
                if (! $task->user || $task->user_id === $user->id) {
                    return false;
                }
                $roleLower = strtolower((string) $task->role);

                return str_contains($roleLower, 'medic') || str_contains($roleLower, 'lead');
            })
            ->pluck('user');

        $admins = User::query()
            ->whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])
            ->where('id', '!=', $user->id)
            ->get();

        $recipients = $groupResponders->merge($admins)->unique('id')->values();
        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new VolunteerInjuryReportedNotification($report));
        }

        $chatPayload = null;
        if (! $group->isDisbanded()) {
            $incidentLabel = VolunteerInjuryReport::INCIDENT_TYPES[$validated['incident_type']] ?? $validated['incident_type'];
            $severityLabel = VolunteerInjuryReport::SEVERITIES[$validated['severity']] ?? $validated['severity'];
            $locationText = $validated['location'] ? " at {$validated['location']}" : '';
            $sosText = "[SOS ALERT • {$severityLabel}] {$incidentLabel}{$locationText}: {$validated['description']}";

            $groupMessage = GroupMessage::query()->create([
                'group_type' => $type,
                'group_id' => $id,
                'user_id' => $user->id,
                'message' => $sosText,
            ]);

            $groupMessage->load('user:id,name,role,avatar_path');
            $chatPayload = $this->formatMessage($groupMessage, $this->resolveMemberRoles($type, $id));
            broadcast(new GroupMessageSent($groupMessage, $chatPayload))->toOthers();
        }

        AuditLog::log('group_sos_alert', "{$user->name} triggered an SOS injury alert in {$type} group '{$groupName}' (Report #{$report->id})");

        return response()->json([
            'report_id' => $report->id,
            'notified_count' => $recipients->count(),
            'message' => $chatPayload,
        ], 201);
    }

    /**
     * Return structured Post-Mission Summary data for a Field Group.
     */
    public function summary(Request $request, string $type, int $id): JsonResponse
    {
        $user = $request->user();

        if (! $this->lifecycleService->canAccessGroupChat($user, $type, $id)) {
            abort(403, 'You do not have access to this mission summary.');
        }

        return response()->json($this->buildSummaryPayload($type, $id));
    }

    /**
     * Export the Post-Mission Summary Report as a CSV download.
     */
    public function exportSummaryCsv(Request $request, string $type, int $id): StreamedResponse
    {
        $user = $request->user();

        if (! $this->lifecycleService->canAccessGroupChat($user, $type, $id)) {
            abort(403, 'You do not have access to export this mission summary.');
        }

        $summary = $this->buildSummaryPayload($type, $id);
        $filename = "mission-summary-{$type}-{$id}.csv";

        return response()->streamDownload(function () use ($summary): void {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            fputcsv($handle, ['Post-Mission Summary Report']);
            fputcsv($handle, ['Group Name', $summary['group']['name']]);
            fputcsv($handle, ['Group Type', $summary['group']['type'] === 'feeding' ? 'Feeding Route' : 'Event Team']);
            fputcsv($handle, ['Schedule', $summary['group']['schedule']]);
            fputcsv($handle, ['Status', $summary['group']['is_disbanded'] ? 'Disbanded' : 'Active']);
            fputcsv($handle, ['Disbanded At', $summary['group']['disbanded_at'] ?? 'N/A']);
            fputcsv($handle, []);

            fputcsv($handle, ['Leadership & Key Roles']);
            fputcsv($handle, ['Route Leads', implode('; ', $summary['leadership']['route_leads']) ?: 'None']);
            fputcsv($handle, ['Recorders', implode('; ', $summary['leadership']['recorders']) ?: 'None']);
            fputcsv($handle, ['Field Medics', implode('; ', $summary['leadership']['medics']) ?: 'None']);
            fputcsv($handle, []);

            fputcsv($handle, ['Attendance & Hours Summary']);
            fputcsv($handle, ['Attended', $summary['attendance']['attended_count']]);
            fputcsv($handle, ['No Show', $summary['attendance']['no_show_count']]);
            fputcsv($handle, ['Total Hours Logged', $summary['attendance']['total_hours_logged']]);
            fputcsv($handle, []);

            fputcsv($handle, ['Member Name', 'Role', 'Attendance Status', 'Hours Logged']);
            foreach ($summary['attendance']['members'] as $member) {
                fputcsv($handle, [
                    $member['name'],
                    $member['role'],
                    $member['status'],
                    $member['hours_logged'],
                ]);
            }

            if ($summary['group']['type'] === 'feeding') {
                fputcsv($handle, []);
                fputcsv($handle, ['Feeding Distribution Summary']);
                fputcsv($handle, ['Total Strays Fed', $summary['feeding']['total_strays_fed']]);
                fputcsv($handle, ['Total Food Packs Distributed', $summary['feeding']['total_food_packs_distributed']]);
                fputcsv($handle, ['Food Packs Allocated', $summary['feeding']['food_packs_allocated'] ?? 'N/A']);
                fputcsv($handle, ['Remaining Packs', $summary['feeding']['remaining_packs'] ?? 'N/A']);
                fputcsv($handle, []);
                fputcsv($handle, ['Street / Stop', 'Food Type', 'Packs Distributed', 'Strays Fed', 'Recorded By', 'Recorded At']);

                foreach ($summary['feeding']['distribution_logs'] as $log) {
                    fputcsv($handle, [
                        $log['street_or_stop'],
                        $log['food_type'],
                        $log['food_packs_distributed'],
                        $log['strays_fed'],
                        $log['recorded_by'],
                        $log['recorded_at'],
                    ]);
                }
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildSummaryPayload(string $type, int $id): array
    {
        $group = $this->resolveGroupModel($type, $id);
        $column = $type === 'feeding' ? 'feeding_schedule_id' : 'event_id';

        $tasks = AssignedTask::with('user:id,name,email')
            ->where($column, $id)
            ->whereIn('status', [
                AssignedTask::STATUS_PENDING,
                AssignedTask::STATUS_COMPLETED,
                AssignedTask::STATUS_NO_SHOW,
            ])
            ->orderBy('created_at')
            ->get();

        $members = $tasks->map(fn (AssignedTask $t): array => [
            'task_id' => $t->id,
            'name' => $t->user?->name ?? $t->guest_name ?? 'Member',
            'role' => $t->role,
            'status' => $t->status,
            'hours_logged' => (float) $t->hours_logged,
        ])->values();

        $routeLeads = $members->filter(fn (array $m): bool => str_contains(strtolower($m['role']), 'lead'))->pluck('name')->values()->all();
        $recorders = $members->filter(fn (array $m): bool => str_contains(strtolower($m['role']), 'recorder'))->pluck('name')->values()->all();
        $medics = $members->filter(fn (array $m): bool => str_contains(strtolower($m['role']), 'medic'))->pluck('name')->values()->all();

        $feedingData = [
            'total_strays_fed' => 0,
            'total_food_packs_distributed' => 0,
            'food_packs_allocated' => null,
            'remaining_packs' => null,
            'sponsorship' => null,
            'distribution_logs' => [],
        ];

        if ($type === 'feeding' && $group instanceof FeedingSchedule) {
            $group->loadMissing(['feedingSponsorship', 'distributionLogs.recordedBy:id,name']);
            $logs = $group->distributionLogs->sortBy('recorded_at')->values();
            $totalPacks = (int) ($group->total_food_distributed ?? $logs->sum('food_packs_distributed'));
            $allocated = $group->food_packs_allocated;

            $feedingData = [
                'total_strays_fed' => (int) $logs->sum('strays_fed'),
                'total_food_packs_distributed' => $totalPacks,
                'food_packs_allocated' => $allocated,
                'remaining_packs' => $allocated !== null ? max(0, $allocated - $totalPacks) : null,
                'sponsorship' => $group->feedingSponsorship ? [
                    'id' => $group->feedingSponsorship->id,
                    'public_reference' => $group->feedingSponsorship->public_reference,
                    'donor_name' => $group->feedingSponsorship->anonymous ? 'Anonymous Sponsor' : $group->feedingSponsorship->donor_name,
                    'occasion' => $group->feedingSponsorship->occasion,
                    'preferred_date' => $group->feedingSponsorship->preferred_date,
                    'packs_distributed' => $group->feedingSponsorship->packs_distributed,
                    'strays_fed' => $group->feedingSponsorship->strays_fed,
                ] : null,
                'distribution_logs' => $logs->map(fn (FeedingDistributionLog $log): array => [
                    'id' => $log->id,
                    'street_or_stop' => $log->street_or_stop,
                    'food_type' => $log->food_type,
                    'food_packs_distributed' => $log->food_packs_distributed,
                    'strays_fed' => $log->strays_fed,
                    'recorded_by' => $log->recordedBy?->name ?? 'Recorder',
                    'recorded_at' => $log->recorded_at?->toIso8601String(),
                ])->all(),
            ];
        }

        return [
            'group' => [
                'type' => $type,
                'id' => $id,
                'name' => $type === 'feeding' ? $group->zone : $group->title,
                'schedule' => $type === 'feeding'
                    ? "{$group->day} • {$group->time}"
                    : (($group->date?->format('M d, Y') ?? '').($group->time ? " • {$group->time}" : '')),
                'is_disbanded' => $group->isDisbanded(),
                'disbanded_at' => $group->disbanded_at?->toIso8601String(),
            ],
            'leadership' => [
                'route_leads' => $routeLeads,
                'recorders' => $recorders,
                'medics' => $medics,
            ],
            'attendance' => [
                'attended_count' => $members->where('status', AssignedTask::STATUS_COMPLETED)->count(),
                'no_show_count' => $members->where('status', AssignedTask::STATUS_NO_SHOW)->count(),
                'pending_count' => $members->where('status', AssignedTask::STATUS_PENDING)->count(),
                'total_hours_logged' => round($members->sum('hours_logged'), 2),
                'members' => $members->all(),
            ],
            'feeding' => $feedingData,
        ];
    }

    private function resolveGroupModel(string $type, int $id): FeedingSchedule|Event
    {
        return $type === 'feeding'
            ? FeedingSchedule::query()->findOrFail($id)
            : Event::query()->findOrFail($id);
    }

    /**
     * @return array<int, string>
     */
    private function resolveMemberRoles(string $type, int $id): array
    {
        $column = $type === 'feeding' ? 'feeding_schedule_id' : 'event_id';

        return AssignedTask::query()
            ->where($column, $id)
            ->whereIn('status', [
                AssignedTask::STATUS_PENDING,
                AssignedTask::STATUS_COMPLETED,
                AssignedTask::STATUS_NO_SHOW,
            ])
            ->pluck('role', 'user_id')
            ->all();
    }

    /**
     * @param  array<int, string>  $roleMap
     * @return array<string, mixed>
     */
    private function formatMessage(GroupMessage $msg, array $roleMap): array
    {
        $sender = $msg->user;
        $isAdmin = $sender ? $this->lifecycleService->isAdmin($sender) : false;
        $groupRole = $sender ? ($roleMap[$sender->id] ?? ($isAdmin ? 'Admin Coordinator' : 'Volunteer')) : 'Member';

        return [
            'id' => $msg->id,
            'group_type' => $msg->group_type,
            'group_id' => $msg->group_id,
            'user_id' => $msg->user_id,
            'message' => $msg->message,
            'created_at' => $msg->created_at?->toIso8601String(),
            'sender' => [
                'id' => $sender?->id,
                'name' => $sender?->name ?? 'User',
                'avatar_path' => $sender?->avatar_path,
                'group_role' => $groupRole,
                'is_admin' => $isAdmin,
            ],
        ];
    }
}
