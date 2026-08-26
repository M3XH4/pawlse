<?php

namespace App\Models;

use Database\Factories\DonationAuditLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonationAuditLog extends Model
{
    /** @use HasFactory<DonationAuditLogFactory> */
    use HasFactory;

    protected $guarded = [];

    const UPDATED_AT = null;
}
