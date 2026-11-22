<?php

namespace App\Services\Account;

use App\Models\AdoptionApplication;
use App\Models\AssignedTask;
use App\Models\Certificate;
use App\Models\ContactMessage;
use App\Models\Donation;
use App\Models\PetReport;
use App\Models\RehomingRequest;
use App\Models\ShelterVisit;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class LinkGuestRecordsToUser
{
    /**
     * Link all unowned guest records matching the user's verified email to their account.
     *
     * @return array<string, int>
     */
    public function handle(User $user): array
    {
        $normalizedEmail = strtolower(trim((string) $user->email));

        if ($normalizedEmail === '') {
            return [];
        }

        /** @var array<string, array{model: class-string<Model>, column: string}> $targets */
        $targets = [
            'adoption_applications' => ['model' => AdoptionApplication::class, 'column' => 'email'],
            'donations' => ['model' => Donation::class, 'column' => 'donor_email'],
            'pet_reports' => ['model' => PetReport::class, 'column' => 'contact_email'],
            'rehoming_requests' => ['model' => RehomingRequest::class, 'column' => 'email'],
            'shelter_visits' => ['model' => ShelterVisit::class, 'column' => 'email'],
            'assigned_tasks' => ['model' => AssignedTask::class, 'column' => 'guest_email'],
            'certificates' => ['model' => Certificate::class, 'column' => 'guest_email'],
            'contact_messages' => ['model' => ContactMessage::class, 'column' => 'email'],
        ];

        return DB::transaction(function () use ($targets, $user, $normalizedEmail): array {
            $counts = [];

            foreach ($targets as $key => $target) {
                $modelClass = $target['model'];
                $column = $target['column'];

                $counts[$key] = $modelClass::query()
                    ->whereNull('user_id')
                    ->whereRaw("LOWER(TRIM({$column})) = ?", [$normalizedEmail])
                    ->update(['user_id' => $user->id]);
            }

            return $counts;
        });
    }
}
