<?php

namespace App\Models;

use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    /** @use HasFactory<EventFactory> */
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'date' => 'date',
        'keywords' => 'array',
        'spots' => 'integer',
    ];

    /**
     * @return HasMany<AssignedTask, $this>
     */
    public function assignedTasks(): HasMany
    {
        return $this->hasMany(AssignedTask::class);
    }

    /**
     * @return HasMany<Certificate, $this>
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }
}
