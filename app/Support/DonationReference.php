<?php

namespace App\Support;

use Illuminate\Support\Str;

final class DonationReference
{
    public static function make(string $prefix = 'DON'): string
    {
        return sprintf(
            '%s-%s-%s',
            $prefix,
            Str::upper(bin2hex(random_bytes(4))),
            Str::upper(Str::random(3)),
        );
    }
}
