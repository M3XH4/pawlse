<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Gcash = 'gcash';
    case Maya = 'maya';
    case BankTransfer = 'bank_transfer';
    case Paypal = 'paypal';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
