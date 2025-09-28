<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Classroom extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * 可大量指定的欄位，提供後台批次填寫的彈性。
     */
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

    /**
     * 型別轉換，確保布林與整數欄位在程式端正確表現。
     */
    protected $casts = [
        'visible' => 'boolean',
        'capacity' => 'integer',
        'sort_order' => 'integer',
        'tags' => 'array',
    ];

    /**
     * 多對多關聯：教室可綁定多位職員，對應 pivot classroom_staff。
     */
    public function staff()
    {
        return $this->belongsToMany(Staff::class, 'classroom_staff');
    }
}
