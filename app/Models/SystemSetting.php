<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    protected $casts = [
        'value' => 'array',
    ];

    /**
     * Get a setting by key.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = self::find($key);

        return $setting ? $setting->value : $default;
    }

    /**
     * Set a setting by key.
     */
    public static function setValue(string $key, mixed $value): self
    {
        return self::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }
}
