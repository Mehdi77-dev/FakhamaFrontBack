<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class FavoriteController extends Controller
{
    public function toggle(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = Auth::user();
        $existing = Favorite::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['status' => 'removed', 'is_favorite' => false]);
        } else {
            Favorite::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
            ]);
            return response()->json(['status' => 'added', 'is_favorite' => true]);
        }
    }

    public function index(Request $request)
    {
        $favorites = $request->user()->favorites()->with('product')->get();
        return response()->json($favorites);
    }
}
