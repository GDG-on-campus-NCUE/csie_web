<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\Teacher;
use App\Models\Staff;

return new class extends Migration
{
    public function up(): void
    {
        // 遷移現有教師資料到新系統
        $this->migrateTeachers();

        // 遷移現有職員資料到新系統
        $this->migrateStaff();

        // 遷移現有使用者角色到新系統
        $this->migrateUserRoles();
    }

    private function migrateTeachers(): void
    {
        $teachers = Teacher::with('user')->get();

        foreach ($teachers as $teacher) {
            // 建立人員基底資料
            $person = DB::table('people')->insertGetId([
                'name' => $teacher->attributes['name'] ?? '',
                'name_en' => $teacher->attributes['name_en'] ?? '',
                'email' => $teacher->email ?? $teacher->user?->email ?? '',
                'phone' => $teacher->phone,
                'photo_url' => $teacher->photo_url,
                'bio' => $teacher->attributes['bio'] ?? '',
                'bio_en' => $teacher->attributes['bio_en'] ?? '',
                'status' => 'active',
                'sort_order' => $teacher->sort_order,
                'visible' => $teacher->visible,
                'created_at' => $teacher->created_at,
                'updated_at' => $teacher->updated_at,
                'deleted_at' => $teacher->deleted_at,
            ]);

            // 建立教師專屬資料
            DB::table('teacher_profiles')->insert([
                'person_id' => $person,
                'office' => $teacher->office,
                'job_title' => $teacher->job_title,
                'title' => $teacher->attributes['title'] ?? '',
                'title_en' => $teacher->attributes['title_en'] ?? '',
                'expertise' => $teacher->attributes['expertise'] ?? null,
                'expertise_en' => $teacher->attributes['expertise_en'] ?? null,
                'education' => $teacher->attributes['education'] ?? null,
                'education_en' => $teacher->attributes['education_en'] ?? null,
                'created_at' => $teacher->created_at,
                'updated_at' => $teacher->updated_at,
            ]);

            // 如果有關聯的使用者帳號，建立角色關聯
            if ($teacher->user) {
                $teacherRoleId = DB::table('roles')->where('name', 'teacher')->value('id');
                DB::table('user_roles')->insert([
                    'user_id' => $teacher->user->id,
                    'role_id' => $teacherRoleId,
                    'person_id' => $person,
                    'status' => 'active',
                    'assigned_at' => $teacher->created_at,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function migrateStaff(): void
    {
        $staffMembers = Staff::all();

        foreach ($staffMembers as $staff) {
            // 建立人員基底資料
            $person = DB::table('people')->insertGetId([
                'name' => $staff->attributes['name'] ?? '',
                'name_en' => $staff->attributes['name_en'] ?? '',
                'email' => $staff->email ?? '',
                'phone' => $staff->phone,
                'photo_url' => $staff->photo_url,
                'bio' => $staff->attributes['bio'] ?? '',
                'bio_en' => $staff->attributes['bio_en'] ?? '',
                'status' => 'active',
                'sort_order' => $staff->sort_order,
                'visible' => $staff->visible,
                'created_at' => $staff->created_at,
                'updated_at' => $staff->updated_at,
                'deleted_at' => $staff->deleted_at,
            ]);

            // 建立職員專屬資料
            DB::table('staff_profiles')->insert([
                'person_id' => $person,
                'position' => $staff->attributes['position'] ?? '',
                'position_en' => $staff->attributes['position_en'] ?? '',
                'department' => null,
                'department_en' => null,
                'created_at' => $staff->created_at,
                'updated_at' => $staff->updated_at,
            ]);
        }
    }

    private function migrateUserRoles(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            $roleId = DB::table('roles')->where('name', $user->role)->value('id');

            if ($roleId) {
                // 找看看是否有對應的人員資料
                $personId = null;
                if ($user->role === 'teacher' && $user->teacher) {
                    $personId = DB::table('people')
                        ->where('email', $user->email)
                        ->value('id');
                }

                DB::table('user_roles')->insert([
                    'user_id' => $user->id,
                    'role_id' => $roleId,
                    'person_id' => $personId,
                    'status' => $user->status === 'active' ? 'active' : 'inactive',
                    'assigned_at' => $user->created_at,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        // 清空新建立的資料表
        DB::table('user_roles')->truncate();
        DB::table('staff_profiles')->truncate();
        DB::table('teacher_profiles')->truncate();
        DB::table('people')->truncate();
    }
};
