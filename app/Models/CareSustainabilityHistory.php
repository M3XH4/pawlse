<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CareSustainabilityHistory extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'care_sustainability_histories';

    protected $fillable = [
        'care_sustainability_id',
        'action',
        'funds_amount',
        'daily_cost',
        'amount_added',
        'days_added',
        'endpoint_before',
        'endpoint_after',
        'notes',
        'performed_by',
        'user_id',
        'donation_id',
        'created_at',
    ];

    protected $casts = [
        'funds_amount' => 'float',
        'daily_cost' => 'float',
        'amount_added' => 'float',
        'days_added' => 'float',
        'endpoint_before' => 'datetime',
        'endpoint_after' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function sustainability(): BelongsTo
    {
        return $this->belongsTo(CareSustainability::class, 'care_sustainability_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function donation(): BelongsTo
    {
        return $this->belongsTo(Donation::class, 'donation_id');
    }
}
