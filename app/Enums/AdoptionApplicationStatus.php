<?php

namespace App\Enums;

enum AdoptionApplicationStatus: string
{
    case Pending = 'pending';
    case Scheduled = 'scheduled';
    case Approved = 'approved';
    case Rejected = 'rejected';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
