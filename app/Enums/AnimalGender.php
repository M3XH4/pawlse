<?php

namespace App\Enums;

enum AnimalGender: string
{
    case Male = 'male';
    case Female = 'female';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
