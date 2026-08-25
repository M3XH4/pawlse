<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class AccountSettingsController extends Controller
{
    /**
     * Show the account settings page for the authenticated user.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $component = match (true) {
            $request->is('account/super-admin*') => 'super-admin/account-settings',
            $request->is('account/admin*') => 'admin/account-settings',
            $request->is('account/volunteer*') => 'volunteer/account-settings',
            default => 'user/account-settings',
        };

        $props = [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'canManageTwoFactor' => Features::canManageTwoFactorAuthentication(),
        ];

        if (Features::canManageTwoFactorAuthentication()) {
            $props['twoFactorEnabled'] = $user->hasEnabledTwoFactorAuthentication();
            $props['requiresConfirmation'] = Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm');
        }

        return Inertia::render($component, $props);
    }
}
