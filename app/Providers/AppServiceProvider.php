<?php

namespace App\Providers;

use App\Enums\Role;
use App\Listeners\DispatchN8nPlatformWebhooks;
use App\Listeners\DispatchN8nVolunteerWebhook;
use App\Listeners\LogFailedLogin;
use App\Listeners\LogSuccessfulLogin;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        Event::listen(
            Login::class,
            LogSuccessfulLogin::class
        );

        Event::listen(
            Failed::class,
            LogFailedLogin::class
        );

        Event::subscribe(DispatchN8nVolunteerWebhook::class);
        Event::subscribe(DispatchN8nPlatformWebhooks::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        Gate::before(fn (User $user, string $ability): ?bool => $user->hasRole(Role::SuperAdmin->value) ? true : null);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
