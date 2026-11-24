<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PushSubscription extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'endpoint',
        'endpoint_hash',
        'public_key',
        'auth_token',
        'content_encoding',
        'user_agent',
        'is_standalone',
        'last_used_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_standalone' => 'boolean',
            'last_used_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function hashEndpoint(string $endpoint): string
    {
        return hash('sha256', trim($endpoint));
    }
}
