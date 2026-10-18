<?php

namespace App\Models;

use Database\Factories\PaymentProofFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PaymentProof extends Model
{
    /** @use HasFactory<PaymentProofFactory> */
    use HasFactory;

    protected $guarded = [];

    protected $appends = ['url'];

    protected $casts = [
        'uploaded_at' => 'datetime',
        'file_size' => 'integer',
    ];

    /**
     * Get publicly accessible URL for the receipt image.
     */
    public function getUrlAttribute(): string
    {
        if (empty($this->path)) {
            return '';
        }

        if (str_starts_with($this->path, 'http://') || str_starts_with($this->path, 'https://')) {
            return $this->path;
        }

        $cleanPath = ltrim(str_replace('/storage/', '', $this->path), '/');

        return Storage::disk($this->disk ?: 'public')->url($cleanPath);
    }

    /**
     * @return BelongsTo<Donation, $this>
     */
    public function donation(): BelongsTo
    {
        return $this->belongsTo(Donation::class);
    }

    /**
     * @return BelongsTo<Payment, $this>
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
