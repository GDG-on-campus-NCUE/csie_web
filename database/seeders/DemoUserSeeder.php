<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // 管理員帳號
        $admin = User::firstOrCreate(
            ['email' => 'admin@csie.example.com'],
            [
                'name' => '系統管理員',
                'password' => Hash::make('admin123456'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $admin->profile()->firstOrCreate([], [
            'bio' => '系統管理員帳號',
        ]);

        // 教師帳號
        $teacher = User::firstOrCreate(
            ['email' => 'teacher@csie.example.com'],
            [
                'name' => '張教授',
                'password' => Hash::make('teacher123456'),
                'role' => 'teacher',
                'email_verified_at' => now(),
            ]
        );

        $teacher->profile()->firstOrCreate([], [
            'bio' => '專長於人工智慧、機器學習及資料科學領域',
            'experience' => [
                ['title' => '教授', 'organization' => '國立大學資訊系', 'start_date' => '2010', 'end_date' => null],
                ['title' => '副教授', 'organization' => '國立大學資訊系', 'start_date' => '2005', 'end_date' => '2010'],
            ],
            'education' => [
                ['degree' => '博士', 'major' => '資訊工程', 'institution' => 'MIT', 'year' => '2005'],
                ['degree' => '碩士', 'major' => '資訊工程', 'institution' => 'Stanford', 'year' => '2000'],
            ],
        ]);

        // 一般使用者帳號
        $user = User::firstOrCreate(
            ['email' => 'user@csie.example.com'],
            [
                'name' => '王同學',
                'password' => Hash::make('user123456'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );

        $user->profile()->firstOrCreate([], [
            'bio' => '碩士班學生，專注於資料科學研究',
        ]);

        $this->command->info('Demo users created successfully!');
        $this->command->table(
            ['Email', 'Password', 'Role'],
            [
                ['admin@csie.example.com', 'admin123456', 'admin'],
                ['teacher@csie.example.com', 'teacher123456', 'teacher'],
                ['user@csie.example.com', 'user123456', 'user'],
            ]
        );
    }
}
