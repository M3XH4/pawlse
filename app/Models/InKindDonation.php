<?php

namespace App\Models;

use Database\Factories\InKindDonationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InKindDonation extends Model
{
    /** @use HasFactory<InKindDonationFactory> */
    use HasFactory;

    protected $guarded = [];

    /**
     * @return BelongsTo<Donation, $this>
     */
    public function donation(): BelongsTo
    {
        return $this->belongsTo(Donation::class);
    }

    /**
     * @return BelongsTo<AnimalDonationNeed, $this>
     */
    public function need(): BelongsTo
    {
        return $this->belongsTo(AnimalDonationNeed::class, 'animal_donation_need_id');
    }
}
