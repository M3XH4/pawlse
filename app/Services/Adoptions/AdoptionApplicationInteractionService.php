<?php

namespace App\Services\Adoptions;

use App\Enums\AdoptionApplicationStatus;
use App\Enums\Role;
use App\Enums\ShelterAnimalStatus;
use App\Events\AdoptionApplicationStatusUpdatedEvent;
use App\Models\AdoptionApplication;
use App\Models\AdoptionApplicationMessage;
use App\Models\AuditLog;
use App\Models\ShelterAnimal;
use App\Models\User;
use App\Notifications\AdoptionApplicationMessageNotification;
use App\Notifications\AdoptionApplicationStatusUpdatedNotification;
use App\Support\EReceiptDispatcher;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AdoptionApplicationInteractionService
{
    /**
     * Post a conversation message (with optional image/document attachments) on an adoption application.
     *
     * @param  array<int, UploadedFile>  $uploadedFiles
     */
    public function postMessage(
        AdoptionApplication $application,
        string $senderType,
        ?User $user,
        string $senderName,
        ?string $message,
        array $uploadedFiles = [],
        bool $requestInfo = false,
    ): AdoptionApplicationMessage {
        $attachments = [];

        foreach ($uploadedFiles as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $path = $file->store("adoption-messages/{$application->id}", 'public');
            $attachments[] = [
                'path' => $path,
                'name' => $file->getClientOriginalName(),
                'mime' => $file->getClientMimeType(),
                'size' => $file->getSize(),
                'url' => Storage::disk('public')->url($path),
            ];
        }

        $trimmedMessage = $message !== null ? trim($message) : null;
        if ($trimmedMessage === '') {
            $trimmedMessage = null;
        }

        $statusChangedToNeedsInfo = false;

        $createdMessage = DB::transaction(function () use (
            $application,
            $senderType,
            $user,
            $senderName,
            $trimmedMessage,
            $attachments,
            $requestInfo,
            &$statusChangedToNeedsInfo
        ): AdoptionApplicationMessage {
            $msg = $application->messages()->create([
                'user_id' => $user?->id,
                'sender_type' => $senderType,
                'sender_name' => $senderName,
                'message' => $trimmedMessage,
                'attachments' => $attachments,
            ]);

            if ($senderType === 'admin' && $requestInfo) {
                $statusChangedToNeedsInfo = $application->status !== AdoptionApplicationStatus::NeedsInfo;
                $application->update([
                    'status' => AdoptionApplicationStatus::NeedsInfo,
                    'notes' => $trimmedMessage ?? $application->notes,
                ]);
            } elseif ($senderType === 'user' && $application->status === AdoptionApplicationStatus::NeedsInfo) {
                $application->update([
                    'status' => AdoptionApplicationStatus::Pending,
                ]);
            }

            return $msg;
        });

        $application->loadMissing(['shelterAnimal', 'user']);
        $ref = 'ADP-'.str_pad((string) $application->id, 5, '0', STR_PAD_LEFT);

        if ($senderType === 'admin') {
            if ($requestInfo && $statusChangedToNeedsInfo) {
                EReceiptDispatcher::sendToUserAndEmail(
                    $application->user,
                    $application->email,
                    new AdoptionApplicationStatusUpdatedNotification($application)
                );
                AdoptionApplicationStatusUpdatedEvent::dispatch($application);
            } else {
                EReceiptDispatcher::sendToUserAndEmail(
                    $application->user,
                    $application->email,
                    new AdoptionApplicationMessageNotification($application, $createdMessage, forAdmin: false)
                );
            }

            AuditLog::log('adoption_application_message', "Admin sent message on adoption application {$ref}");
        } else {
            $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
            if ($admins->isNotEmpty()) {
                Notification::send($admins, new AdoptionApplicationMessageNotification($application, $createdMessage, forAdmin: true));
            }

            AdoptionApplicationStatusUpdatedEvent::dispatch($application);
            AuditLog::log('adoption_application_reply', "Applicant replied on adoption application {$ref}");
        }

        return $createdMessage;
    }

    /**
     * Cancel an active adoption application on behalf of the applicant and roll back animal status if needed.
     */
    public function cancelByApplicant(AdoptionApplication $application, string $actorLabel): void
    {
        $cancellable = [
            AdoptionApplicationStatus::Pending,
            AdoptionApplicationStatus::NeedsInfo,
            AdoptionApplicationStatus::Scheduled,
        ];

        if (! in_array($application->status, $cancellable, true)) {
            throw ValidationException::withMessages([
                'status' => ['Only pending, info-requested, or scheduled adoption applications can be cancelled.'],
            ]);
        }

        $oldStatus = $application->status;

        DB::transaction(function () use ($application, $oldStatus, $actorLabel): void {
            $animal = ShelterAnimal::where('id', $application->shelter_animal_id)
                ->lockForUpdate()
                ->first();

            $application->update([
                'status' => AdoptionApplicationStatus::Cancelled,
            ]);

            if ($animal && $oldStatus === AdoptionApplicationStatus::Scheduled && $animal->status === ShelterAnimalStatus::Pending) {
                $hasOtherScheduled = AdoptionApplication::where('shelter_animal_id', $animal->id)
                    ->where('id', '!=', $application->id)
                    ->where('status', AdoptionApplicationStatus::Scheduled)
                    ->exists();

                if (! $hasOtherScheduled) {
                    $animal->update([
                        'status' => ShelterAnimalStatus::Available,
                    ]);
                }
            }

            $ref = 'ADP-'.str_pad((string) $application->id, 5, '0', STR_PAD_LEFT);
            AuditLog::log('adoption_application_cancelled', "{$actorLabel} cancelled adoption application {$ref}");
        });

        $application->loadMissing(['shelterAnimal', 'user']);

        EReceiptDispatcher::sendToUserAndEmail(
            $application->user,
            $application->email,
            new AdoptionApplicationStatusUpdatedNotification($application)
        );
        AdoptionApplicationStatusUpdatedEvent::dispatch($application);
    }
}
