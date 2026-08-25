<?php

namespace App\Enums;

enum Role: string
{
    case User = 'user';
    case Volunteer = 'volunteer';
    case Admin = 'admin';
    case SuperAdmin = 'super-admin';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
