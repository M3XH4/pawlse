<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\PetReport;
use App\Models\SystemSetting;
use App\Models\User;
use App\Notifications\RescueTaskAssignedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AiValidationController extends Controller
{
    /**
     * Display the AI validation queue with stats, filters, search, and pagination.
     */
    public function index(Request $request): Response
    {
        // Calculate statistics for AI Validation Panel first so default filter adapts intelligently
        $totalAiReports = PetReport::whereNotNull('ai_prediction_log_id')->count();

        $pendingValidation = PetReport::whereNotNull('ai_prediction_log_id')
            ->where('ai_validation_status', 'pending')
            ->count();

        $approvedCount = PetReport::whereNotNull('ai_prediction_log_id')
            ->where('ai_validation_status', 'approved')
            ->count();

        $rejectedCount = PetReport::whereNotNull('ai_prediction_log_id')
            ->where('ai_validation_status', 'rejected')
            ->count();

        $validatedCount = $approvedCount + $rejectedCount;
        $accuracyRate = $validatedCount > 0 ? (int) round(($approvedCount / $validatedCount) * 100) : 100;

        $avgConfidence = DB::table('pet_reports')
            ->join('ai_prediction_logs', 'pet_reports.ai_prediction_log_id', '=', 'ai_prediction_logs.id')
            ->whereNotNull('ai_prediction_logs.confidence')
            ->avg('ai_prediction_logs.confidence') ?? 0;

        $search = $request->input('search', '');
        $defaultStatus = $pendingValidation > 0 ? 'pending' : 'All';
        $statusFilter = $request->input('status', $defaultStatus); // pending, approved, rejected, All
        $animalTypeFilter = $request->input('animal_type', 'All'); // Cat, Dog, Other, All
        $confidenceFilter = $request->input('confidence_level', 'All'); // High, Medium, Low, All
        $typeFilter = $request->input('type', 'All'); // rescue, missing, sos, All

        $reportsQuery = PetReport::with(['photos', 'aiPredictionLog', 'user', 'assignedVolunteer'])
            ->whereNotNull('ai_prediction_log_id')
            ->when($statusFilter !== 'All', function ($query) use ($statusFilter) {
                $query->where('ai_validation_status', $statusFilter);
            })
            ->when($animalTypeFilter !== 'All', function ($query) use ($animalTypeFilter) {
                $query->where('animal_type', $animalTypeFilter);
            })
            ->when($typeFilter !== 'All', function ($query) use ($typeFilter) {
                $query->where('type', strtolower($typeFilter));
            })
            ->when($confidenceFilter !== 'All', function ($query) use ($confidenceFilter) {
                $query->whereHas('aiPredictionLog', function ($q) use ($confidenceFilter) {
                    if ($confidenceFilter === 'High') {
                        $q->where('confidence', '>=', 0.80);
                    } elseif ($confidenceFilter === 'Medium') {
                        $q->where('confidence', '>=', 0.50)->where('confidence', '<', 0.80);
                    } elseif ($confidenceFilter === 'Low') {
                        $q->where('confidence', '<', 0.50);
                    }
                });
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('location', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('breed', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('contact_name', 'like', "%{$search}%")
                        ->orWhere('id', '=', $search);
                });
            });

        $reports = $reportsQuery->latest()->paginate(10)->withQueryString();

        $volunteers = User::query()
            ->where('role', Role::Volunteer->value)
            ->orderBy('name')
            ->get();

        $systemSettings = SystemSetting::getValue('system_settings', []);
        $breedGuideEnabled = (bool) ($systemSettings['ai_breed_guide_enabled'] ?? true);

        return Inertia::render('admin/ai-validation', [
            'reports' => $reports,
            'volunteers' => $volunteers,
            'breed_guide_enabled' => $breedGuideEnabled,
            'stats' => [
                'total_ai_reports' => $totalAiReports,
                'pending_validation' => $pendingValidation,
                'accuracy_rate' => round($accuracyRate, 2),
                'average_confidence' => round($avgConfidence * 100, 2),
            ],
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'animal_type' => $animalTypeFilter,
                'confidence_level' => $confidenceFilter,
                'type' => $typeFilter,
            ],
        ]);
    }

    /**
     * Approve AI predicted details for a pet report and optionally assign a volunteer for rescue dispatch.
     */
    public function approve(Request $request, PetReport $report): RedirectResponse
    {
        if (! $report->ai_prediction_log_id) {
            abort(400, 'This report does not contain AI prediction details.');
        }

        $validated = $request->validate([
            'volunteer_id' => ['nullable', 'exists:users,id'],
        ]);

        // 1. Update report validation status and optional dispatch assignment
        $reportUpdates = [
            'ai_validation_status' => 'approved',
        ];

        $volunteerAssigned = false;
        if (! empty($validated['volunteer_id'])) {
            $volunteer = User::query()->findOrFail($validated['volunteer_id']);
            $reportUpdates['assigned_volunteer_id'] = $volunteer->id;
            $reportUpdates['status'] = 'assigned';
            $volunteerAssigned = true;
        }

        $report->update($reportUpdates);

        if ($volunteerAssigned && isset($volunteer)) {
            $taskType = match ($report->type) {
                'sos' => 'Emergency SOS Responder',
                'missing' => 'Missing Search Team',
                default => 'Rescue Responder (Rescue)',
            };

            AssignedTask::firstOrCreate(
                [
                    'user_id' => $volunteer->id,
                    'pet_report_id' => $report->id,
                    'status' => 'pending',
                ],
                [
                    'role' => $taskType,
                    'hours_logged' => 0.00,
                ]
            );

            $volunteer->notify(new RescueTaskAssignedNotification($report));
        }

        // 2. Update accuracy calibration log
        $report->aiPredictionLog->update([
            'is_accurate' => true,
        ]);

        // 3. Log audit action
        AuditLog::log('ai_validation_approve', "Approved AI details for report #{$report->id}".($volunteerAssigned ? " and dispatched volunteer #{$volunteer->id}" : ''));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $volunteerAssigned ? 'AI details approved and volunteer dispatched successfully.' : 'AI details approved successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Reject or correct AI details for a pet report.
     */
    public function reject(Request $request, PetReport $report): RedirectResponse
    {
        if (! $report->ai_prediction_log_id) {
            abort(400, 'This report does not contain AI prediction details.');
        }

        // Validate possible corrected fields
        $validated = $request->validate([
            'animal_type' => ['nullable', 'string', 'in:Dog,Cat,Other'],
            'breed' => ['nullable', 'string', 'max:255'],
            'age_category' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        // 1. Update validation status
        $reportData = [
            'ai_validation_status' => 'rejected',
        ];

        // 2. If corrected details are supplied, update the report
        $correctedFields = array_filter($validated, fn ($value) => ! is_null($value));
        if (! empty($correctedFields)) {
            $reportData = array_merge($reportData, $correctedFields);
        }

        $report->update($reportData);

        // 3. Mark prediction log as inaccurate
        $report->aiPredictionLog->update([
            'is_accurate' => false,
        ]);

        // 4. Log audit action
        AuditLog::log('ai_validation_reject', "Rejected/Corrected AI details for report #{$report->id}");

        Inertia::flash('toast', [
            'type' => 'warning',
            'message' => 'AI details rejected and updated successfully.',
        ]);

        return redirect()->back();
    }
}
