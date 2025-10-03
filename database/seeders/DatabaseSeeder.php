<?php

namespace Database\Seeders;

use App\Models\User;
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
        // 基礎管理員（保留原有）
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin12345'),
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // 直接給予使用者 enum 角色
        if ($user->role !== 'admin') {
            $user->role = 'admin';
            $user->save();
        }

        // 文章分類
        if (DB::table('post_categories')->count() === 0) {
            $this->call(PostCategorySeeder::class);
        }

        // 新增的 Seeders
        $this->call([
            DemoUserSeeder::class,
            TagSeeder::class,
            SpaceSeeder::class,
            SupportFaqSeeder::class,
        ]);

        $this->command->info('✅ All seeders completed!');
        $this->command->newLine();
        $this->command->info('📝 Demo Accounts:');
        $this->command->info('   Admin (original): admin@example.com / admin12345');
        $this->command->info('   Admin (demo):     admin@csie.example.com / admin123456');
        $this->command->info('   Teacher:          teacher@csie.example.com / teacher123456');
        $this->command->info('   User:             user@csie.example.com / user123456');
    }
}
