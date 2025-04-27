<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $posts = Post::with('user', 'images', 'userCommenters')
            ->withCount('likes')
            ->withExists(['likes AS is_liked' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            }])
            ->orderBy('id', 'desc')
            ->get();

        $data = [];

        foreach ($posts as $post) {
            $images = [];
            foreach($post->images as $image) {
                $images[] = [
                    'link' => Storage::url(sprintf("images/%d.%s", $image->id, $image->file_ext)),
                ];
            }
            $comments = [];
            foreach($post->userCommenters as $userCommenter) {
                $comments[] = [
                    'id' => $userCommenter->pivot->id,
                    'comment' => $userCommenter->pivot->comment,
                    'created_at' => $userCommenter->pivot->created_at,
                    'commenter_username' => $userCommenter->username,
                ];
            }

            $data[] = [
                'id' => $post->id,
                'caption' => $post->caption,
                'poster_username' => $post->user->username,
                'created_at' => $post->created_at,
                'images' => $images,
                'likes_count' => $post->likes_count,
                'is_liked' => $post->is_liked,
                'can_delete' => Gate::allows('delete-post', $post),
                'comments' => $comments,
            ];
        }
        
        return Inertia::render('home', [
            'posts' => $data,
        ]);
    }
}
