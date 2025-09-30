<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Classroom extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'name_en',
        'location',
        'capacity',
        'equipment_summary',
        'description',
        'description_en',
        'tags',
        'sort_order',
        'visible',
    ];

    protected $casts = [
        'visible' => 'boolean',
        'capacity' => 'integer',
        'sort_order' => 'integer',
        'tags' => 'array',
    ];

    /**
     * 多對多關聯：教室與使用者。
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'classroom_user');
    }
}
