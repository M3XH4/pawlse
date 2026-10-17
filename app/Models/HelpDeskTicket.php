<?php

namespace App\Models;

use Database\Factories\HelpDeskTicketFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class HelpDeskTicket extends Model
{
    /** @use HasFactory<HelpDeskTicketFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ticket_number',
        'user_id',
        'category',
        'priority',
        'status',
        'subject',
        'description',
        'target_role',
        'is_escalated',
        'escalated_to_super_admin_at',
        'escalation_reason',
        'assigned_to_user_id',
        'resolved_at',
        'resolved_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'is_escalated' => 'boolean',
            'escalated_to_super_admin_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (HelpDeskTicket $ticket): void {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = static::generateTicketNumber();
            }
        });
    }

    public static function generateTicketNumber(): string
    {
        $prefix = 'HD-'.now()->format('ym');
        $random = strtoupper(Str::random(4));

        return "{$prefix}-{$random}";
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by_user_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(HelpDeskReply::class, 'ticket_id')->orderBy('created_at', 'asc');
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->whereIn('status', ['open', 'in_progress', 'waiting_on_user']);
    }

    public function scopeEscalated(Builder $query): Builder
    {
        return $query->where('is_escalated', true);
    }

    public function isOpen(): bool
    {
        return in_array($this->status, ['open', 'in_progress', 'waiting_on_user'], true);
    }

    public function isResolved(): bool
    {
        return $this->status === 'resolved';
    }
}
