<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'sizes',
        'image',
        'category',
        'tag',
        'is_featured',
    ];

    protected $casts = [
        'sizes' => 'array',
    ];

    protected $appends = ['is_favorite'];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function getIsFavoriteAttribute()
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return false;
        }
        
        return $this->favorites()->where('user_id', $user->id)->exists();
    }
}
