<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Ensure base roles exist
        $roles = [
            ['name' => 'admin', 'display_name' => '管理員', 'priority' => 100],
            ['name' => 'teacher', 'display_name' => '教師', 'priority' => 80],
            ['name' => 'staff', 'display_name' => '職員', 'priority' => 60],
            ['name' => 'user', 'display_name' => '一般會員', 'priority' => 20],
        ];

        foreach ($roles as $roleData) {
            Role::firstOrCreate(
                ['name' => $roleData['name']],
                ['display_name' => $roleData['display_name'], 'priority' => $roleData['priority']]
            );
        }

        // Ensure an admin user exists
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin12345'),
                'status' => 'active',
            ]
        );

        $adminRoleId = Role::where('name', 'admin')->value('id');
        if ($adminRoleId && ! $user->userRoles()->where('role_id', $adminRoleId)->where('status', 'active')->exists()) {
            UserRole::updateOrCreate(
                ['user_id' => $user->id, 'role_id' => $adminRoleId],
                ['status' => 'active', 'assigned_at' => now()]
            );
        }

        // Seed post categories once
        if (DB::table('post_categories')->count() === 0) {
            $this->call(PostCategorySeeder::class);
        }
    }
}
