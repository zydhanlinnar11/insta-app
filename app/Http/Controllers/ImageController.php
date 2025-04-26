<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ImageController extends Controller
{
    public function upload(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $image = new Image();
        $image->user_id = $user->getAuthIdentifier();
        $image->save();

        $file = $request->file('image');
        Log::debug('Has file: ' . $request->hasFile('image'));
        Log::debug('Ext: ' . $file->extension());
        if (!($file instanceof \Illuminate\Http\UploadedFile) || ($file->extension() !== 'jpg' && $file->extension() !== 'png') && $file->extension() !== 'jpeg') {
            throw ValidationException::withMessages([
                'image' => 'File harus berupa .jpg, .jpeg, .png'
            ]);
        }
        
        $ext = $file->extension();
        $filename = sprintf("%d.%s", $image->id, $ext);

        $file->storeAs('images', $filename);

        return response()->json([
            'id' => $image->id,
        ]);
    }
}
