<?php

namespace App\Http\Controllers;

use App\Models\AdoptionApplication;
use App\Models\Donation;
use App\Models\PetReport;
use App\Models\RehomingRequest;
use App\Models\ShelterVisit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PublicTrackingController extends Controller
{
    /**
     * Unified secret/hidden tracking portal for public user submissions.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $referenceInput = trim((string) $request->query('reference', ''));
        $emailInput = trim((string) $request->query('email', ''));

        // If authenticated user visits without params, guide them to their user dashboard
        if ($request->user() && $referenceInput === '' && $emailInput === '') {
            if ($request->user()->isAdmin() || $request->user()->isSuperAdmin()) {
                return redirect()->route('account.admin.dashboard');
            }

            return redirect()->route('account.user.bookmark');
        }

        $searched = false;
        $trackedItem = null;

        if ($referenceInput !== '' || $emailInput !== '') {
            $searched = true;

            if ($referenceInput !== '' && $emailInput !== '') {
                $trackedItem = $this->findTrackedItem($referenceInput, $emailInput);
            }
        }

        return Inertia::render('track', [
            'searchedReference' => $referenceInput,
            'searchedEmail' => $emailInput,
            'searched' => $searched,
            'item' => $trackedItem,
        ]);
    }

    /**
     * Backward-compatible handler for adopt/track.
     */
    public function adoptTrack(Request $request): Response|RedirectResponse
    {
        return $this->index($request);
    }

    /**
     * Backward-compatible handler for missing/track.
     */
    public function missingTrack(Request $request): Response|RedirectResponse
    {
        $referenceInput = trim((string) $request->query('reference', ''));
        $emailInput = trim((string) $request->query('email', ''));

        if ($referenceInput === '' && $emailInput !== '') {
            $cleanEmail = strtolower($emailInput);
            $latestMissing = PetReport::query()
                ->where('type', 'missing')
                ->where(function ($q) use ($cleanEmail) {
                    $q->whereRaw('LOWER(contact_email) = ?', [$cleanEmail])
                        ->orWhereHas('user', function ($uq) use ($cleanEmail) {
                            $uq->whereRaw('LOWER(email) = ?', [$cleanEmail]);
                        });
                })
                ->with(['photos', 'assignedVolunteer'])
                ->latest()
                ->first();

            if ($latestMissing) {
                $ref = 'MIS-'.str_pad((string) $latestMissing->id, 5, '0', STR_PAD_LEFT);

                return Inertia::render('track', [
                    'searchedReference' => $ref,
                    'searchedEmail' => $emailInput,
                    'searched' => true,
                    'item' => $this->formatPetReport($latestMissing),
                ]);
            }
        }

        return $this->index($request);
    }

    /**
     * Locate a submission across all public entity types by reference and matching email.
     *
     * @return array<string, mixed>|null
     */
    protected function findTrackedItem(string $reference, string $email): ?array
    {
        $cleanEmail = strtolower(trim($email));
        $cleanRef = strtoupper(trim($reference));
        $numericId = (int) preg_replace('/[^0-9]/', '', $cleanRef);

        $isAdoptionPrefix = str_starts_with($cleanRef, 'ADP') || str_starts_with($cleanRef, 'ADOPT');
        $isDonationPrefix = str_starts_with($cleanRef, 'DON');
        $isReportPrefix = str_starts_with($cleanRef, 'MIS')
            || str_starts_with($cleanRef, 'MISSING')
            || str_starts_with($cleanRef, 'RES')
            || str_starts_with($cleanRef, 'RESCUE')
            || str_starts_with($cleanRef, 'SOS');
        $isRehomingPrefix = str_starts_with($cleanRef, 'REH');
        $isVisitPrefix = str_starts_with($cleanRef, 'VIS');

        $hasKnownPrefix = $isAdoptionPrefix || $isDonationPrefix || $isReportPrefix || $isRehomingPrefix || $isVisitPrefix;

        // 1. Adoption Application (ADP-XXXXX or numeric fallback)
        if ($numericId > 0 && ($isAdoptionPrefix || ! $hasKnownPrefix)) {
            $app = AdoptionApplication::where('id', $numericId)
                ->whereRaw('LOWER(email) = ?', [$cleanEmail])
                ->with(['shelterAnimal', 'files'])
                ->first();

            if ($app) {
                return $this->formatAdoptionApplication($app);
            }
        }

        // 2. Donation (DON-XXXXX or public_reference or numeric fallback)
        if ($isDonationPrefix || ! $hasKnownPrefix) {
            $donation = Donation::where(function ($q) use ($cleanRef, $numericId) {
                $q->where('public_reference', $cleanRef);
                if ($numericId > 0) {
                    $q->orWhere('id', $numericId);
                }
            })
                ->whereRaw('LOWER(donor_email) = ?', [$cleanEmail])
                ->with(['payments', 'inKindDonation', 'feedingSponsorship'])
                ->first();

            if ($donation) {
                return $this->formatDonation($donation);
            }
        }

        // 3. Pet Reports (Missing, Rescue, SOS or numeric fallback)
        if ($numericId > 0 && ($isReportPrefix || ! $hasKnownPrefix)) {
            $reportQuery = PetReport::query()
                ->where('id', $numericId)
                ->where(function ($q) use ($cleanEmail) {
                    $q->whereRaw('LOWER(contact_email) = ?', [$cleanEmail])
                        ->orWhereHas('user', function ($uq) use ($cleanEmail) {
                            $uq->whereRaw('LOWER(email) = ?', [$cleanEmail]);
                        });
                })
                ->with(['photos', 'assignedVolunteer']);

            if (str_starts_with($cleanRef, 'MIS') || str_starts_with($cleanRef, 'MISSING')) {
                $reportQuery->where('type', 'missing');
            } elseif (str_starts_with($cleanRef, 'RES') || str_starts_with($cleanRef, 'RESCUE')) {
                $reportQuery->where('type', 'rescue');
            } elseif (str_starts_with($cleanRef, 'SOS')) {
                $reportQuery->where('type', 'sos');
            }

            $report = $reportQuery->first();
            if ($report) {
                return $this->formatPetReport($report);
            }
        }

        // 4. Rehoming Request (REH-XXXXX or numeric fallback)
        if ($numericId > 0 && ($isRehomingPrefix || ! $hasKnownPrefix)) {
            $rehoming = RehomingRequest::where('id', $numericId)
                ->whereRaw('LOWER(email) = ?', [$cleanEmail])
                ->first();

            if ($rehoming) {
                return $this->formatRehomingRequest($rehoming);
            }
        }

        // 5. Shelter Visit (VIS-XXXXX or numeric fallback)
        if ($numericId > 0 && ($isVisitPrefix || ! $hasKnownPrefix)) {
            $visit = ShelterVisit::where('id', $numericId)
                ->whereRaw('LOWER(email) = ?', [$cleanEmail])
                ->with('shelterAnimal')
                ->first();

            if ($visit) {
                return $this->formatShelterVisit($visit);
            }
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    protected function formatAdoptionApplication(AdoptionApplication $app): array
    {
        $ref = 'ADP-'.str_pad((string) $app->id, 5, '0', STR_PAD_LEFT);
        $status = is_string($app->status) ? $app->status : $app->status->value;

        return [
            'category' => 'adoption',
            'category_label' => 'Adoption Application',
            'reference' => $ref,
            'id' => $app->id,
            'status' => $status,
            'status_label' => match ($status) {
                'pending' => 'Pending Review',
                'scheduled' => 'Interview Scheduled',
                'approved' => 'Approved',
                'rejected' => 'Declined / Needs Update',
                default => ucfirst($status),
            },
            'status_theme' => match ($status) {
                'pending' => 'amber',
                'scheduled' => 'blue',
                'approved' => 'green',
                'rejected' => 'red',
                default => 'gray',
            },
            'title' => "Adoption Application for {$app->shelterAnimal?->name}",
            'subtitle' => "Submitted on {$app->created_at->format('M d, Y')}",
            'created_at' => $app->created_at->toIso8601String(),
            'photo_url' => $app->shelterAnimal?->photo_url ?? $app->shelterAnimal?->mainImg,
            'rejection_reason' => $app->rejection_reason,
            'dashboard_url' => route('account.user.adoption-applications'),
            'details' => [
                ['label' => 'Applicant Name', 'value' => $app->full_name],
                ['label' => 'Contact Email', 'value' => $app->email],
                ['label' => 'Contact Phone', 'value' => $app->phone],
                ['label' => 'Pet Applied For', 'value' => $app->shelterAnimal?->name ?? 'Shelter Pet'],
                ['label' => 'Preferred Interview', 'value' => $app->preferred_date ? "{$app->preferred_date->format('M d, Y')} at {$app->preferred_time}" : 'To be coordinated'],
                ['label' => 'Shelter Visit', 'value' => $app->can_visit_shelter ? 'Can visit in-person' : 'Phone / Online interview'],
            ],
            'raw' => $app,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function formatDonation(Donation $donation): array
    {
        $type = is_string($donation->type) ? $donation->type : $donation->type->value;
        $status = is_string($donation->status) ? $donation->status : $donation->status->value;

        $typeLabel = match ($type) {
            'cash' => 'Cash Contribution',
            'in_kind' => 'In-Kind Supplies',
            'feeding_sponsorship' => 'Feeding Sponsorship',
            default => ucfirst(str_replace('_', ' ', $type)),
        };

        $amountStr = $donation->amount
            ? '₱ '.number_format((float) $donation->amount, 2)
            : ($donation->inKindDonation?->quantity ?: 'Supplies Donation');

        return [
            'category' => 'donation',
            'category_label' => "Donation ({$typeLabel})",
            'reference' => $donation->public_reference,
            'id' => $donation->id,
            'status' => $status,
            'status_label' => match ($status) {
                'completed', 'verified' => 'Completed & Verified',
                'pending' => 'Pending Verification / Drop-Off',
                'failed' => 'Payment Failed',
                default => ucfirst($status),
            },
            'status_theme' => match ($status) {
                'completed', 'verified' => 'green',
                'pending' => 'amber',
                'failed' => 'red',
                default => 'blue',
            },
            'title' => "{$typeLabel} - {$amountStr}",
            'subtitle' => "Pledged on {$donation->created_at->format('M d, Y')}",
            'created_at' => $donation->created_at->toIso8601String(),
            'photo_url' => null,
            'details' => [
                ['label' => 'Donor Name', 'value' => $donation->anonymous ? 'Anonymous Supporter' : ($donation->donor_name ?: 'Generous Donor')],
                ['label' => 'Donor Email', 'value' => $donation->donor_email],
                ['label' => 'Amount / Pledge', 'value' => $amountStr],
                ['label' => 'Designated Purpose', 'value' => $donation->purpose ?: 'Shelter operations & animal welfare'],
                ['label' => 'Payment Reference', 'value' => $donation->payments->first()?->payment_reference ?: 'N/A'],
            ],
            'action_url' => in_array($status, ['completed', 'verified']) ? null : route('donate.checkout', $donation->public_reference),
            'action_label' => 'Complete Payment / Upload Receipt',
            'dashboard_url' => route('account.user.donations'),
            'raw' => $donation,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function formatPetReport(PetReport $report): array
    {
        $prefix = strtoupper((string) ($report->type ?: 'rescue'));
        $ref = $prefix.'-'.str_pad((string) $report->id, 5, '0', STR_PAD_LEFT);

        $typeLabel = match ($report->type) {
            'missing' => 'Missing Pet Report',
            'sos' => 'Emergency SOS Alert',
            default => 'Stray Rescue Report',
        };

        $photo = $report->photos->first();
        $photoPath = $photo?->path;
        $photoUrl = null;
        if ($photoPath) {
            $photoUrl = (str_starts_with($photoPath, '/storage/') || str_starts_with($photoPath, 'http'))
                ? $photoPath
                : Storage::url($photoPath);
        }

        return [
            'category' => $report->type ?: 'rescue',
            'category_label' => $typeLabel,
            'reference' => $ref,
            'id' => $report->id,
            'status' => $report->status,
            'status_label' => match ($report->status) {
                'resolved' => $report->type === 'missing' ? 'Safely Reunited' : 'Resolved',
                'assigned', 'in_progress' => 'Volunteer Dispatched / Searching',
                'pending' => 'Pending Review',
                default => ucfirst(str_replace('_', ' ', $report->status)),
            },
            'status_theme' => match ($report->status) {
                'resolved' => 'green',
                'assigned', 'in_progress' => 'blue',
                'pending' => 'amber',
                default => 'gray',
            },
            'title' => $report->name ? "{$report->name} ({$typeLabel})" : $typeLabel,
            'subtitle' => "Reported on {$report->created_at->format('M d, Y')}",
            'created_at' => $report->created_at->toIso8601String(),
            'photo_url' => $photoUrl,
            'details' => array_values(array_filter([
                ['label' => 'Reporter Name', 'value' => $report->contact_name ?: 'Community Reporter'],
                ['label' => 'Animal Type / Breed', 'value' => "{$report->animal_type}".($report->breed ? " - {$report->breed}" : '')],
                $report->type === 'sos' && $report->situation_type
                    ? ['label' => 'Emergency Situation', 'value' => "{$report->situation_type}".($report->urgency ? ' ('.strtoupper($report->urgency).' Urgency)' : '')]
                    : null,
                ['label' => 'Location', 'value' => $report->location],
                ['label' => 'Last Seen / Incident Date', 'value' => $report->last_seen_date ? $report->last_seen_date->format('M d, Y') : $report->created_at->format('M d, Y')],
                ['label' => 'Assigned Responder', 'value' => $report->assignedVolunteer?->name ?: 'Awaiting assignment'],
                ['label' => 'Description', 'value' => $report->description ?: 'No additional notes provided'],
            ])),
            'can_mark_reunited' => $report->type === 'missing' && $report->status !== 'resolved',
            'dashboard_url' => $report->type === 'missing'
                ? route('account.user.missing-found')
                : route('account.user.rescue-reports'),
            'raw' => $report,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function formatRehomingRequest(RehomingRequest $rehoming): array
    {
        $ref = 'REH-'.str_pad((string) $rehoming->id, 5, '0', STR_PAD_LEFT);

        $details = [
            ['label' => 'Pet Name', 'value' => $rehoming->animal_name],
            ['label' => 'Species & Gender', 'value' => "{$rehoming->species}".($rehoming->breed ? " • {$rehoming->breed}" : '')." ({$rehoming->gender})"],
            ['label' => 'Current Location', 'value' => $rehoming->current_location],
            ['label' => 'Reason for Rehoming', 'value' => $rehoming->reason],
            ['label' => 'Owner / Guardian', 'value' => $rehoming->full_name],
        ];

        if ($rehoming->admin_notes) {
            $details[] = ['label' => 'Shelter Coordinator Notes', 'value' => $rehoming->admin_notes];
        }

        return [
            'category' => 'rehoming',
            'category_label' => 'Rehoming Assistance Request',
            'reference' => $ref,
            'id' => $rehoming->id,
            'status' => $rehoming->status,
            'status_label' => match ($rehoming->status) {
                'reviewed' => 'Reviewed by Coordinators',
                'posted', 'approved' => 'Cross-Posted to Community Socials',
                'shelter_intake', 'intake' => 'Admitted to Shelter Sanctuary',
                'home_found' => 'Permanent Home Found',
                'declined' => 'Declined',
                'pending' => 'Under Shelter Evaluation',
                default => ucfirst(str_replace('_', ' ', (string) $rehoming->status)),
            },
            'status_theme' => match ($rehoming->status) {
                'home_found', 'shelter_intake', 'approved', 'intake' => 'green',
                'reviewed', 'posted' => 'blue',
                'pending' => 'amber',
                'declined' => 'red',
                default => 'blue',
            },
            'title' => "Rehoming Request for {$rehoming->animal_name}",
            'subtitle' => "Submitted on {$rehoming->created_at->format('M d, Y')}",
            'created_at' => $rehoming->created_at->toIso8601String(),
            'photo_url' => $rehoming->photo_url,
            'dashboard_url' => route('account.user.rehoming-requests'),
            'details' => $details,
            'raw' => $rehoming,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function formatShelterVisit(ShelterVisit $visit): array
    {
        $ref = 'VIS-'.str_pad((string) $visit->id, 5, '0', STR_PAD_LEFT);
        $effectiveDate = $visit->confirmed_date ?? $visit->preferred_date;
        $effectiveSlot = $visit->confirmed_time_slot ?: ($visit->preferred_time_slot ?: 'Standard Hours (9:00 AM – 5:00 PM)');

        $details = [
            ['label' => 'Visitor Name', 'value' => $visit->full_name],
            ['label' => 'Visitor Email', 'value' => (string) $visit->email],
            ['label' => $visit->confirmed_date ? 'Confirmed Date' : 'Preferred Date', 'value' => $effectiveDate?->format('M d, Y') ?: 'To be coordinated'],
            ['label' => $visit->confirmed_time_slot ? 'Confirmed Time Slot' : 'Preferred Time Slot', 'value' => $effectiveSlot],
            ['label' => 'Number of Visitors', 'value' => $visit->number_of_visitors.' visitor(s)'],
            ['label' => 'Visit Purpose', 'value' => ucfirst(str_replace('_', ' ', (string) $visit->purpose))],
        ];

        if ($visit->shelterAnimal) {
            $details[] = ['label' => 'Animal of Interest', 'value' => $visit->shelterAnimal->name];
        }

        if ($visit->admin_notes) {
            $details[] = ['label' => 'Coordinator Notes', 'value' => $visit->admin_notes];
        }

        return [
            'category' => 'shelter_visit',
            'category_label' => 'Shelter Visit Request',
            'reference' => $ref,
            'id' => $visit->id,
            'status' => $visit->status,
            'status_label' => match ($visit->status) {
                'confirmed' => 'Visit Confirmed',
                'completed' => 'Visit Completed',
                'cancelled' => 'Cancelled',
                'pending' => 'Awaiting Coordinator Confirmation',
                default => ucfirst($visit->status),
            },
            'status_theme' => match ($visit->status) {
                'confirmed', 'completed' => 'green',
                'pending' => 'amber',
                'cancelled' => 'red',
                default => 'gray',
            },
            'title' => "Shelter Visit - {$effectiveDate?->format('M d, Y')}",
            'subtitle' => "Requested on {$visit->created_at->format('M d, Y')}",
            'created_at' => $visit->created_at->toIso8601String(),
            'photo_url' => $visit->shelterAnimal?->photo_url,
            'dashboard_url' => route('account.user.shelter-visits'),
            'details' => $details,
            'raw' => $visit,
        ];
    }
}
