<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('posts/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $validated = $request->validate([
            'caption' => 'required|string|max:1024',
            'image_ids' => 'required|array|max:5',
            'image_ids.*' => 'required|integer|exists:images,id',
        ]);

        DB::transaction(function () use ($user, $validated) {
            $post = new Post();
            $post->user_id = $user->getAuthIdentifier();
            $post->caption = $validated['caption'];
            $post->save();

            $images = $validated['image_ids'];
            DB::table('images')
                ->whereIn('id', $images)
                ->update(['post_id' => $post->id]);
        });
        
        return to_route('home');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function toggleLike(Request $request, Post $post)
    {
        $user = $request->user();
        $post->likes()->toggle([$user->id]);
    }
}
