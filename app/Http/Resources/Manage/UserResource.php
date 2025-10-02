<?php

namespace App\Http\Resources\Manage;

use App\Models\ManageActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/** @mixin User */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $spaces = $this->whenLoaded('spaces', function () {
            return $this->spaces->map(fn ($space) => [
                'id' => $space->id,
                'name' => $space->name,
            ])->all();
        }, []);

        $profile = $this->whenLoaded('profile', function () {
            return [
                'avatar_url' => $this->profile->avatar_url,
                'bio' => $this->profile->bio,
            ];
        });

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'role_label' => $this->roleLabel($this->role),
            'status' => $this->status,
            'status_label' => $this->statusLabel($this->status),
            'space_count' => $this->spaces_count ?? ($this->spaces?->count() ?? 0),
            'spaces' => $spaces,
            'locale' => $this->locale,
            'last_login_at' => optional($this->last_login_at)->toIso8601String(),
            'last_seen_at' => optional($this->last_seen_at)->toIso8601String(),
            'email_verified_at' => optional($this->email_verified_at)->toIso8601String(),
            'created_at' => optional($this->created_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
            'profile' => $profile,
            'recent_activities' => $this->resolveRecentActivities(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>|null
     */
    protected function resolveRecentActivities(): ?array
    {
        $activities = $this->getAttribute('recent_activities');

        if ($activities === null) {
            return null;
        }

        if (! $activities instanceof Collection) {
            $activities = collect($activities);
        }

        return $activities->map(function (ManageActivity $activity) {
            return [
                'id' => $activity->id,
                'action' => $activity->action,
                'description' => $activity->description,
                'properties' => $activity->properties,
                'created_at' => optional($activity->created_at)->toIso8601String(),
            ];
        })->all();
    }

    protected function roleLabel(?string $role): string
    {
        return match ($role) {
            'admin' => __('管理員'),
            'teacher' => __('教師'),
            'user' => __('一般會員'),
            default => $role ?? __('未指定'),
        };
    }

    protected function statusLabel(string $status): string
    {
        return match ($status) {
            'active' => __('啟用'),
            'inactive' => __('停用'),
            default => $status,
        };
    }
}
