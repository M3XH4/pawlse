<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PetReport extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'is_duplicate' => 'boolean',
        'last_seen_date' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function (PetReport $report) {
            $report->checkForDuplicate();
        });
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function assignedVolunteer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_volunteer_id');
    }

    /**
     * @return BelongsTo<AiPredictionLog, $this>
     */
    public function aiPredictionLog(): BelongsTo
    {
        return $this->belongsTo(AiPredictionLog::class, 'ai_prediction_log_id');
    }

    /**
     * @return HasMany<PetReportPhoto, $this>
     */
    public function photos(): HasMany
    {
        return $this->hasMany(PetReportPhoto::class);
    }

    /**
     * @return BelongsTo<PetReport, $this>
     */
    public function duplicateOf(): BelongsTo
    {
        return $this->belongsTo(PetReport::class, 'duplicate_of_id');
    }

    /**
     * @return HasMany<PetReport, $this>
     */
    public function duplicates(): HasMany
    {
        return $this->hasMany(PetReport::class, 'duplicate_of_id');
    }

    /**
     * @return HasMany<AssignedTask, $this>
     */
    public function assignedTasks(): HasMany
    {
        return $this->hasMany(AssignedTask::class);
    }

    /**
     * Parse coordinates from location string
     */
    public function getCoordinates(): ?array
    {
        if (preg_match('/^\s*([\d\.-]+)\s*,\s*([\d\.-]+)/', $this->location, $matches)) {
            return [
                'lat' => (float) $matches[1],
                'lng' => (float) $matches[2],
            ];
        }

        return null;
    }

    /**
     * Calculate distance between two lat/lng pairs in kilometers
     */
    public static function haversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Duplicate checking logic
     */
    public function checkForDuplicate(): void
    {
        if ($this->is_duplicate) {
            return;
        }

        // Search active reports within the last 24 hours of the same animal type
        $query = self::query()
            ->where('animal_type', $this->animal_type)
            ->whereIn('status', ['pending', 'assigned'])
            ->where('created_at', '>=', now()->subHours(24));

        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        $candidates = $query->get();
        $coords = $this->getCoordinates();

        foreach ($candidates as $candidate) {
            $isMatch = false;

            if ($coords && $candidateCoords = $candidate->getCoordinates()) {
                // If coordinates match within 500m (0.5 km)
                $dist = self::haversineDistance($coords['lat'], $coords['lng'], $candidateCoords['lat'], $candidateCoords['lng']);
                if ($dist <= 0.5) {
                    $isMatch = true;
                }
            } else {
                // Exact or substring match on locations
                $loc1 = strtolower(trim($this->location));
                $loc2 = strtolower(trim($candidate->location));
                if ($loc1 === $loc2 || str_contains($loc1, $loc2) || str_contains($loc2, $loc1)) {
                    $isMatch = true;
                }
            }

            if ($isMatch) {
                $this->is_duplicate = true;
                $this->status = 'duplicate';
                $this->duplicate_of_id = $candidate->id;
                break;
            }
        }
    }
}
