<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    /**
     * 可大量賦值的欄位。
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'name_en',
        'position',
        'position_en',
        'email',
        'phone',
        'bio',
        'bio_en',
        'visible',
        'sort_order',
    ];

    /**
     * 欄位轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'visible' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * 預設屬性。
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'visible' => true,
        'sort_order' => 0,
    ];

    /**
     * 將姓名欄位轉為多語格式回傳。
     */
    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value, array $attributes): array => [
                'zh-TW' => $value,
                'en' => $attributes['name_en'] ?? null,
            ],
            set: function ($value, array $attributes) {
                if (is_array($value)) {
                    return [
                        'name' => $value['zh-TW'] ?? $attributes['name'] ?? null,
                        'name_en' => $value['en'] ?? $attributes['name_en'] ?? null,
                    ];
                }

                return ['name' => $value];
            }
        );
    }

    /**
     * 將職稱欄位轉為多語格式回傳。
     */
    protected function position(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value, array $attributes): array => [
                'zh-TW' => $value,
                'en' => $attributes['position_en'] ?? null,
            ],
            set: function ($value, array $attributes) {
                if (is_array($value)) {
                    return [
                        'position' => $value['zh-TW'] ?? $attributes['position'] ?? null,
                        'position_en' => $value['en'] ?? $attributes['position_en'] ?? null,
                    ];
                }

                return ['position' => $value];
            }
        );
    }

    /**
     * 將簡介欄位轉為多語格式回傳。
     */
    protected function bio(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value, array $attributes): array => [
                'zh-TW' => $value,
                'en' => $attributes['bio_en'] ?? null,
            ],
            set: function ($value, array $attributes) {
                if (is_array($value)) {
                    return [
                        'bio' => $value['zh-TW'] ?? $attributes['bio'] ?? null,
                        'bio_en' => $value['en'] ?? $attributes['bio_en'] ?? null,
                    ];
                }

                return ['bio' => $value];
            }
        );
    }
}
