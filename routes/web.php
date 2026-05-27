<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;
use App\Http\Controllers\PetController;
use Illuminate\Http\Request;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');
Route::inertia('/about', 'about')->name('about');
Route::inertia('/adopt', 'adopt')->name('adopt');
Route::inertia('/donate', 'donate')->name('donate');

Route::get('/volunteer', function (Request $request) {
    return Inertia::render('volunteer', [
        'selectedEvent' => $request->input('selectedEvent')
    ]);
});

Route::inertia('/rescue', 'rescue')->name('rescue');
Route::inertia('/events', 'events')->name('events');
Route::inertia('/missing', 'missing')->name('missing');
Route::inertia('/sos', 'sos')->name('sos');

Route::post('/ai/predict', [PetController::class, 'predict']);
Route::post('/ai/generate-names', [PetController::class, 'generateNames']);


Route::inertia('/account/user', 'user/dashboard')->name('account.user');
Route::inertia('/account/user/bookmark', 'user/bookmark')->name('account.user.bookmark');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'user/dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
