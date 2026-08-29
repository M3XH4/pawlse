<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\PetReport;
use App\Models\User;
use App\Notifications\RescueReportSubmittedNotification;
use App\Notifications\RescueStatusUpdatedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class PetReportController extends Controller
{
    /**
     * Store stray rescue report.
     */
    public function storeRescue(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'animal_type' => ['required', 'string', 'in:Dog,Cat,Other'],
            'breed' => ['nullable', 'string', 'max:255'],
            'age_category' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'location' => ['required', 'string', 'max:255'],
            'contact_name' => [$user ? 'nullable' : 'required', 'string', 'max:255'],
            'contact_phone' => [$user ? 'nullable' : 'required', 'string', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:10240'],
            'ai_prediction_log_id' => ['nullable', 'integer', 'exists:ai_prediction_logs,id'],
        ]);

        $report = PetReport::create([
            'user_id' => $user ? $user->id : null,
            'type' => 'rescue',
            'status' => 'pending',
            'animal_type' => $validated['animal_type'],
            'breed' => $validated['breed'] ?? null,
            'age_category' => $validated['age_category'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'name' => $validated['name'] ?? null,
            'description' => $validated['description'] ?? null,
            'location' => $validated['location'],
            'contact_name' => ! empty($validated['contact_name']) ? $validated['contact_name'] : ($user ? $user->name : 'Anonymous'),
            'contact_phone' => ! empty($validated['contact_phone']) ? $validated['contact_phone'] : null,
            'contact_email' => ! empty($validated['contact_email']) ? $validated['contact_email'] : ($user ? $user->email : null),
            'ai_prediction_log_id' => $validated['ai_prediction_log_id'] ?? null,
            'ai_validation_status' => isset($validated['ai_prediction_log_id']) ? 'pending' : null,
        ]);

        $this->uploadPhotos($request, $report);

        $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new RescueReportSubmittedNotification($report));
        }

        AuditLog::log('rescue_report_submit', "Submitted rescue report at {$validated['location']}");

        if ($report->is_duplicate) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => 'Your report was submitted, but flagged as a potential duplicate.',
            ]);
        } else {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Rescue report submitted successfully.',
            ]);
        }

        return redirect()->back();
    }

    /**
     * Store missing pet report.
     */
    public function storeMissing(Request $request)
    {
        $validated = $request->validate([
            'petName' => ['required', 'string', 'max:255'],
            'petType' => ['required', 'string', 'in:Dog,Cat,Other'],
            'breed' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:255'],
            'lastSeenLocation' => ['required', 'string', 'max:255'],
            'lastSeenDate' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:1000'],
            'distinguishingFeatures' => ['nullable', 'string', 'max:1000'],
            'contactName' => ['required', 'string', 'max:255'],
            'contactPhone' => ['required', 'string', 'max:255'],
            'contactEmail' => ['nullable', 'email', 'max:255'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:10240'],
            'ai_prediction_log_id' => ['nullable', 'integer', 'exists:ai_prediction_logs,id'],
        ]);

        $user = Auth::user();

        $desc = $validated['description'] ?? '';
        if (! empty($validated['distinguishingFeatures'])) {
            $desc .= "\n\nDistinguishing Features: ".$validated['distinguishingFeatures'];
        }

        $report = PetReport::create([
            'user_id' => $user ? $user->id : null,
            'type' => 'missing',
            'status' => 'pending',
            'name' => $validated['petName'],
            'animal_type' => $validated['petType'],
            'breed' => $validated['breed'] ?? null,
            'color' => $validated['color'] ?? null,
            'location' => $validated['lastSeenLocation'],
            'last_seen_date' => $validated['lastSeenDate'],
            'description' => $desc,
            'contact_name' => $validated['contactName'],
            'contact_phone' => $validated['contactPhone'],
            'contact_email' => $validated['contactEmail'] ?? null,
            'ai_prediction_log_id' => $validated['ai_prediction_log_id'] ?? null,
            'ai_validation_status' => isset($validated['ai_prediction_log_id']) ? 'pending' : null,
        ]);

        $this->uploadPhotos($request, $report);

        $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new RescueReportSubmittedNotification($report));
        }

        AuditLog::log('missing_report_submit', "Submitted missing pet report for '{$validated['petName']}'");

        if ($report->is_duplicate) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => 'Report submitted, but flagged as a potential duplicate.',
            ]);
        } else {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Missing pet report submitted successfully.',
            ]);
        }

        return redirect()->back();
    }

    /**
     * Store SOS report.
     */
    public function storeSos(Request $request)
    {
        $validated = $request->validate([
            'animalType' => ['required', 'string', 'in:Dog,Cat,Other'],
            'location' => ['required', 'string', 'max:255'],
            'urgency' => ['required', 'string', 'in:low,medium,high'],
            'situationType' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:1000'],
            'contactName' => ['nullable', 'string', 'max:255'],
            'contactPhone' => ['nullable', 'string', 'max:255'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:10240'],
            'ai_prediction_log_id' => ['nullable', 'integer', 'exists:ai_prediction_logs,id'],
        ]);

        $user = Auth::user();

        $report = PetReport::create([
            'user_id' => $user ? $user->id : null,
            'type' => 'sos',
            'status' => 'pending',
            'animal_type' => $validated['animalType'],
            'location' => $validated['location'],
            'urgency' => $validated['urgency'],
            'situation_type' => $validated['situationType'],
            'description' => $validated['description'],
            'contact_name' => $validated['contactName'] ?? ($user ? $user->name : 'Anonymous'),
            'contact_phone' => $validated['contactPhone'] ?? null,
            'contact_email' => $user ? $user->email : null,
            'ai_prediction_log_id' => $validated['ai_prediction_log_id'] ?? null,
            'ai_validation_status' => isset($validated['ai_prediction_log_id']) ? 'pending' : null,
        ]);

        $this->uploadPhotos($request, $report);

        $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new RescueReportSubmittedNotification($report));
        }

        AuditLog::log('sos_report_submit', "Submitted SOS report at {$validated['location']}");

        if ($report->is_duplicate) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => 'SOS report submitted, but flagged as a potential duplicate.',
            ]);
        } else {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'SOS emergency report submitted successfully!',
            ]);
        }

        return redirect()->back();
    }

    /**
     * Upload photos helper.
     */
    protected function uploadPhotos(Request $request, PetReport $report)
    {
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('pet_reports', 'public');
                $report->photos()->create([
                    'path' => '/storage/'.$path,
                    'original_filename' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }
    }

    /**
     * Public page listing missing/found reports.
     */
    public function missingIndex(Request $request): Response
    {
        $search = $request->input('search', '');
        $statusFilter = $request->input('status', 'All'); // All, Missing (pending/assigned), Found (resolved)

        $reportsQuery = PetReport::with('photos')
            ->where('type', 'missing')
            ->when($statusFilter !== 'All', function ($query) use ($statusFilter) {
                if ($statusFilter === 'Missing') {
                    $query->whereIn('status', ['pending', 'assigned']);
                } elseif ($statusFilter === 'Searching') {
                    $query->where('status', 'assigned');
                } elseif ($statusFilter === 'Found') {
                    $query->where('status', 'resolved');
                }
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('breed', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            });

        $reports = $reportsQuery->latest()->paginate(9)->withQueryString();

        return Inertia::render('missing', [
            'reports' => $reports,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * User's reports history list.
     */
    public function userReports(Request $request): Response
    {
        $user = $request->user();
        $search = $request->input('search', '');
        $typeFilter = $request->input('type', 'All');

        $reportsQuery = PetReport::with(['photos', 'assignedVolunteer'])
            ->where('user_id', $user->id)
            ->whereIn('type', ['rescue', 'sos'])
            ->when($typeFilter !== 'All', function ($query) use ($typeFilter) {
                $query->where('type', strtolower($typeFilter));
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('location', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            });

        $reports = $reportsQuery->latest()->paginate(10)->withQueryString();

        return Inertia::render('user/rescue-reports', [
            'reports' => $reports,
            'filters' => [
                'search' => $search,
                'type' => $typeFilter,
            ],
        ]);
    }

    /**
     * User's missing/found reports list.
     */
    public function userMissingFoundReports(Request $request): Response
    {
        $user = $request->user();
        $search = $request->input('search', '');

        $reportsQuery = PetReport::with(['photos'])
            ->where('user_id', $user->id)
            ->where('type', 'missing')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('location', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            });

        $reports = $reportsQuery->latest()->paginate(10)->withQueryString();

        return Inertia::render('user/missing-found', [
            'reports' => $reports,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Volunteer's assigned reports list.
     */
    public function volunteerReports(Request $request): Response
    {
        $user = $request->user();
        $search = $request->input('search', '');
        $statusFilter = $request->input('status', 'assigned'); // pending, resolved, cancelled

        $reportsQuery = PetReport::with(['photos'])
            ->where('assigned_volunteer_id', $user->id)
            ->when($statusFilter !== 'All', function ($query) use ($statusFilter) {
                $query->where('status', $statusFilter);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('location', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            });

        $reports = $reportsQuery->latest()->paginate(10)->withQueryString();

        return Inertia::render('volunteer/rescue-reports', [
            'reports' => $reports,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Volunteer updates the status of their assigned rescue report.
     */
    public function updateStatus(Request $request, PetReport $report): RedirectResponse
    {
        $user = $request->user();

        if ($report->assigned_volunteer_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:assigned,resolved,cancelled'],
        ]);

        $report->update([
            'status' => $validated['status'],
        ]);

        AuditLog::log('volunteer_rescue_status_update', "Updated rescue report status for report ID {$report->id} to {$validated['status']}");

        // Propagate status change to the associated volunteer tasks
        if ($validated['status'] === 'resolved') {
            AssignedTask::query()
                ->where('pet_report_id', $report->id)
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->update(['status' => 'completed']);
        } elseif ($validated['status'] === 'cancelled') {
            AssignedTask::query()
                ->where('pet_report_id', $report->id)
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->update(['status' => 'cancelled']);
        }

        if ($report->user) {
            $report->user->notify(new RescueStatusUpdatedNotification($report));
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Rescue report status updated successfully.',
        ]);

        return redirect()->back();
    }
}
