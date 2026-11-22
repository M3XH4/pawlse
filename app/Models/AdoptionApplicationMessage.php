<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdoptionApplicationMessage extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'attachments' => 'array',
    ];

    /**
     * @return BelongsTo<AdoptionApplication, $this>
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(AdoptionApplication::class, 'adoption_application_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
