<?php

namespace Tests\Feature\Manage;

use App\Models\Staff;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffTeacherEmploymentStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_helpers_and_relationships_reflect_employment_status(): void
    {
        $user = User::factory()->create();

        $staff = Staff::factory()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'employment_status' => 'active',
            'employment_started_at' => now()->subYears(2),
        ]);

        $teacher = Teacher::factory()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'employment_status' => 'active',
            'employment_started_at' => now()->subYears(3),
        ]);

        $user->load(['teacher', 'staff']);

        $this->assertTrue($user->hasActiveStaffProfile());
        $this->assertTrue($user->hasActiveTeacherProfile());
        $this->assertTrue($teacher->fresh()->staffProfile?->is($staff));
        $this->assertTrue($staff->fresh()->teacherProfile?->is($teacher));

        $teacher->update([
            'employment_status' => 'retired',
            'employment_ended_at' => now()->subMonth(),
        ]);

        $user->unsetRelation('teacher');
        $this->assertFalse($user->fresh()->hasActiveTeacherProfile());
    }

    public function test_scopes_filter_current_and_former_records(): void
    {
        Staff::factory()->count(2)->create([
            'employment_status' => 'active',
            'employment_ended_at' => null,
        ]);
        Staff::factory()->former('left')->create();

        $this->assertCount(2, Staff::currentlyEmployed()->get());
        $this->assertCount(1, Staff::formerlyEmployed()->get());

        Teacher::factory()->count(3)->create([
            'employment_status' => 'active',
            'employment_ended_at' => null,
        ]);
        Teacher::factory()->former('inactive')->create();

        $this->assertCount(3, Teacher::currentlyEmployed()->get());
        $this->assertCount(1, Teacher::formerlyEmployed()->get());
    }
}
