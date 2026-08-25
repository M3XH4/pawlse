<?php

namespace App\Enums;

enum ShelterAnimalStatus: string
{
    case Available = 'available';
    case Pending = 'pending';
    case Adopted = 'adopted';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
