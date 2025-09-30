<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'display_name', 'description', 'priority'
    ];

    protected $casts = [
        'priority' => 'integer',
    ];

    // Relationships
    public function userRoles()
    {
        return $this->hasMany(UserRole::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles')->wherePivot('status', 'active');
    }

    // Scopes
    public function scopeByName($query, $name)
    {
        return $query->where('name', $name);
    }

    public function scopeOrderByPriority($query)
    {
        return $query->orderBy('priority', 'desc');
    }

    // Helper methods
    public static function getHierarchy()
    {
        return static::orderByPriority()->pluck('name', 'priority')->toArray();
    }

    public function isHigherThan(Role $role)
    {
        return $this->priority > $role->priority;
    }

    public function isHigherOrEqualTo(Role $role)
    {
        return $this->priority >= $role->priority;
    }
}
