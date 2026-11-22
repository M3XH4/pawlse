<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Events\PetRescueSubmittedEvent;
use App\Models\AiPredictionLog;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\Partner;
use App\Models\PetReport;
use App\Models\SystemSetting;
use App\Models\User;
use App\Notifications\RescueReportSubmittedNotification;
use App\Notifications\RescueStatusUpdatedNotification;
use App\Notifications\SubmissionEReceiptNotification;
use App\Support\EReceiptDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
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
        $contactEmail = ! empty($validated['contact_email']) ? $validated['contact_email'] : ($user ? $user->email : null);
        $resolvedUserId = $user?->id;
        if (! $resolvedUserId && ! empty($contactEmail)) {
            $resolvedUserId = User::whereRaw('LOWER(email) = ?', [strtolower($contactEmail)])->value('id');
        }

        $report = PetReport::create([
            'user_id' => $resolvedUserId,
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
            'contact_email' => $contactEmail,
            'ai_prediction_log_id' => $validated['ai_prediction_log_id'] ?? null,
            'ai_validation_status' => $aiResolution['status'],
        ]);

        $this->uploadPhotos($request, $report);

        $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new RescueReportSubmittedNotification($report));
        }

        EReceiptDispatcher::sendToUserAndEmail(
            $report->user ?? $user,
            $report->contact_email,
            SubmissionEReceiptNotification::forPetReport($report)
        );

        PetRescueSubmittedEvent::dispatch($report);

        AuditLog::log('rescue_report_submit', "Submitted rescue report at {$validated['location']}");

        if ($aiResolution['auto_approved']) {
            AuditLog::log('ai_auto_validation', "Automatically approved AI details for rescue report #{$report->id} (confidence: {$aiResolution['confidence']})");
        }

        $ref = 'RES-'.str_pad((string) $report->id, 5, '0', STR_PAD_LEFT);

        if ($report->is_duplicate) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => "Your report (Ref: {$ref}) was submitted, but flagged as a potential duplicate.",
            ]);
        } else {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "Rescue report submitted successfully (Ref: {$ref}).",
            ]);
        }

        if (! $request->user() && $report->contact_email) {
            return redirect()->route('track', ['reference' => $ref, 'email' => $report->contact_email]);
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
        $contactEmail = ! empty($validated['contactEmail']) ? $validated['contactEmail'] : ($user ? $user->email : null);
        $resolvedUserId = $user?->id;
        if (! $resolvedUserId && ! empty($contactEmail)) {
            $resolvedUserId = User::whereRaw('LOWER(email) = ?', [strtolower($contactEmail)])->value('id');
        }

        $report = PetReport::create([
            'user_id' => $resolvedUserId,
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
            'contact_email' => $contactEmail,
            'ai_prediction_log_id' => $validated['ai_prediction_log_id'] ?? null,
            'ai_validation_status' => $aiResolution['status'],
        ]);

        $this->uploadPhotos($request, $report);

        $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new RescueReportSubmittedNotification($report));
        }

        EReceiptDispatcher::sendToUserAndEmail(
            $report->user ?? $user,
            $report->contact_email,
            SubmissionEReceiptNotification::forPetReport($report)
        );

        if (! $report->is_duplicate) {
            PetRescueSubmittedEvent::dispatch($report);
        }

        AuditLog::log('missing_report_submit', "Submitted missing pet report for '{$validated['petName']}'");

        if ($aiResolution['auto_approved']) {
            AuditLog::log('ai_auto_validation', "Automatically approved AI details for missing pet report #{$report->id} (confidence: {$aiResolution['confidence']})");
        }

        $ref = 'MIS-'.str_pad((string) $report->id, 5, '0', STR_PAD_LEFT);

        if ($request->hasSession()) {
            $request->session()->flash('submitted_report', [
                'reference' => $ref,
                'email' => $report->contact_email,
                'type' => 'missing',
                'is_duplicate' => (bool) $report->is_duplicate,
            ]);
        }

        if ($report->is_duplicate) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => "Report submitted, but flagged as a potential duplicate (Ref: {$ref}).",
            ]);
        } else {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "Missing pet report submitted successfully (Ref: {$ref}).",
            ]);
        }

        return redirect()->back();
    }

    /**
     * Display the public SOS emergency report page with veterinary clinics.
     */
    public function sos(): Response
    {
        $veterinaryClinics = Partner::active()
            ->veterinary()
            ->orderByDesc('is_featured')
            ->orderBy('display_order')
            ->get([
                'id',
                'name',
                'slug',
                'badge_title',
                'address',
                'city',
                'latitude',
                'longitude',
                'phone',
                'operating_hours',
                'is_emergency',
                'is_featured',
                'display_order',
            ]);

        $systemSettings = SystemSetting::getValue('system_settings', []);
        $sosGpsEnabled = (bool) ($systemSettings['sos_gps_enabled'] ?? true);

        return Inertia::render('sos', [
            'veterinaryClinics' => $veterinaryClinics,
            'sosGpsEnabled' => $sosGpsEnabled,
        ]);
    }

    /**
     * Find the nearest real veterinary clinics around the given coordinates.
     */
    public function nearbyVets(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $lat = (float) $validated['lat'];
        $lng = (float) $validated['lng'];
        $cacheKey = 'nearby_vets_'.round($lat, 3).'_'.round($lng, 3);

        $clinics = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($lat, $lng): array {
            $googleKey = config('services.google_maps.api_key');

            if (! empty($googleKey)) {
                $googleResults = $this->fetchGoogleNearbyVets($lat, $lng, $googleKey);
                if (! empty($googleResults)) {
                    return $googleResults;
                }
            }

            return $this->fetchNominatimNearbyVets($lat, $lng);
        });

        return response()->json([
            'clinics' => $clinics,
        ]);
    }

    /**
     * Query Google Places API (New) for nearest veterinary clinics.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function fetchGoogleNearbyVets(float $lat, float $lng, string $apiKey): array
    {
        try {
            $response = Http::timeout(8)
                ->withHeaders([
                    'X-Goog-Api-Key' => $apiKey,
                    'X-Goog-FieldMask' => 'places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.location,places.nationalPhoneNumber,places.internationalPhoneNumber,places.regularOpeningHours',
                ])
                ->post('https://places.googleapis.com/v1/places:searchNearby', [
                    'includedTypes' => ['veterinary_care'],
                    'maxResultCount' => 8,
                    'rankPreference' => 'DISTANCE',
                    'locationRestriction' => [
                        'circle' => [
                            'center' => [
                                'latitude' => $lat,
                                'longitude' => $lng,
                            ],
                            'radius' => 25000.0,
                        ],
                    ],
                ]);

            if (! $response->successful()) {
                return [];
            }

            $places = collect($response->json('places', []))->take(5)->values();
            if ($places->isEmpty()) {
                return [];
            }

            $todayIndex = now()->dayOfWeekIso - 1;

            return $places
                ->map(function (array $place) use ($lat, $lng, $todayIndex): ?array {
                    $pLat = $place['location']['latitude'] ?? null;
                    $pLng = $place['location']['longitude'] ?? null;
                    if (! is_numeric($pLat) || ! is_numeric($pLng)) {
                        return null;
                    }

                    $phone = $place['nationalPhoneNumber']
                        ?? $place['internationalPhoneNumber']
                        ?? null;

                    $weekdayDescriptions = $place['regularOpeningHours']['weekdayDescriptions'] ?? null;
                    $operatingHours = null;
                    if (is_array($weekdayDescriptions) && isset($weekdayDescriptions[$todayIndex])) {
                        $operatingHours = $weekdayDescriptions[$todayIndex];
                    } elseif (isset($place['regularOpeningHours']['openNow'])) {
                        $operatingHours = $place['regularOpeningHours']['openNow'] ? 'Open Now' : 'Currently Closed';
                    }

                    return [
                        'id' => 'gmaps-'.($place['id'] ?? uniqid()),
                        'name' => $place['displayName']['text'] ?? 'Veterinary Clinic',
                        'address' => $place['shortFormattedAddress'] ?? $place['formattedAddress'] ?? 'Nearby Veterinary Clinic',
                        'phone' => $phone,
                        'operating_hours' => $operatingHours,
                        'latitude' => (float) $pLat,
                        'longitude' => (float) $pLng,
                        'distance_km' => round(PetReport::haversineDistance($lat, $lng, (float) $pLat, (float) $pLng), 2),
                    ];
                })
                ->filter()
                ->values()
                ->all();
        } catch (\Throwable) {
            return [];
        }
    }

    /**
     * Query OpenStreetMap Nominatim for nearby veterinary clinics.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function fetchNominatimNearbyVets(float $lat, float $lng): array
    {
        $delta = 0.35;
        $viewbox = sprintf(
            '%.5f,%.5f,%.5f,%.5f',
            $lng - $delta,
            $lat + $delta,
            $lng + $delta,
            $lat - $delta
        );

        $collected = collect();

        foreach (['veterinary', 'vet clinic'] as $query) {
            try {
                $response = Http::timeout(8)
                    ->withHeaders(['User-Agent' => 'PawlseRescueApp/1.0'])
                    ->get('https://nominatim.openstreetmap.org/search', [
                        'format' => 'jsonv2',
                        'q' => $query,
                        'viewbox' => $viewbox,
                        'bounded' => 1,
                        'limit' => 15,
                        'extratags' => 1,
                        'addressdetails' => 1,
                    ]);

                if (! $response->successful()) {
                    continue;
                }

                $items = $response->json();
                if (! is_array($items)) {
                    continue;
                }

                foreach ($items as $item) {
                    $name = trim((string) ($item['name'] ?? ''));
                    if ($name === '' || stripos($name, 'check point') !== false || stripos($name, 'checkpoint') !== false) {
                        continue;
                    }

                    $pLat = isset($item['lat']) ? (float) $item['lat'] : null;
                    $pLng = isset($item['lon']) ? (float) $item['lon'] : null;
                    if ($pLat === null || $pLng === null) {
                        continue;
                    }

                    $addr = $item['address'] ?? [];
                    $addressParts = array_filter([
                        $addr['road'] ?? $addr['street'] ?? null,
                        $addr['suburb'] ?? $addr['neighbourhood'] ?? $addr['village'] ?? $addr['quarter'] ?? null,
                        $addr['city'] ?? $addr['town'] ?? $addr['municipality'] ?? null,
                    ]);

                    $extratags = is_array($item['extratags'] ?? null) ? $item['extratags'] : [];

                    $collected->push([
                        'id' => 'osm-'.($item['place_id'] ?? uniqid()),
                        'name' => $name,
                        'address' => ! empty($addressParts)
                            ? implode(', ', $addressParts)
                            : ($item['display_name'] ?? 'Nearby Veterinary Clinic'),
                        'phone' => $extratags['phone']
                            ?? $extratags['contact:phone']
                            ?? $extratags['contact:mobile']
                            ?? $extratags['phone:mobile']
                            ?? $extratags['telephone']
                            ?? null,
                        'operating_hours' => $extratags['opening_hours']
                            ?? $extratags['opening_hours:covid19']
                            ?? null,
                        'latitude' => $pLat,
                        'longitude' => $pLng,
                        'distance_km' => round(PetReport::haversineDistance($lat, $lng, $pLat, $pLng), 2),
                    ]);
                }

                if ($collected->count() >= 5) {
                    break;
                }
            } catch (\Throwable) {
                continue;
            }
        }

        return $collected
            ->unique(fn (array $c) => strtolower($c['name']))
            ->sortBy('distance_km')
            ->take(8)
            ->values()
            ->all();
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
        if (! $request->has('contactEmail') && $request->has('contact_email')) {
            $request->merge(['contactEmail' => $request->input('contact_email')]);
        }
        $isMultiple = is_array($request->file('images'));
        $evidenceRule = ['max:51200', 'mimes:jpeg,png,jpg,gif,svg,webp,heic,heif,bmp,mp4,mov,avi,webm,mkv,3gp'];

        $validated = $request->validate([
            'animalType' => ['required', 'string', 'in:Dog,Cat,Other'],
            'location' => ['required', 'string', 'max:255'],
            'urgency' => ['required', 'string', 'in:low,medium,high'],
            'situationType' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:1000'],
            'contactName' => ['nullable', 'string', 'max:255'],
            'contactPhone' => ['nullable', 'string', 'max:255'],
            'contactEmail' => ['nullable', 'email', 'max:255'],
            'images' => $isMultiple ? ['nullable', 'array'] : ['nullable', ...$evidenceRule],
            'images.*' => $evidenceRule,
            'ai_prediction_log_id' => ['nullable', 'integer', 'exists:ai_prediction_logs,id'],
        ]);

        $user = Auth::user();

        $aiResolution = $this->resolveAiValidationStatus($validated['ai_prediction_log_id'] ?? null);
        $contactEmail = ! empty($validated['contactEmail']) ? $validated['contactEmail'] : ($user ? $user->email : null);
        $resolvedUserId = $user?->id;
        if (! $resolvedUserId && ! empty($contactEmail)) {
            $resolvedUserId = User::whereRaw('LOWER(email) = ?', [strtolower($contactEmail)])->value('id');
        }

        $report = PetReport::create([
            'user_id' => $resolvedUserId,
            'type' => 'sos',
            'status' => 'pending',
            'animal_type' => $validated['animalType'],
            'location' => $validated['location'],
            'urgency' => $validated['urgency'],
            'situation_type' => $validated['situationType'],
            'description' => $validated['description'],
            'contact_name' => ! empty($validated['contactName']) ? $validated['contactName'] : ($user ? $user->name : 'Anonymous'),
            'contact_phone' => ! empty($validated['contactPhone']) ? $validated['contactPhone'] : null,
            'contact_email' => $contactEmail,
            'ai_prediction_log_id' => $validated['ai_prediction_log_id'] ?? null,
            'ai_validation_status' => $aiResolution['status'],
        ]);

        $this->uploadPhotos($request, $report);

        $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new RescueReportSubmittedNotification($report));
        }

        EReceiptDispatcher::sendToUserAndEmail(
            $report->user ?? $user,
            $report->contact_email,
            SubmissionEReceiptNotification::forPetReport($report)
        );

        if (! $report->is_duplicate) {
            PetRescueSubmittedEvent::dispatch($report);
        }

        AuditLog::log('sos_report_submit', "Submitted SOS report at {$validated['location']}");

        if ($aiResolution['auto_approved']) {
            AuditLog::log('ai_auto_validation', "Automatically approved AI details for SOS emergency report #{$report->id} (confidence: {$aiResolution['confidence']})");
        }

        $ref = 'SOS-'.str_pad((string) $report->id, 5, '0', STR_PAD_LEFT);

        if ($request->hasSession()) {
            $request->session()->flash('submitted_report', [
                'reference' => $ref,
                'email' => $report->contact_email,
                'type' => 'sos',
                'is_duplicate' => (bool) $report->is_duplicate,
            ]);
        }

        if ($report->is_duplicate) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => "SOS report submitted, but flagged as a potential duplicate (Ref: {$ref}).",
            ]);
        } else {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "SOS emergency report submitted successfully (Ref: {$ref})!",
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
            ->whereNotIn('status', ['duplicate', 'cancelled'])
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
     * Mark missing pet report as safely reunited by reporter.
     */
    public function markReunited(Request $request, PetReport $report): RedirectResponse
    {
        if ($report->type !== 'missing') {
            abort(404);
        }

        $user = $request->user();
        $email = trim((string) $request->input('email', $request->query('email', '')));

        $isAuthorized = false;
        if ($user && ($report->user_id === $user->id || strtolower(trim((string) $report->contact_email)) === strtolower(trim((string) $user->email)))) {
            $isAuthorized = true;
        } elseif ($email !== '' && strtolower(trim((string) $report->contact_email)) === strtolower($email)) {
            $isAuthorized = true;
        }

        if (! $isAuthorized) {
            abort(403, 'Unauthorized to update this missing report.');
        }

        $report->update([
            'status' => 'resolved',
        ]);

        // Complete any assigned tasks
        AssignedTask::query()
            ->where('pet_report_id', $report->id)
            ->where('status', 'pending')
            ->update(['status' => 'completed']);

        AuditLog::log('missing_pet_reunited', "Missing pet report ID {$report->id} ({$report->name}) marked as safely reunited.");

        EReceiptDispatcher::sendToUserAndEmail(
            $report->user,
            $report->contact_email,
            new RescueStatusUpdatedNotification($report)
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Congratulations! Your missing pet report is now marked as Found & Reunited.',
        ]);

        return redirect()->back();
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
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(contact_email) = ?', [strtolower((string) $user->email)]);
            })
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
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(contact_email) = ?', [strtolower((string) $user->email)]);
            })
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

        $systemSettings = SystemSetting::getValue('system_settings', []);

        return Inertia::render('volunteer/rescue-reports', [
            'reports' => $reports,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
            'volunteerMapEnabled' => (bool) ($systemSettings['volunteer_map_enabled'] ?? true),
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
                ->get()
                ->each(function (AssignedTask $task): void {
                    $task->update([
                        'status' => 'completed',
                        'hours_logged' => $task->resolveAutomaticHours(),
                    ]);
                });
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
