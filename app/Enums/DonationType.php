<?php

namespace App\Enums;

enum DonationType: string
{
    case Cash = 'cash';
    case InKind = 'in_kind';
    case FeedingSponsorship = 'feeding_sponsorship';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
