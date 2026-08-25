<?php

namespace App\Enums;

enum InKindStatus: string
{
    case Scheduled = 'scheduled';
    case Received = 'received';
    case Verified = 'verified';
    case Cancelled = 'cancelled';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
