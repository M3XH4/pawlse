<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiPredictionLog extends Model
{
    protected $fillable = [
        'feature',
        'input_data',
        'output_data',
        'confidence',
        'is_accurate',
    ];

    protected $casts = [
        'input_data' => 'array',
        'output_data' => 'array',
        'confidence' => 'double',
        'is_accurate' => 'boolean',
    ];
}
