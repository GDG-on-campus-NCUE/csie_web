<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'role_id', 'person_id', 'status', 'assigned_at', 'deactivated_at'
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'deactivated_at' => 'datetime',
    ];

    protected $attributes = [
        'status' => 'active',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function person()
    {
        return $this->belongsTo(Person::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForRole($query, $roleName)
    {
        return $query->whereHas('role', function ($q) use ($roleName) {
            $q->where('name', $roleName);
        });
    }

    // Helper methods
    public function activate()
    {
        $this->update([
            'status' => 'active',
            'deactivated_at' => null,
        ]);
    }

    public function deactivate()
    {
        $this->update([
            'status' => 'inactive',
            'deactivated_at' => now(),
        ]);
    }

    public function isActive()
    {
        return $this->status === 'active';
    }
}
