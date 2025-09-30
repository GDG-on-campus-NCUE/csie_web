<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $roles = DB::table('roles')->pluck('id', 'name');
        $now = now();

        // 確保每個使用者至少擁有一個基礎角色
        User::query()->chunkById(100, function ($users) use ($roles, $now) {
            foreach ($users as $user) {
                $existingRoles = DB::table('user_roles')
                    ->where('user_id', $user->id)
                    ->pluck('role_id');

                if ($existingRoles->isEmpty() && isset($roles['user'])) {
                    DB::table('user_roles')->insert([
                        'user_id' => $user->id,
                        'role_id' => $roles['user'],
                        'status' => $user->status === 'active' ? 'active' : 'inactive',
                        'assigned_at' => $user->created_at ?? $now,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }

                $shouldAssignTeacherRole = false;

                if (method_exists($user, 'hasRole') && $user->hasRole('teacher')) {
                    $shouldAssignTeacherRole = true;
                } elseif (property_exists($user, 'role') && $user->role === 'teacher') {
                    $shouldAssignTeacherRole = true;
                } elseif (Schema::hasTable('teachers')) {
                    $shouldAssignTeacherRole = DB::table('teachers')
                        ->where('user_id', $user->id)
                        ->exists();
                }

                // 若使用者具備教師身分，加入教師角色
                if ($shouldAssignTeacherRole && isset($roles['teacher'])) {
                    DB::table('user_roles')->updateOrInsert(
                        ['user_id' => $user->id, 'role_id' => $roles['teacher']],
                        [
                            'status' => 'active',
                            'assigned_at' => $user->created_at ?? $now,
                            'updated_at' => $now,
                        ]
                    );
                }

                // 建立預設個人檔案
                $profileExists = DB::table('user_profiles')
                    ->where('user_id', $user->id)
                    ->exists();

                if (! $profileExists) {
                    DB::table('user_profiles')->insert([
                        'user_id' => $user->id,
                        'bio' => null,
                        'avatar_url' => null,
                        'experience' => json_encode([]),
                        'education' => json_encode([]),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        });
    }

    public function down(): void
    {
        DB::table('user_profile_links')->truncate();
        DB::table('user_profiles')->truncate();
        DB::table('user_roles')->truncate();
    }
};
