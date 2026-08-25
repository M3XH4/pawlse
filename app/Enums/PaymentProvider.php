<?php

namespace App\Enums;

enum PaymentProvider: string
{
    case Manual = 'manual';
    case Paypal = 'paypal';
    case Gcash = 'gcash';
    case Maya = 'maya';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
