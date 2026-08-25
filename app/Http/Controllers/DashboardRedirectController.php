<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DashboardRedirectController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        return redirect()->route(match (true) {
            $user?->hasRole(Role::SuperAdmin->value) => 'account.super-admin.dashboard',
            $user?->hasRole(Role::Admin->value) => 'account.admin.dashboard',
            $user?->hasRole(Role::Volunteer->value) => 'account.volunteer.index',
            default => 'account.user.index',
        });
    }
}
