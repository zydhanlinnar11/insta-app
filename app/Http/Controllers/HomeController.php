<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $posts = Post::orderBy('id', 'desc')->get();
        
        return Inertia::render('home', [
            'posts' => $posts,
        ]);
    }
}
