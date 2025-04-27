<?php

use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('posts/create', [PostController::class, 'create'])->name('posts.create');
    Route::post('posts', [PostController::class, 'store'])->name('posts.store');
    Route::post('posts/{post}/toggle-like', [PostController::class, 'toggleLike'])->name('posts.toggleLike');
    Route::delete('posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
    Route::post('posts/{post}/comments', [PostController::class, 'addComment'])->name('posts.addComment');
    Route::delete('comments/{comment}', [PostController::class, 'deleteComment'])->name('posts.deleteComment');
});
