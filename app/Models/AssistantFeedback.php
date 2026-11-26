<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssistantFeedback extends Model
{
    protected $table = 'assistant_feedback';

    protected $fillable = [
        'user_id',
        'dashboard_role',
        'intent',
        'rating',
        'was_answered',
        'page_path',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'was_answered' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
