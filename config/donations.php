<?php

return [

    'currency' => env('DONATION_CURRENCY', 'PHP'),

    'feeding_day_amount' => (int) env('DONATION_FEEDING_DAY_AMOUNT', 3500),

    'monthly_goal_amount' => (int) env('DONATION_MONTHLY_GOAL_AMOUNT', 50000),

    'proof_max_kilobytes' => (int) env('DONATION_PROOF_MAX_KB', 5120),

    'proof_disk' => env('DONATION_PROOF_DISK', 'local'),

    'webhook_secret' => env('PAYMENT_WEBHOOK_SECRET'),

    'providers' => [
        'gcash' => env('DONATION_GCASH_PROVIDER', 'manual'),
        'maya' => env('DONATION_MAYA_PROVIDER', 'manual'),
        'bank_transfer' => env('DONATION_BANK_PROVIDER', 'manual'),
        'paypal' => env('DONATION_PAYPAL_PROVIDER', 'manual'),
    ],

    'paypal' => [
        'client_id' => env('PAYPAL_CLIENT_ID'),
        'client_secret' => env('PAYPAL_CLIENT_SECRET'),
        'webhook_id' => env('PAYPAL_WEBHOOK_ID'),
    ],

    'gcash' => [
        'merchant_id' => env('GCASH_MERCHANT_ID'),
        'api_key' => env('GCASH_API_KEY'),
        'api_secret' => env('GCASH_API_SECRET'),
    ],

    'maya' => [
        'public_key' => env('MAYA_PUBLIC_KEY'),
        'secret_key' => env('MAYA_SECRET_KEY'),
    ],

    'payment_methods' => [
        [
            'method' => 'gcash',
            'label' => 'GCash',
            'description' => 'Scan QR Code to Pay',
            'enabled' => (bool) env('DONATION_GCASH_ENABLED', true),
            'account_name' => env('DONATION_GCASH_ACCOUNT_NAME', 'I.S.F.'),
            'account_number_masked' => env('DONATION_GCASH_MOBILE_MASKED', '093• ••••547'),
            'account_number' => env('DONATION_GCASH_MOBILE', '09300000547'),
            'user_id_masked' => env('DONATION_GCASH_USER_ID_MASKED', '••••••••••WEVWRBP'),
            'user_id' => env('DONATION_GCASH_USER_ID', 'WEVWRBP'),
            'qr_url' => env('DONATION_GCASH_QR_URL', '/images/gcash-qr.jpg'),
        ],
        [
            'method' => 'bank_transfer',
            'label' => 'Bank Transfer',
            'description' => 'Direct Bank Deposit',
            'enabled' => (bool) env('DONATION_BANK_ENABLED', true),
            'bank_name' => env('DONATION_BANK_NAME', 'BDO Unibank'),
            'account_name' => env('DONATION_BANK_ACCOUNT_NAME', 'Iligan Stray Feeders'),
            'account_number_masked' => env('DONATION_BANK_ACCOUNT_MASKED', '0012-3456-7890'),
            'account_number' => env('DONATION_BANK_ACCOUNT_NUMBER', '001234567890'),
        ],
        [
            'method' => 'paypal',
            'label' => 'PayPal',
            'description' => 'International Donations',
            'enabled' => (bool) env('DONATION_PAYPAL_ENABLED', true),
            'email' => env('DONATION_PAYPAL_EMAIL', 'donate@iliganstrayfeeders.org'),
        ],
        [
            'method' => 'maya',
            'label' => 'Maya',
            'description' => 'Pay via Maya',
            'enabled' => (bool) env('DONATION_MAYA_ENABLED', true),
            'account_name' => env('DONATION_MAYA_ACCOUNT_NAME', 'Iligan Stray Feeders'),
            'account_number_masked' => env('DONATION_MAYA_MOBILE_MASKED', '09•• ••• ••••'),
            'account_number' => env('DONATION_MAYA_MOBILE', ''),
        ],
    ],

];
