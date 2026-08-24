<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DashboardRedirectController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        return redirect()->route(match ($request->user()?->role) {
            'volunteer' => 'account.volunteer.index',
            'admin' => 'account.admin.dashboard',
            'super-admin' => 'account.super-admin.dashboard',
            default => 'account.user.index',
        });
    }
}
