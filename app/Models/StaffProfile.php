<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StaffProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'person_id', 'position', 'position_en', 'department', 'department_en'
    ];

    // Relationships
    public function person()
    {
        return $this->belongsTo(Person::class);
    }

    public function classrooms()
    {
        return $this->belongsToMany(Classroom::class, 'classroom_staff', 'staff_id', 'classroom_id');
    }

    /**
     * Accessor: Get position as localized JSON object
     */
    public function getPositionAttribute($value)
    {
        return [
            'zh-TW' => $this->attributes['position'] ?? '',
            'en' => $this->attributes['position_en'] ?? '',
        ];
    }

    /**
     * Mutator: Set position from JSON object to separate fields
     */
    public function setPositionAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['position'] = $value['zh-TW'] ?? '';
            $this->attributes['position_en'] = $value['en'] ?? '';
        } else {
            $this->attributes['position'] = $value;
        }
    }

    /**
     * Accessor: Get department as localized JSON object
     */
    public function getDepartmentAttribute($value)
    {
        if (empty($this->attributes['department']) && empty($this->attributes['department_en'])) {
            return null;
        }

        return [
            'zh-TW' => $this->attributes['department'] ?? '',
            'en' => $this->attributes['department_en'] ?? '',
        ];
    }

    /**
     * Mutator: Set department from JSON object to separate fields
     */
    public function setDepartmentAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['department'] = $value['zh-TW'] ?? '';
            $this->attributes['department_en'] = $value['en'] ?? '';
        } else {
            $this->attributes['department'] = $value;
        }
    }
}
