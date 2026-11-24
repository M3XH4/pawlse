<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SystemSetting extends Model
{
    private const CACHE_PREFIX = 'system_setting:';

    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    protected $casts = [
        'value' => 'array',
    ];

    protected static function booted(): void
    {
        static::saved(function (self $setting): void {
            Cache::forget(self::CACHE_PREFIX.$setting->key);
        });

        static::deleted(function (self $setting): void {
            Cache::forget(self::CACHE_PREFIX.$setting->key);
        });
    }

    /**
     * Get a setting by key.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $cached = Cache::rememberForever(self::CACHE_PREFIX.$key, function () use ($key): array {
            $setting = self::find($key);

            return $setting !== null
                ? ['found' => true, 'value' => $setting->value]
                : ['found' => false, 'value' => null];
        });

        return $cached['found'] ? $cached['value'] : $default;
    }

    /**
     * Set a setting by key.
     */
    public static function setValue(string $key, mixed $value): self
    {
        $record = self::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );

        Cache::forget(self::CACHE_PREFIX.$key);

        return $record;
    }
}
