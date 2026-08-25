<?php

namespace App\Enums;

enum SocialProvider: string
{
    case Google = 'google';
    case Facebook = 'facebook';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
