<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    use HasFactory;

    /**
     * 可批次指定的欄位。
     *
     * @var list<string>
     */
    protected $fillable = [];
}
