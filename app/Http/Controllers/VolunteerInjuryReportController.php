<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\VolunteerInjuryReport;
use App\Notifications\VolunteerInjuryReportedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VolunteerInjuryReportController extends Controller
{
    /**
     * Display the volunteer's field injury reports and submission form.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $reports = VolunteerInjuryReport::query()
            ->with([
                'assignedTask.event:id,title',
                'assignedTask.feedingSchedule:id,zone',
                'assignedTask.petReport:id,name,animal_type,location',
                'initiatedBy:id,name',
                'confirmedBy:id,name',
            ])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $recentTasks = AssignedTask::query()
            ->with(['event:id,title', 'feedingSchedule:id,zone', 'petReport:id,name,animal_type,location'])
            ->where('user_id', $user->id)
            ->latest()
            ->take(20)
            ->get()
            ->map(function (AssignedTask $task): array {
                $label = $task->event?->title
                    ?? ($task->feedingSchedule ? "Feeding Route: {$task->feedingSchedule->zone}" : null)
                    ?? ($task->petReport ? 'Rescue: '.($task->petReport->name ?: $task->petReport->animal_type ?: "Case #{$task->petReport->id}") : null)
                    ?? "Task #{$task->id}";

                return [
                    'id' => $task->id,
                    'label' => "{$label} ({$task->role})",
                ];
            })
            ->values();

        return Inertia::render('volunteer/injury-reports', [
            'reports' => $reports,
            'recentTasks' => $recentTasks,
            'incidentTypes' => VolunteerInjuryReport::INCIDENT_TYPES,
            'severities' => VolunteerInjuryReport::SEVERITIES,
            'medicalAidTypes' => VolunteerInjuryReport::MEDICAL_AID_TYPES,
        ]);
    }

    /**
     * Store a newly reported field injury from a volunteer.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'assigned_task_id' => [
                'nullable',
                'integer',
                Rule::exists('assigned_tasks', 'id')->where('user_id', $user->id),
            ],
            'incident_type' => ['required', 'string', Rule::in(array_keys(VolunteerInjuryReport::INCIDENT_TYPES))],
            'severity' => ['required', 'string', Rule::in(array_keys(VolunteerInjuryReport::SEVERITIES))],
            'body_part' => ['nullable', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:255'],
            'incident_occurred_at' => ['required', 'date'],
            'description' => ['required', 'string', 'max:2000'],
            'first_aid_applied' => ['boolean'],
            'first_aid_notes' => ['nullable', 'string', 'max:1000'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('volunteer-injuries', 'public');
        }

        $report = VolunteerInjuryReport::query()->create([
            'user_id' => $user->id,
            'assigned_task_id' => $validated['assigned_task_id'] ?? null,
            'incident_type' => $validated['incident_type'],
            'severity' => $validated['severity'],
            'body_part' => $validated['body_part'] ?? null,
            'location' => $validated['location'] ?? null,
            'incident_occurred_at' => $validated['incident_occurred_at'],
            'description' => $validated['description'],
            'first_aid_applied' => (bool) ($validated['first_aid_applied'] ?? false),
            'first_aid_notes' => $validated['first_aid_notes'] ?? null,
            'photo_path' => $photoPath,
            'status' => VolunteerInjuryReport::StatusReported,
        ]);

        $admins = User::query()
            ->whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])
            ->get();

        if ($admins->isNotEmpty()) {
            Notification::send($admins, new VolunteerInjuryReportedNotification($report));
        }

        AuditLog::log(
            'volunteer_injury_reported',
            "Volunteer {$user->name} reported a {$report->severity} {$report->incident_type} field injury (#{$report->id})"
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Field injury report submitted. Shelter admins have been notified to initiate medical aid.',
        ]);

        return redirect()->back();
    }
}
