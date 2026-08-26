<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\PetReport;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RescueManagementController extends Controller
{
    /**
     * List all reports with search, filtering, and pagination.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $statusFilter = $request->input('status', 'All');
        $typeFilter = $request->input('type', 'All');
        $duplicateFilter = $request->input('duplicate', 'All'); // All, Yes, No

        $reportsQuery = PetReport::with(['photos', 'assignedVolunteer', 'duplicateOf'])
            ->when($statusFilter !== 'All', function ($query) use ($statusFilter) {
                $query->where('status', $statusFilter);
            })
            ->when($typeFilter !== 'All', function ($query) use ($typeFilter) {
                $query->where('type', strtolower($typeFilter));
            })
            ->when($duplicateFilter !== 'All', function ($query) use ($duplicateFilter) {
                $query->where('is_duplicate', $duplicateFilter === 'Yes');
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('location', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('breed', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('contact_name', 'like', "%{$search}%");
                });
            });

        $reports = $reportsQuery->latest()->paginate(10)->withQueryString();

        // Fetch active volunteers for assignment
        $volunteers = User::query()
            ->where('role', Role::Volunteer->value)
            ->get();

        // Get potential duplicate candidates for linking (active reports from last 48 hours)
        $duplicateCandidates = PetReport::query()
            ->where('is_duplicate', false)
            ->whereIn('status', ['pending', 'assigned'])
            ->latest()
            ->limit(20)
            ->get();

        $stats = [
            'total' => PetReport::count(),
            'pending' => PetReport::where('status', 'pending')->count(),
            'assigned' => PetReport::where('status', 'assigned')->count(),
            'resolved' => PetReport::where('status', 'resolved')->count(),
            'duplicate' => PetReport::where('is_duplicate', true)->count(),
        ];

        return Inertia::render('admin/rescue-management', [
            'reports' => $reports,
            'volunteers' => $volunteers,
            'duplicateCandidates' => $duplicateCandidates,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'type' => $typeFilter,
                'duplicate' => $duplicateFilter,
            ],
        ]);
    }

    /**
     * Assign a volunteer to a report.
     */
    public function assignVolunteer(Request $request, PetReport $report): RedirectResponse
    {
        $validated = $request->validate([
            'volunteer_id' => ['required', 'exists:users,id'],
        ]);

        $volunteer = User::query()->findOrFail($validated['volunteer_id']);

        $report->update([
            'assigned_volunteer_id' => $volunteer->id,
            'status' => 'assigned',
        ]);

        AuditLog::log('rescue_volunteer_assign', "Assigned volunteer {$volunteer->name} to pet report ID {$report->id}");

        // Check if there is already an active assignment to prevent duplicate tasks
        $alreadyAssigned = AssignedTask::query()
            ->where('user_id', $volunteer->id)
            ->where('pet_report_id', $report->id)
            ->where('status', 'pending')
            ->exists();

        if (! $alreadyAssigned) {
            AssignedTask::create([
                'user_id' => $volunteer->id,
                'pet_report_id' => $report->id,
                'role' => 'Rescue Responder ('.ucfirst($report->type).')',
                'status' => 'pending',
                'hours_logged' => 0.00,
            ]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Volunteer {$volunteer->name} successfully assigned to this report.",
        ]);

        return redirect()->back();
    }

    /**
     * Update the status of a report.
     */
    public function updateStatus(Request $request, PetReport $report): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,assigned,resolved,duplicate,cancelled'],
        ]);

        $report->update([
            'status' => $validated['status'],
        ]);

        AuditLog::log('rescue_report_status_update', "Updated pet report ID {$report->id} status to {$validated['status']}");

        // Propagate status change to the associated volunteer tasks
        if ($validated['status'] === 'resolved') {
            AssignedTask::query()
                ->where('pet_report_id', $report->id)
                ->where('status', 'pending')
                ->update(['status' => 'completed']);
        } elseif ($validated['status'] === 'cancelled') {
            AssignedTask::query()
                ->where('pet_report_id', $report->id)
                ->where('status', 'pending')
                ->update(['status' => 'cancelled']);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Report status updated to '.ucfirst($validated['status']).'.',
        ]);

        return redirect()->back();
    }

    /**
     * Manually flag or unflag a report as a duplicate.
     */
    public function resolveDuplicate(Request $request, PetReport $report): RedirectResponse
    {
        $validated = $request->validate([
            'is_duplicate' => ['required', 'boolean'],
            'duplicate_of_id' => ['nullable', 'exists:pet_reports,id'],
        ]);

        if ($validated['is_duplicate']) {
            $report->update([
                'is_duplicate' => true,
                'duplicate_of_id' => $validated['duplicate_of_id'],
                'status' => 'duplicate',
            ]);

            AuditLog::log('rescue_report_duplicate_resolve', "Flagged pet report ID {$report->id} as duplicate of ID {$validated['duplicate_of_id']}");

            // If it had a volunteer, cancel their task
            AssignedTask::query()
                ->where('pet_report_id', $report->id)
                ->where('status', 'pending')
                ->update(['status' => 'cancelled']);
        } else {
            $report->update([
                'is_duplicate' => false,
                'duplicate_of_id' => null,
                'status' => 'pending',
            ]);

            AuditLog::log('rescue_report_duplicate_resolve', "Unflagged duplicate status of pet report ID {$report->id}");
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Duplicate status resolved successfully.',
        ]);

        return redirect()->back();
    }
}
