<?php

use App\Http\Controllers\ImageController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::post('images/upload', [ImageController::class, 'upload'])->name('images.upload');
});
