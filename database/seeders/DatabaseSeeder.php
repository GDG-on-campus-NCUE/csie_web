<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 使用 enum 欄位儲存角色，seed 不需建立 roles table

        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin12345'),
                'status' => 'active',
            ]
        );

        // 直接給予使用者 enum 角色
        if ($user->role !== 'admin') {
            $user->role = 'admin';
            $user->save();
        }

        if (DB::table('post_categories')->count() === 0) {
            $this->call(PostCategorySeeder::class);
        }
    }
}
