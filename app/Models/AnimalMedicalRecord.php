<?php

namespace App\Models;

use Database\Factories\AnimalMedicalRecordFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AnimalMedicalRecord extends Model
{
    /** @use HasFactory<AnimalMedicalRecordFactory> */
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'performed_date' => 'date',
        'next_due_date' => 'date',
    ];

    /**
     * @return BelongsTo<ShelterAnimal, $this>
     */
    public function shelterAnimal(): BelongsTo
    {
        return $this->belongsTo(ShelterAnimal::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
