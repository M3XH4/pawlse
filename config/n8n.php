<?php

return [
    /*
    |--------------------------------------------------------------------------
    | n8n Automation Enabled
    |--------------------------------------------------------------------------
    |
    | Global switch to enable or disable webhook dispatching to n8n.
    | When disabled, automation jobs will exit cleanly without errors.
    |
    */
    'enabled' => (bool) env('N8N_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | n8n Base URL
    |--------------------------------------------------------------------------
    |
    | The base URL where your n8n instance is accessible (e.g. http://n8n:5678
    | in Docker network or http://localhost:5678 in local development).
    |
    */
    'base_url' => rtrim(env('N8N_BASE_URL', 'http://localhost:5678'), '/'),

    /*
    |--------------------------------------------------------------------------
    | n8n Webhook Secret (HMAC Signing)
    |--------------------------------------------------------------------------
    |
    | Shared secret used to generate HMAC-SHA256 signatures for outgoing
    | webhooks to n8n, ensuring authenticity and preventing tampering.
    |
    */
    'webhook_secret' => env('N8N_WEBHOOK_SECRET', ''),

    /*
    |--------------------------------------------------------------------------
    | Inbound Automation API Key
    |--------------------------------------------------------------------------
    |
    | Secret key required by n8n to call Pawlse automation endpoints
    | (e.g., /api/automation/*) via the X-Automation-Key header.
    |
    */
    'api_key' => env('AUTOMATION_API_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | HTTP Client Settings
    |--------------------------------------------------------------------------
    |
    | Timeout in seconds and maximum retry attempts for webhook dispatches.
    |
    */
    'timeout' => (int) env('N8N_TIMEOUT', 5),
    'retries' => (int) env('N8N_RETRIES', 3),

    /*
    |--------------------------------------------------------------------------
    | Webhook Endpoint Paths / IDs
    |--------------------------------------------------------------------------
    |
    | Maps automation event names to their specific n8n webhook paths.
    | Can be overridden via environment variables if custom paths are used.
    |
    */
    'webhooks' => [
        'volunteer.application.submitted' => env('N8N_WEBHOOK_VOLUNTEER_SUBMITTED', '/webhook/pawlse/volunteer-submitted'),
        'volunteer.application.approved' => env('N8N_WEBHOOK_VOLUNTEER_APPROVED', '/webhook/pawlse/volunteer-approved'),
        'volunteer.application.rejected' => env('N8N_WEBHOOK_VOLUNTEER_REJECTED', '/webhook/pawlse/volunteer-rejected'),
        'adoption.application.submitted' => env('N8N_WEBHOOK_ADOPTION_SUBMITTED', '/webhook/pawlse/adoption-submitted'),
        'adoption.application.status_updated' => env('N8N_WEBHOOK_ADOPTION_STATUS', '/webhook/pawlse/adoption-status-updated'),
        'pet.rescue.submitted' => env('N8N_WEBHOOK_RESCUE_SUBMITTED', '/webhook/pawlse/rescue-submitted'),
        'donation.received' => env('N8N_WEBHOOK_DONATION_RECEIVED', '/webhook/pawlse/donation-received'),
    ],
];
