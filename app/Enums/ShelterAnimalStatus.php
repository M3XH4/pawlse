<?php

namespace App\Enums;

enum ShelterAnimalStatus: string
{
    case Available = 'available';
    case Pending = 'pending';
    case Adopted = 'adopted';
    case Foster = 'foster';
    case Treatment = 'treatment';
    case Quarantine = 'quarantine';
    case Deceased = 'deceased';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
