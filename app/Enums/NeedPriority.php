<?php

namespace App\Enums;

enum NeedPriority: string
{
    case Urgent = 'urgent';
    case High = 'high';
    case Medium = 'medium';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
