<?php

namespace App\Services;

use App\Enums\DonationStatus;
use App\Enums\Role;
use App\Enums\ShelterAnimalStatus;
use App\Models\AdoptionApplication;
use App\Models\AnimalDonationNeed;
use App\Models\AnimalMedicalRecord;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\Backup;
use App\Models\BlogPost;
use App\Models\CareSustainability;
use App\Models\Certificate;
use App\Models\Donation;
use App\Models\DonationAmountEditRequest;
use App\Models\Event;
use App\Models\FeedingDistributionLog;
use App\Models\FeedingSchedule;
use App\Models\FosterCareUpdate;
use App\Models\FosterParent;
use App\Models\FosterPlacement;
use App\Models\HelpDeskTicket;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\PartnerFoodPickup;
use App\Models\PetReport;
use App\Models\PostAdoptionFollowUp;
use App\Models\RehomingRequest;
use App\Models\ShelterAnimal;
use App\Models\ShelterVisit;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\VolunteerApplication;
use App\Models\VolunteerInjuryReport;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class AnalyticsReportService
{
    /**
     * Resolve start, end, previous start, previous end, interval, and readable label for a period.
     *
     * @return array{0: CarbonInterface, 1: CarbonInterface, 2: CarbonInterface, 3: CarbonInterface, 4: string, 5: string}
     */
    public function resolvePeriods(string $period, ?string $startDate = null, ?string $endDate = null): array
    {
        $now = Carbon::now();

        if ($period === 'custom' && $startDate && $endDate) {
            try {
                $start = Carbon::parse($startDate)->startOfDay();
                $end = Carbon::parse($endDate)->endOfDay();

                if ($start->greaterThan($end)) {
                    [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
                }

                $daysDiff = max(1, (int) $start->diffInDays($end) + 1);
                $prevEnd = $start->copy()->subDay()->endOfDay();
                $prevStart = $prevEnd->copy()->subDays($daysDiff - 1)->startOfDay();
                $interval = $daysDiff <= 45 ? 'day' : ($daysDiff <= 180 ? 'week' : 'month');
                $label = $start->format('M d, Y').' – '.$end->format('M d, Y');

                return [$start, $end, $prevStart, $prevEnd, $interval, $label];
            } catch (\Throwable) {
                // Fall back to default 30d window if invalid dates are passed
                $period = '30d';
            }
        }

        return match ($period) {
            '7d', 'week' => [
                $now->copy()->subDays(6)->startOfDay(),
                $now->copy()->endOfDay(),
                $now->copy()->subDays(13)->startOfDay(),
                $now->copy()->subDays(7)->endOfDay(),
                'day',
                'Last 7 Days',
            ],
            '90d', 'quarter' => [
                $now->copy()->subDays(89)->startOfDay(),
                $now->copy()->endOfDay(),
                $now->copy()->subDays(179)->startOfDay(),
                $now->copy()->subDays(90)->endOfDay(),
                'week',
                'Last 90 Days',
            ],
            '1y', 'year' => [
                $now->copy()->subMonths(11)->startOfMonth(),
                $now->copy()->endOfDay(),
                $now->copy()->subMonths(23)->startOfMonth(),
                $now->copy()->subMonths(12)->endOfMonth(),
                'month',
                'Last 12 Months',
            ],
            'all' => [
                $now->copy()->subYears(3)->startOfYear(),
                $now->copy()->endOfDay(),
                $now->copy()->subYears(6)->startOfYear(),
                $now->copy()->subYears(3)->endOfYear(),
                'month',
                'All Time (Last 3 Years)',
            ],
            default => [
                $now->copy()->subDays(29)->startOfDay(),
                $now->copy()->endOfDay(),
                $now->copy()->subDays(59)->startOfDay(),
                $now->copy()->subDays(30)->endOfDay(),
                'day',
                'Last 30 Days',
            ],
        };
    }

    /**
     * Calculate percentage change between current and previous values.
     */
    public function calculateDelta(float|int $current, float|int $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Resolve organization metadata and base64-encoded logos so PDF reports always show logos reliably.
     *
     * @return array{
     *     app_name: string,
     *     organization_name: string,
     *     contact_email: string,
     *     contact_phone: string,
     *     primary_logo: ?string,
     *     partner_logo: ?string
     * }
     */
    public function resolveBrandAssets(): array
    {
        $settings = SystemSetting::getValue('system_settings', []);
        $appName = is_array($settings) && ! empty($settings['app_name']) ? (string) $settings['app_name'] : 'PAWLSE';
        $contactEmail = is_array($settings) && ! empty($settings['contact_email'])
            ? (string) $settings['contact_email']
            : 'support@pawlse.org';
        $contactPhone = is_array($settings) && ! empty($settings['contact_phone'])
            ? (string) $settings['contact_phone']
            : '+63 (063) 221-PAWLSE';

        return [
            'app_name' => $appName,
            'organization_name' => 'Iligan Stray Feeders & PAWLSE Network',
            'contact_email' => $contactEmail,
            'contact_phone' => $contactPhone,
            'primary_logo' => $this->encodePublicImage('images/logo.png'),
            'partner_logo' => $this->encodePublicImage('images/email-logo.png') ?? $this->encodePublicImage('images/logo.png'),
        ];
    }

    /**
     * Gather comprehensive Shelter, Foster, Volunteer, Community, and Inventory/Sustainability metrics.
     *
     * @return array<string, mixed>
     */
    public function getShelterOperationsMetrics(CarbonInterface $start, CarbonInterface $end): array
    {
        // 1. Shelter Animal Census
        $statusCounts = ShelterAnimal::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($row) {
                $statusKey = $row->status instanceof \BackedEnum ? $row->status->value : (string) $row->status;

                return [$statusKey => (int) $row->count];
            });

        $totalAnimals = ShelterAnimal::count();
        $vaccinatedAnimals = ShelterAnimal::where('vaccinated', true)->count();
        $vaccinationRate = $totalAnimals > 0 ? round(($vaccinatedAnimals / $totalAnimals) * 100, 1) : 0.0;

        $speciesBreakdown = ShelterAnimal::select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->get()
            ->map(function ($row) {
                $typeLabel = $row->type instanceof \BackedEnum ? $row->type->value : (string) $row->type;

                return [
                    'name' => ucfirst($typeLabel ?: 'Other'),
                    'value' => (int) $row->count,
                ];
            })
            ->values()
            ->all();

        $adoptedAnimalsWithDates = ShelterAnimal::where('status', ShelterAnimalStatus::Adopted->value)
            ->whereNotNull('admitted_at')
            ->whereNotNull('adoption_date')
            ->select('admitted_at', 'adoption_date')
            ->get();

        $avgAdoptionDays = 0.0;
        if ($adoptedAnimalsWithDates->isNotEmpty()) {
            $totalDays = $adoptedAnimalsWithDates->sum(function ($animal) {
                return max(0, Carbon::parse($animal->admitted_at)->diffInDays(Carbon::parse($animal->adoption_date)));
            });
            $avgAdoptionDays = round($totalDays / $adoptedAnimalsWithDates->count(), 1);
        }

        $shelterCensus = [
            'total' => $totalAnimals,
            'available' => $statusCounts[ShelterAnimalStatus::Available->value] ?? 0,
            'pending' => $statusCounts[ShelterAnimalStatus::Pending->value] ?? 0,
            'adopted' => $statusCounts[ShelterAnimalStatus::Adopted->value] ?? 0,
            'foster' => $statusCounts[ShelterAnimalStatus::Foster->value] ?? 0,
            'treatment' => $statusCounts[ShelterAnimalStatus::Treatment->value] ?? 0,
            'quarantine' => $statusCounts[ShelterAnimalStatus::Quarantine->value] ?? 0,
            'deceased' => $statusCounts[ShelterAnimalStatus::Deceased->value] ?? 0,
            'vaccinated_count' => $vaccinatedAnimals,
            'vaccination_rate' => $vaccinationRate,
            'avg_adoption_days' => $avgAdoptionDays,
            'species_breakdown' => $speciesBreakdown,
            'status_breakdown' => [
                ['name' => 'Available', 'value' => $statusCounts[ShelterAnimalStatus::Available->value] ?? 0],
                ['name' => 'Pending', 'value' => $statusCounts[ShelterAnimalStatus::Pending->value] ?? 0],
                ['name' => 'Adopted', 'value' => $statusCounts[ShelterAnimalStatus::Adopted->value] ?? 0],
                ['name' => 'In Foster', 'value' => $statusCounts[ShelterAnimalStatus::Foster->value] ?? 0],
                ['name' => 'Treatment', 'value' => $statusCounts[ShelterAnimalStatus::Treatment->value] ?? 0],
                ['name' => 'Quarantine', 'value' => $statusCounts[ShelterAnimalStatus::Quarantine->value] ?? 0],
            ],
        ];

        // 2. Foster Network Metrics
        $activePlacements = FosterPlacement::where('status', 'active')->count();
        $completedPlacements = FosterPlacement::where('status', '!=', 'active')->count();
        $approvedParents = FosterParent::where('status', 'approved')->count();
        $totalFosterCapacity = (int) FosterParent::where('status', 'approved')->sum('capacity');
        $fosterUtilization = $totalFosterCapacity > 0
            ? min(100.0, round(($activePlacements / $totalFosterCapacity) * 100, 1))
            : 0.0;

        $fosterMetrics = [
            'active_placements' => $activePlacements,
            'completed_placements' => $completedPlacements,
            'approved_parents' => $approvedParents,
            'total_capacity' => $totalFosterCapacity,
            'utilization_rate' => $fosterUtilization,
        ];

        // 3. Volunteer & Field Operations Impact (scoped by period where time-based)
        $hoursLogged = (float) AssignedTask::whereBetween('created_at', [$start, $end])
            ->sum('hours_logged');
        $completedTasks = AssignedTask::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed')
            ->count();
        $feedingRoutesCompleted = FeedingSchedule::where('execution_status', FeedingSchedule::ExecutionCompleted)
            ->whereBetween('updated_at', [$start, $end])
            ->count();
        $feedingLogs = FeedingDistributionLog::whereBetween('created_at', [$start, $end])
            ->selectRaw('COALESCE(SUM(strays_fed), 0) as total_strays, COALESCE(SUM(food_packs_distributed), 0) as total_packs')
            ->first();
        $partnerPickupsCompleted = PartnerFoodPickup::where('status', PartnerFoodPickup::StatusCompleted)
            ->whereBetween('created_at', [$start, $end])
            ->count();
        $injuryReportsActive = VolunteerInjuryReport::where('status', '!=', VolunteerInjuryReport::StatusConfirmed)->count();
        $injuryReportsTotal = VolunteerInjuryReport::whereBetween('created_at', [$start, $end])->count();
        $certificatesIssued = Certificate::whereBetween('created_at', [$start, $end])->count();

        $topVolunteers = AssignedTask::with('user')
            ->whereNotNull('user_id')
            ->whereBetween('created_at', [$start, $end])
            ->select('user_id', DB::raw('COUNT(*) as tasks_count'), DB::raw('COALESCE(SUM(hours_logged), 0) as total_hours'))
            ->groupBy('user_id')
            ->orderByDesc('total_hours')
            ->orderByDesc('tasks_count')
            ->limit(5)
            ->get()
            ->map(function ($row) {
                return [
                    'name' => $row->user ? $row->user->name : 'Volunteer',
                    'email' => $row->user ? $row->user->email : 'N/A',
                    'tasks_count' => (int) $row->tasks_count,
                    'total_hours' => round((float) $row->total_hours, 1),
                ];
            })
            ->values()
            ->all();

        $volunteerImpact = [
            'active_volunteers' => User::where('role', Role::Volunteer->value)->count(),
            'pending_applications' => VolunteerApplication::where('status', 'pending')->count(),
            'hours_logged' => round($hoursLogged, 1),
            'completed_tasks' => $completedTasks,
            'feeding_routes_completed' => $feedingRoutesCompleted,
            'strays_fed' => (int) ($feedingLogs->total_strays ?? 0),
            'food_packs_distributed' => (int) ($feedingLogs->total_packs ?? 0),
            'partner_pickups_completed' => $partnerPickupsCompleted,
            'injury_reports_active' => $injuryReportsActive,
            'injury_reports_period' => $injuryReportsTotal,
            'certificates_issued' => $certificatesIssued,
            'top_volunteers' => $topVolunteers,
        ];

        // 4. Community & Support Metrics
        $openTickets = HelpDeskTicket::whereIn('status', ['open', 'in_progress', 'waiting_on_user'])->count();
        $escalatedTickets = HelpDeskTicket::where('is_escalated', true)->where('status', '!=', 'resolved')->count();
        $resolvedTicketsPeriod = HelpDeskTicket::where('status', 'resolved')
            ->whereBetween('resolved_at', [$start, $end])
            ->get(['created_at', 'resolved_at']);

        $avgTicketResolutionHours = 0.0;
        if ($resolvedTicketsPeriod->isNotEmpty()) {
            $totalHours = $resolvedTicketsPeriod->sum(function ($ticket) {
                return max(0, Carbon::parse($ticket->created_at)->diffInHours(Carbon::parse($ticket->resolved_at)));
            });
            $avgTicketResolutionHours = round($totalHours / $resolvedTicketsPeriod->count(), 1);
        }

        $communityMetrics = [
            'events_total' => Event::count(),
            'events_approved' => Event::where('approval_status', 'approved')->count(),
            'events_pending' => Event::where('approval_status', 'pending')->count(),
            'shelter_visits_pending' => ShelterVisit::where('status', 'pending')->count(),
            'shelter_visits_confirmed' => ShelterVisit::whereIn('status', ['confirmed', 'completed'])->count(),
            'rehoming_pending' => RehomingRequest::where('status', 'pending')->count(),
            'rehoming_intaken' => RehomingRequest::where('status', 'intaken')->count(),
            'blogs_published' => BlogPost::where('status', BlogPost::STATUS_PUBLISHED)->count(),
            'blogs_pending' => BlogPost::where('status', BlogPost::STATUS_PENDING)->count(),
            'help_desk_open' => $openTickets,
            'help_desk_escalated' => $escalatedTickets,
            'help_desk_resolved_period' => $resolvedTicketsPeriod->count(),
            'help_desk_avg_resolution_hours' => $avgTicketResolutionHours,
        ];

        // 5. Inventory & Care Sustainability
        $lowStockItems = InventoryItem::whereColumn('quantity', '<=', 'min_threshold')
            ->orderBy('quantity')
            ->limit(6)
            ->get(['id', 'name', 'quantity', 'min_threshold', 'unit', 'category'])
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'quantity' => (int) $item->quantity,
                    'min_threshold' => (int) $item->min_threshold,
                    'unit' => $item->unit ?? 'units',
                    'category' => ucfirst((string) ($item->category ?? 'General')),
                ];
            })
            ->values()
            ->all();

        $sustainability = CareSustainability::current()->toPublicArray();

        $inventorySustainability = [
            'total_items' => InventoryItem::count(),
            'low_stock_count' => InventoryItem::whereColumn('quantity', '<=', 'min_threshold')->count(),
            'low_stock_items' => $lowStockItems,
            'sustainability' => [
                'verified_funds' => $sustainability['verified_funds'],
                'daily_cost' => $sustainability['daily_cost'],
                'est_days' => $sustainability['est_days'],
                'urgency_status' => $sustainability['urgency_status'],
                'urgency_label' => $sustainability['urgency_label'],
                'formatted_endpoint' => $sustainability['formatted_endpoint'],
            ],
        ];

        // 6. Top Rescue Hotspots (period-scoped)
        $topRescueLocations = PetReport::whereBetween('created_at', [$start, $end])
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->select(
                'location',
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count")
            )
            ->groupBy('location')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(function ($row) {
                $total = (int) $row->total;
                $resolved = (int) $row->resolved_count;

                return [
                    'location' => $row->location,
                    'total' => $total,
                    'resolved' => $resolved,
                    'resolution_rate' => $total > 0 ? round(($resolved / $total) * 100, 1) : 0.0,
                ];
            })
            ->values()
            ->all();

        return [
            'shelterCensus' => $shelterCensus,
            'fosterMetrics' => $fosterMetrics,
            'volunteerImpact' => $volunteerImpact,
            'communityMetrics' => $communityMetrics,
            'inventorySustainability' => $inventorySustainability,
            'topRescueLocations' => $topRescueLocations,
        ];
    }

    /**
     * Gather Super-Admin governance & infrastructure metrics.
     *
     * @return array<string, mixed>
     */
    public function getGovernanceMetrics(): array
    {
        $latestBackup = Backup::where('status', 'completed')->latest()->first();

        $archivedUsers = User::onlyTrashed()->count();
        $archivedPets = ShelterAnimal::onlyTrashed()->count();
        $archivedReports = PetReport::onlyTrashed()->count();
        $archivedAdoptions = AdoptionApplication::onlyTrashed()->count();
        $archivedEvents = Event::onlyTrashed()->count();
        $archivedTotal = $archivedUsers + $archivedPets + $archivedReports + $archivedAdoptions + $archivedEvents;

        return [
            'pending_events' => Event::where('approval_status', 'pending')->count(),
            'pending_blogs' => BlogPost::where('status', BlogPost::STATUS_PENDING)->count(),
            'pending_ai_validations' => PetReport::where('ai_validation_status', 'pending')->count(),
            'escalated_tickets' => HelpDeskTicket::where('is_escalated', true)->where('status', '!=', 'resolved')->count(),
            'archived_records_total' => $archivedTotal,
            'latest_backup_at' => $latestBackup?->created_at?->format('M d, Y g:i A') ?? 'None yet',
            'latest_backup_file' => $latestBackup?->filename ?? '—',
            'total_audit_logs' => AuditLog::count(),
        ];
    }

    /**
     * Gather deep operational analytics strictly scoped to Admin-level shelter & community modules.
     *
     * @return array<string, mixed>
     */
    public function getAdminScopeAnalytics(CarbonInterface $start, CarbonInterface $end): array
    {
        $now = Carbon::now();
        $in14Days = $now->copy()->addDays(14);
        $in30Days = $now->copy()->addDays(30);

        // 1. Animal Master Records: Medical Care, Wishlist Needs & Demographics
        $medicalBreakdown = AnimalMedicalRecord::whereBetween('created_at', [$start, $end])
            ->select('record_type', DB::raw('COUNT(*) as count'))
            ->groupBy('record_type')
            ->get()
            ->map(fn ($row) => [
                'name' => ucfirst(str_replace('_', ' ', (string) ($row->record_type ?: 'General'))),
                'value' => (int) $row->count,
            ])
            ->values()
            ->all();

        $ageBreakdown = ShelterAnimal::select('age_category', DB::raw('COUNT(*) as count'))
            ->groupBy('age_category')
            ->get()
            ->map(function ($row) {
                $val = $row->age_category instanceof \BackedEnum ? $row->age_category->value : (string) $row->age_category;

                return [
                    'name' => ucfirst(str_replace('_', ' ', $val ?: 'Unspecified')),
                    'value' => (int) $row->count,
                ];
            })
            ->values()
            ->all();

        $genderBreakdown = ShelterAnimal::select('gender', DB::raw('COUNT(*) as count'))
            ->groupBy('gender')
            ->get()
            ->map(function ($row) {
                $val = $row->gender instanceof \BackedEnum ? $row->gender->value : (string) $row->gender;

                return [
                    'name' => ucfirst($val ?: 'Unspecified'),
                    'value' => (int) $row->count,
                ];
            })
            ->values()
            ->all();

        $animalCare = [
            'medical_records_total' => AnimalMedicalRecord::count(),
            'medical_records_period' => AnimalMedicalRecord::whereBetween('created_at', [$start, $end])->count(),
            'active_treatments' => AnimalMedicalRecord::whereIn('status', ['ongoing', 'active', 'in_treatment'])->count(),
            'upcoming_due_medical' => AnimalMedicalRecord::whereNotNull('next_due_date')
                ->whereBetween('next_due_date', [$now->toDateString(), $in14Days->toDateString()])
                ->count(),
            'medical_type_breakdown' => $medicalBreakdown,
            'open_wishlist_needs' => AnimalDonationNeed::where('status', 'open')->count(),
            'fulfilled_wishlist_needs' => AnimalDonationNeed::where('status', 'fulfilled')->count(),
            'urgent_wishlist_needs' => AnimalDonationNeed::where('status', 'open')
                ->whereIn('priority', ['urgent', 'high'])
                ->count(),
            'age_breakdown' => $ageBreakdown,
            'gender_breakdown' => $genderBreakdown,
        ];

        // 2. Rescue Management & AI Validation Queue (Admin Validation Scope)
        $rescueStatusBreakdown = PetReport::whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => [
                'name' => ucfirst((string) $row->status),
                'value' => (int) $row->count,
            ])
            ->values()
            ->all();

        $rescueTypeBreakdown = PetReport::whereBetween('created_at', [$start, $end])
            ->select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->get()
            ->map(fn ($row) => [
                'name' => strtoupper((string) $row->type) === 'SOS' ? 'SOS' : ucfirst((string) $row->type),
                'value' => (int) $row->count,
            ])
            ->values()
            ->all();

        $urgencyBreakdown = PetReport::whereBetween('created_at', [$start, $end])
            ->whereNotNull('urgency')
            ->select('urgency', DB::raw('COUNT(*) as count'))
            ->groupBy('urgency')
            ->get()
            ->map(fn ($row) => [
                'name' => ucfirst((string) $row->urgency),
                'value' => (int) $row->count,
            ])
            ->values()
            ->all();

        $rescueFunnel = [
            'status_breakdown' => $rescueStatusBreakdown,
            'type_breakdown' => $rescueTypeBreakdown,
            'urgency_breakdown' => $urgencyBreakdown,
            'ai_validation_pending' => PetReport::where('ai_validation_status', 'pending')->count(),
            'ai_validation_approved' => PetReport::where('ai_validation_status', 'approved')->count(),
            'ai_validation_rejected' => PetReport::where('ai_validation_status', 'rejected')->count(),
        ];

        // 3. Adoption Pipeline, Shelter Visits, Rehoming & Post-Adoption Follow-Ups
        $adoptionStages = AdoptionApplication::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($row) {
                $key = $row->status instanceof \BackedEnum ? $row->status->value : (string) $row->status;

                return [$key => (int) $row->count];
            });

        $adoptionPipeline = [
            'stages' => [
                ['name' => 'Pending', 'value' => $adoptionStages['pending'] ?? 0],
                ['name' => 'Needs Info', 'value' => $adoptionStages['needs_info'] ?? 0],
                ['name' => 'Scheduled', 'value' => $adoptionStages['scheduled'] ?? 0],
                ['name' => 'Approved', 'value' => $adoptionStages['approved'] ?? 0],
                ['name' => 'Rejected', 'value' => $adoptionStages['rejected'] ?? 0],
                ['name' => 'Cancelled', 'value' => $adoptionStages['cancelled'] ?? 0],
            ],
            'visits_pending' => ShelterVisit::where('status', 'pending')->count(),
            'visits_confirmed' => ShelterVisit::whereIn('status', ['confirmed', 'completed'])->count(),
            'visits_total_visitors' => (int) ShelterVisit::whereIn('status', ['confirmed', 'completed'])
                ->whereBetween('created_at', [$start, $end])
                ->sum('number_of_visitors'),
            'rehoming_pending' => RehomingRequest::where('status', 'pending')->count(),
            'rehoming_intaken' => RehomingRequest::where('status', 'intaken')->count(),
            'follow_ups_total' => PostAdoptionFollowUp::count(),
            'follow_ups_period' => PostAdoptionFollowUp::whereBetween('created_at', [$start, $end])->count(),
            'follow_ups_due_soon' => PostAdoptionFollowUp::whereNotNull('next_follow_up_date')
                ->whereBetween('next_follow_up_date', [$now->toDateString(), $in14Days->toDateString()])
                ->count(),
        ];

        // 4. Foster Care Updates, Partner Food Pickups & Volunteer Logistics
        $volunteerRoleBreakdown = VolunteerApplication::select('role', DB::raw('COUNT(*) as count'))
            ->groupBy('role')
            ->get()
            ->map(fn ($row) => [
                'name' => ucfirst(str_replace('_', ' ', (string) ($row->role ?: 'General'))),
                'value' => (int) $row->count,
            ])
            ->values()
            ->all();

        $fosterVolunteerOps = [
            'foster_updates_period' => FosterCareUpdate::whereBetween('created_at', [$start, $end])->count(),
            'foster_updates_unacknowledged' => FosterCareUpdate::whereNull('acknowledged_at')->count(),
            'foster_updates_urgent' => FosterCareUpdate::whereNull('acknowledged_at')
                ->whereIn('urgency', ['high', 'urgent', 'critical'])
                ->count(),
            'pickups_pending' => PartnerFoodPickup::whereIn('status', [PartnerFoodPickup::StatusPending, PartnerFoodPickup::StatusAssigned])->count(),
            'pickups_completed_period' => PartnerFoodPickup::where('status', PartnerFoodPickup::StatusCompleted)
                ->whereBetween('created_at', [$start, $end])
                ->count(),
            'pickups_missed_period' => PartnerFoodPickup::where('status', PartnerFoodPickup::StatusMissed)
                ->whereBetween('created_at', [$start, $end])
                ->count(),
            'injuries_open' => VolunteerInjuryReport::where('status', '!=', VolunteerInjuryReport::StatusConfirmed)->count(),
            'injuries_confirmed_period' => VolunteerInjuryReport::where('status', VolunteerInjuryReport::StatusConfirmed)
                ->whereBetween('created_at', [$start, $end])
                ->count(),
            'volunteer_roles' => $volunteerRoleBreakdown,
        ];

        // 5. Donations Verification Queue, Inventory Batch Expiry, Blogs & Help Desk
        $pendingDonationCount = Donation::whereIn('status', [
            DonationStatus::PendingPayment->value,
            DonationStatus::PaymentProofSubmitted->value,
            DonationStatus::PendingVerification->value,
            DonationStatus::PaymentProofResubmitted->value,
        ])->count();

        $rejectedDonationCount = Donation::where('status', DonationStatus::Rejected->value)->count();
        $pendingAmountEdits = DonationAmountEditRequest::where('status', 'pending')->count();

        $expiringBatchesSoon = InventoryBatch::where('quantity', '>', 0)
            ->whereNotNull('expires_at')
            ->whereBetween('expires_at', [$now->toDateString(), $in30Days->toDateString()])
            ->count();

        $expiredBatchesWithStock = InventoryBatch::where('quantity', '>', 0)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', $now->toDateString())
            ->count();

        $blogTotals = BlogPost::selectRaw('COALESCE(SUM(views_count), 0) as total_views, COALESCE(SUM(shares_count), 0) as total_shares')
            ->first();

        $helpDeskPriorities = HelpDeskTicket::whereIn('status', ['open', 'in_progress', 'waiting_on_user'])
            ->select('priority', DB::raw('COUNT(*) as count'))
            ->groupBy('priority')
            ->get()
            ->map(fn ($row) => [
                'name' => ucfirst((string) ($row->priority ?: 'Normal')),
                'value' => (int) $row->count,
            ])
            ->values()
            ->all();

        $donationsAndSupport = [
            'pending_donation_reviews' => $pendingDonationCount,
            'rejected_donations' => $rejectedDonationCount,
            'pending_amount_edit_requests' => $pendingAmountEdits,
            'total_inventory_units' => (int) InventoryItem::sum('quantity'),
            'expiring_batches_30d' => $expiringBatchesSoon,
            'expired_batches_with_stock' => $expiredBatchesWithStock,
            'blogs_published' => BlogPost::where('status', BlogPost::STATUS_PUBLISHED)->count(),
            'blogs_pending' => BlogPost::where('status', BlogPost::STATUS_PENDING)->count(),
            'blogs_total_views' => (int) ($blogTotals->total_views ?? 0),
            'blogs_total_shares' => (int) ($blogTotals->total_shares ?? 0),
            'help_desk_priorities' => $helpDeskPriorities,
            'events_upcoming_spots' => (int) Event::where('approval_status', 'approved')
                ->where('date', '>=', $now->toDateString())
                ->sum('spots'),
            'event_registrations_period' => AssignedTask::whereNotNull('event_id')
                ->whereBetween('created_at', [$start, $end])
                ->count(),
        ];

        return [
            'animalCare' => $animalCare,
            'rescueFunnel' => $rescueFunnel,
            'adoptionPipeline' => $adoptionPipeline,
            'fosterVolunteerOps' => $fosterVolunteerOps,
            'donationsAndSupport' => $donationsAndSupport,
        ];
    }

    /**
     * Gather recent record snapshots for detailed PDF tables.
     *
     * @return array<string, array<int, array<string, mixed>>>
     */
    public function getRecentPdfTables(CarbonInterface $start, CarbonInterface $end): array
    {
        $validDonationStatuses = [DonationStatus::Verified->value, DonationStatus::Completed->value];

        $recentRescues = PetReport::whereBetween('created_at', [$start, $end])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (PetReport $r) => [
                'id' => $r->id,
                'type' => strtoupper((string) $r->type),
                'animal' => ucfirst((string) ($r->animal_type ?? 'Unknown')).($r->breed ? " ({$r->breed})" : ''),
                'location' => $r->location ?? 'Unspecified',
                'urgency' => ucfirst((string) ($r->urgency ?? 'Normal')),
                'status' => ucfirst((string) $r->status),
                'date' => $r->created_at?->format('M d, Y') ?? '—',
            ])
            ->values()
            ->all();

        $recentAdoptions = AdoptionApplication::with('shelterAnimal')
            ->whereBetween('created_at', [$start, $end])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function (AdoptionApplication $app) {
                $statusVal = $app->status instanceof \BackedEnum ? $app->status->value : (string) $app->status;

                return [
                    'id' => $app->id,
                    'applicant' => $app->full_name,
                    'pet' => $app->shelterAnimal?->name ?? 'Shelter Pet',
                    'preference' => $app->adoption_preference ?? '—',
                    'status' => ucfirst(str_replace('_', ' ', $statusVal)),
                    'date' => $app->created_at?->format('M d, Y') ?? '—',
                ];
            })
            ->values()
            ->all();

        $recentDonations = Donation::whereBetween('created_at', [$start, $end])
            ->whereIn('status', $validDonationStatuses)
            ->latest()
            ->limit(10)
            ->get()
            ->map(function (Donation $d) {
                $typeVal = $d->type instanceof \BackedEnum ? $d->type->value : (string) $d->type;
                $statusVal = $d->status instanceof \BackedEnum ? $d->status->value : (string) $d->status;

                return [
                    'ref' => $d->public_reference ?? ('DON-'.$d->id),
                    'donor' => $d->anonymous ? 'Anonymous Donor' : ($d->donor_name ?? 'Supporter'),
                    'type' => ucfirst(str_replace(['_', '-'], ' ', $typeVal)),
                    'amount' => $d->amount ? (float) $d->amount : 0.0,
                    'status' => ucfirst(str_replace('_', ' ', $statusVal)),
                    'date' => $d->created_at?->format('M d, Y') ?? '—',
                ];
            })
            ->values()
            ->all();

        return [
            'rescues' => $recentRescues,
            'adoptions' => $recentAdoptions,
            'donations' => $recentDonations,
        ];
    }

    /**
     * Build donut segments with stroke-dasharray geometry for clean SVG rendering in Blade.
     *
     * @param  array<int, array{name: string, value: int|float}>  $items
     * @param  array<int, string>  $colors
     * @return array{total: float, segments: array<int, array<string, mixed>>}
     */
    public function prepareDonutChart(array $items, array $colors = ['#0D9488', '#3B82F6', '#F59E0B', '#F43F5E', '#8B5CF6', '#64748B']): array
    {
        $filtered = array_values(array_filter($items, fn ($item) => ($item['value'] ?? 0) > 0));
        $total = (float) array_sum(array_column($filtered, 'value'));
        $circumference = 2 * M_PI * 36; // r = 36
        $offset = 0.0;
        $segments = [];

        foreach ($filtered as $idx => $item) {
            $value = (float) $item['value'];
            $pct = $total > 0 ? round(($value / $total) * 100, 1) : 0.0;
            $dash = $total > 0 ? ($value / $total) * $circumference : 0.0;

            $segments[] = [
                'name' => $item['name'],
                'value' => $value,
                'percent' => $pct,
                'color' => $colors[$idx % count($colors)],
                'dash' => round($dash, 2),
                'gap' => round(max(0, $circumference - $dash), 2),
                'offset' => round(-$offset, 2),
            ];

            $offset += $dash;
        }

        return [
            'total' => $total,
            'circumference' => round($circumference, 2),
            'segments' => $segments,
        ];
    }

    /**
     * Encode an image from the public directory as a base64 data URI.
     */
    protected function encodePublicImage(string $relativePath): ?string
    {
        $fullPath = public_path($relativePath);
        if (! file_exists($fullPath) || ! is_readable($fullPath)) {
            return null;
        }

        $contents = file_get_contents($fullPath);
        if ($contents === false || $contents === '') {
            return null;
        }

        $extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
        $mime = match ($extension) {
            'jpg', 'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            default => 'image/png',
        };

        return 'data:'.$mime.';base64,'.base64_encode($contents);
    }
}
