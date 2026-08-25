<?php

namespace App\Enums;

enum AnimalAgeCategory: string
{
    case Puppy = 'puppy';
    case Kitten = 'kitten';
    case Young = 'young';
    case Adult = 'adult';
    case Senior = 'senior';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
