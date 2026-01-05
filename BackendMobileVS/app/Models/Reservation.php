<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'cin',
        'start_date',
        'end_date',
        'total_price',
        'status',
        'productName',
        'productImage',
        'size',
    ];

    protected $appends = ['cin_url'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getCinUrlAttribute()
    {
        if (empty($this->cin)) {
            return null;
        }

        // If it's already a full URL, return it
        if (str_starts_with($this->cin, 'http')) {
            return $this->cin;
        }

        // Clean double slashes or storage duplication
        $path = ltrim($this->cin, '/');
        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, 8); // remove 'storage/'
        }

        return asset('storage/' . $path);
    }
}
