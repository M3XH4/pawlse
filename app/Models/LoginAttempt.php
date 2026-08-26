<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginAttempt extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'ip_address',
        'user_agent',
        'status',
        'is_suspicious',
    ];

    protected $casts = [
        'is_suspicious' => 'boolean',
    ];

    /**
     * Get the user associated with the attempt.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
