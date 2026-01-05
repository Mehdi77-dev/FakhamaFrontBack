<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();
        return $this->buildResponse($user);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return $this->buildResponse($user);
    }

    private function buildResponse($user)
    {
        // Active Rental (Snapshot of active reservation)
        $activeRental = Reservation::where('user_id', $user->id)
            ->where('status', 'active')
            ->with('product')
            ->first();

        // History
        $history = Reservation::where('user_id', $user->id)
            ->whereIn('status', ['returned', 'late'])
            ->with('product')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'user' => $user,
            'activeRental' => $activeRental,
            'history' => $history
        ]);
    }
}
