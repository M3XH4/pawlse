<?php

namespace App\Models;

use Database\Factories\PaymentProofFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentProof extends Model
{
    /** @use HasFactory<PaymentProofFactory> */
    use HasFactory;

    protected $guarded = [];

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
