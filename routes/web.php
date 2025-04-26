<?php

use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::get('', [HomeController::class, 'index'])->name('home');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/image.php';
require __DIR__.'/post.php';
