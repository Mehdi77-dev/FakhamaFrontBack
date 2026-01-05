<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $revenue = Reservation::sum('total_price');
        $activeRentals = Reservation::where('status', 'active')->count();
        $totalProducts = Product::count();

        return response()->json([
            'revenue' => number_format($revenue, 0, '.', ' ') . ' DH',
            'activeRentals' => $activeRentals,
            'totalProducts' => $totalProducts,
        ]);
    }
}
