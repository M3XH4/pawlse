<?php

namespace App\Enums;

enum AnimalType: string
{
    case Cat = 'cat';
    case Dog = 'dog';
    case Other = 'other';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
