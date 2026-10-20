<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Events\PetRescueSubmittedEvent;
use App\Models\AiPredictionLog;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\PetReport;
use App\Models\SystemSetting;
use App\Models\User;
use App\Notifications\RescueReportSubmittedNotification;
use App\Notifications\RescueStatusUpdatedNotification;
use App\Notifications\SubmissionEReceiptNotification;
use App\Support\EReceiptDispatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
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
            'description' => ['nullable', 'string', 'max:2500'],
            'location' => ['required', 'string', 'max:255'],
            'contact_name' => [$user ? 'nullable' : 'required', 'string', 'max:255'],
            'contact_phone' => [$user ? 'nullable' : 'required', 'string', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:10240'],
            'ai_prediction_log_id' => ['nullable', 'integer', 'exists:ai_prediction_logs,id'],
            'animals' => ['nullable'],
        ]);

        $description = $validated['description'] ?? null;
        $animalsInput = $request->input('animals');
        if (is_string($animalsInput)) {
            $animalsInput = json_decode($animalsInput, true);
        }

        if (is_array($animalsInput) && count($animalsInput) > 1) {
            $multiBreakdown = "\n\n🐾 [Multi-Animal Incident - ".count($animalsInput)." Animals Reviewed]:\n";
            foreach ($animalsInput as $idx => $animal) {
                $num = $idx + 1;
                $sp = $animal['species'] ?? $animal['animal_type'] ?? 'Unknown';
                $br = $animal['breed'] ?? 'Unknown Breed';
                $ag = $animal['ageCategory'] ?? $animal['age_category'] ?? ($animal['age_group'] ?? 'Unknown Age');
                $gn = $animal['gender'] ?? 'Unknown';
                $nm = ! empty($animal['suggestedName'] ?? $animal['name'] ?? null) ? ' (Name: '.($animal['suggestedName'] ?? $animal['name']).')' : '';
                $multiBreakdown .= "• Animal #{$num}: {$sp} · {$br} | {$ag} | {$gn}{$nm}\n";
            }
            $description = trim(($description ?? '').$multiBreakdown);
        }

        $aiResolution = $this->resolveAiValidationStatus($validated['ai_prediction_log_id'] ?? null);

        $report = PetReport::create([
            'user_id' => $user ? $user->id : null,
            'type' => 'rescue',
            'status' => 'pending',
            'animal_type' => $validated['animal_type'],
            'breed' => $validated['breed'] ?? null,
            'age_category' => $validated['age_category'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'name' => $validated['name'] ?? null,
            'description' => $description,
            'location' => $validated['location'],
            'contact_name' => ! empty($validated['contact_name']) ? $validated['contact_name'] : ($user ? $user->name : 'Anonymous'),
            'contact_phone' => ! empty($validated['contact_phone']) ? $validated['contact_phone'] : null,
            'contact_email' => ! empty($validated['contact_email']) ? $validated['contact_email'] : ($user ? $user->email : null),
            'ai_prediction_log_id' => $validated['ai_prediction_log_id'] ?? null,
            'ai_validation_status' => $aiResolution['status'],
        ]);

        $this->uploadPhotos($request, $report);

        $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new RescueReportSubmittedNotification($report));
        }

        EReceiptDispatcher::sendToEmail(
            $report->contact_email,
            SubmissionEReceiptNotification::forPetReport($report)
        );

        PetRescueSubmittedEvent::dispatch($report);

        AuditLog::log('rescue_report_submit', "Submitted rescue report at {$validated['location']}");

        if ($aiResolution['auto_approved']) {
            AuditLog::log('ai_auto_validation', "Automatically approved AI details for rescue report #{$report->id} (confidence: {$aiResolution['confidence']})");
        }

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
            'gender' => ['nullable', 'string', 'max:50'],
            'ageCategory' => ['nullable', 'string', 'max:50'],
            'size' => ['nullable', 'string', 'max:50'],
            'reward' => ['nullable', 'string', 'max:100'],
            'medicalConditions' => ['nullable', 'string', 'max:1000'],
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

        $aiResolution = $this->resolveAiValidationStatus($validated['ai_prediction_log_id'] ?? null);

        $report = PetReport::create([
            'user_id' => $user ? $user->id : null,
            'type' => 'missing',
            'status' => 'pending',
            'name' => $validated['petName'],
            'animal_type' => $validated['petType'],
            'breed' => $validated['breed'] ?? null,
            'color' => $validated['color'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'age_category' => $validated['ageCategory'] ?? null,
            'size' => $validated['size'] ?? null,
            'reward' => $validated['reward'] ?? null,
            'medical_conditions' => $validated['medicalConditions'] ?? null,
            'location' => $validated['lastSeenLocation'],
            'last_seen_date' => $validated['lastSeenDate'],
            'description' => $desc,
            'contact_name' => $validated['contactName'],
            'contact_phone' => $validated['contactPhone'],
            'contact_email' => $validated['contactEmail'] ?? null,
            'ai_prediction_log_id' => $validated['ai_prediction_log_id'] ?? null,
            'ai_validation_status' => $aiResolution['status'],
        ]);

        $this->uploadPhotos($request, $report);

        $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new RescueReportSubmittedNotification($report));
        }

        EReceiptDispatcher::sendToEmail(
            $report->contact_email,
            SubmissionEReceiptNotification::forPetReport($report)
        );

        AuditLog::log('missing_report_submit', "Submitted missing pet report for '{$validated['petName']}'");

        if ($aiResolution['auto_approved']) {
            AuditLog::log('ai_auto_validation', "Automatically approved AI details for missing pet report #{$report->id} (confidence: {$aiResolution['confidence']})");
        }

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
        if (! $request->has('animalType') && $request->has('animal_type')) {
            $request->merge(['animalType' => $request->input('animal_type')]);
        }
        if (! $request->has('situationType') && $request->has('situation_type')) {
            $request->merge(['situationType' => $request->input('situation_type')]);
        }
        if (! $request->has('contactName') && $request->has('contact_name')) {
            $request->merge(['contactName' => $request->input('contact_name')]);
        }
        if (! $request->has('contactPhone') && $request->has('contact_phone')) {
            $request->merge(['contactPhone' => $request->input('contact_phone')]);
        }
        $isMultiple = is_array($request->file('images'));
        $imageRule = ['max:10240', 'mimes:jpeg,png,jpg,gif,svg,webp,heic,heif,bmp'];

        $validated = $request->validate([
            'animalType' => ['required', 'string', 'in:Dog,Cat,Other'],
            'location' => ['required', 'string', 'max:255'],
            'urgency' => ['required', 'string', 'in:low,medium,high'],
            'situationType' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:1000'],
            'contactName' => ['nullable', 'string', 'max:255'],
            'contactPhone' => ['nullable', 'string', 'max:255'],
            'images' => $isMultiple ? ['nullable', 'array'] : ['nullable', ...$imageRule],
            'images.*' => $imageRule,
            'ai_prediction_log_id' => ['nullable', 'integer', 'exists:ai_prediction_logs,id'],
        ]);

        $user = Auth::user();

        $aiResolution = $this->resolveAiValidationStatus($validated['ai_prediction_log_id'] ?? null);

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
            'ai_validation_status' => $aiResolution['status'],
        ]);

        $this->uploadPhotos($request, $report);

        $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new RescueReportSubmittedNotification($report));
        }

        EReceiptDispatcher::sendToEmail(
            $report->contact_email,
            SubmissionEReceiptNotification::forPetReport($report)
        );

        AuditLog::log('sos_report_submit', "Submitted SOS report at {$validated['location']}");

        if ($aiResolution['auto_approved']) {
            AuditLog::log('ai_auto_validation', "Automatically approved AI details for SOS emergency report #{$report->id} (confidence: {$aiResolution['confidence']})");
        }

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
            $files = $request->file('images');
            if (! is_array($files)) {
                $files = [$files];
            }
            foreach ($files as $file) {
                if ($file instanceof UploadedFile && $file->isValid()) {
                    $path = $file->store('pet_reports', 'public');
                    $report->photos()->create([
                        'path' => '/storage/'.$path,
                        'original_filename' => $file->getClientOriginalName(),
                        'mime_type' => $file->getClientMimeType() ?: 'image/jpeg',
                        'file_size' => $file->getSize(),
                    ]);
                }
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

        EReceiptDispatcher::sendToUserAndEmail(
            $report->user,
            $report->contact_email,
            new RescueStatusUpdatedNotification($report)
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Rescue report status updated successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Determine initial AI validation status based on system settings and prediction confidence.
     *
     * @return array{status: ?string, auto_approved: bool, confidence: ?float}
     */
    private function resolveAiValidationStatus(?int $predictionLogId): array
    {
        if (empty($predictionLogId)) {
            return ['status' => null, 'auto_approved' => false, 'confidence' => null];
        }

        $settings = SystemSetting::getValue('ai_settings', [
            'ai_enabled' => true,
            'ai_auto_validation' => false,
            'ai_confidence_threshold' => 0.70,
        ]);

        $log = AiPredictionLog::find($predictionLogId);
        $confidence = $log?->confidence !== null ? (float) $log->confidence : null;

        $autoValidate = ! empty($settings['ai_auto_validation']);
        $threshold = (float) ($settings['ai_confidence_threshold'] ?? 0.70);

        if ($autoValidate && $confidence !== null && $confidence >= $threshold) {
            $log?->update(['is_accurate' => true]);

            return ['status' => 'approved', 'auto_approved' => true, 'confidence' => $confidence];
        }

        return ['status' => 'pending', 'auto_approved' => false, 'confidence' => $confidence];
    }
}
