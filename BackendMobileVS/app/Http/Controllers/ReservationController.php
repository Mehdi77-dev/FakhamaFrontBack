<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            $reservations = Reservation::with(['user', 'product'])->get();
        } else {
            $reservations = $user->reservations()->with(['user', 'product'])->get();
        }

        return response()->json($reservations);
    }

    public function myReservations(Request $request)
    {
        $reservations = Reservation::where('user_id', Auth::id())
            ->with(['user', 'product'])
            ->get();
            
        return response()->json($reservations);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cin' => 'required|image|max:8192', // 8MB
            'items' => 'required|string', // JSON string
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $items = json_decode($request->items, true);

        if (!is_array($items) || empty($items)) {
             return response()->json(['message' => 'Invalid items format'], 400);
        }

        $cinPath = null;
        if ($request->hasFile('cin')) {
            $path = $request->file('cin')->store('cins', 'public');
            $cinPath = asset('storage/' . $path);
        }

        foreach ($items as $item) {
            $product = Product::find($item['product_id']);
            if (!$product) continue;

            $start = Carbon::parse($item['start_date']);
            $end = Carbon::parse($item['end_date']);
            $days = $start->diffInDays($end);
            if ($days < 1) $days = 1;

            $totalPrice = $product->price * $days;

            Reservation::create([
                'user_id' => Auth::id(),
                'product_id' => $product->id,
                'cin' => $cinPath,
                'start_date' => $item['start_date'],
                'end_date' => $item['end_date'],
                'total_price' => $totalPrice,
                'status' => 'pending',
                'productName' => $product->name,
                'productImage' => $product->image,
                'size' => $item['size'],
            ]);
        }

        return response()->json(['message' => 'Commande validée avec succès !'], 201);
    }
    public function markAsReturned($id)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservation not found'], 404);
        }

        $reservation->update(['status' => 'returned']);

        return response()->json([
            'message' => 'Costume marked as returned',
            'reservation' => $reservation
        ]);
    }
}
