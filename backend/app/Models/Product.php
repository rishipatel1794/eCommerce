<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use app\Models\User;

class Product extends Model
{
    protected $fillable = [
        'name',
        'category',
        'description',
        'price',
        'features',
        'stock',
        'user_id',
        'image',
        'rating',
    ];


    protected $casts = [
        'features' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getImageSrcAttribute()
    {
        if (!$this->image)
            return null;

        // If already full URL
        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }

        // If local file
        return asset('storage/' . $this->image);
    }

    // Backwards-compatible accessor expected by controllers: `image_url`
    public function getImageUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }

        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }

        return asset($this->image);
    }

    

}
