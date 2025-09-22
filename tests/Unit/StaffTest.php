<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Staff;
use Illuminate\Foundation\Testing\RefreshDatabase;

class StaffTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_a_staff_member()
    {
        $staff = Staff::create([
            'name' => '張雅婷',
            'name_en' => 'Ya-Ting Chang',
            'position' => '系辦助理',
            'position_en' => 'Department Assistant',
            'email' => 'yating.chang@example.edu',
            'phone' => '04-2345-6789',
            'bio' => '負責系務行政工作',
            'bio_en' => 'Responsible for departmental administrative work',
            'visible' => true,
            'sort_order' => 1,
        ]);

        $this->assertInstanceOf(Staff::class, $staff);

        // Test accessing the raw attributes
        $this->assertEquals('張雅婷', $staff->getRawOriginal('name'));
        $this->assertEquals('yating.chang@example.edu', $staff->email);
        $this->assertTrue($staff->visible);

        // Test the JSON accessor
        $nameJson = $staff->name;
        $this->assertEquals('張雅婷', $nameJson['zh-TW']);
        $this->assertEquals('Ya-Ting Chang', $nameJson['en']);
    }

    /** @test */
    public function it_requires_name_and_email()
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        Staff::create([
            'position' => '系辦助理',
            'visible' => true,
        ]);
    }

    /** @test */
    public function it_can_be_filtered_by_visible_status()
    {
        Staff::create([
            'name' => '張雅婷',
            'name_en' => 'Ya-Ting Chang',
            'position' => '系辦助理',
            'position_en' => 'Department Assistant',
            'email' => 'visible@example.edu',
            'visible' => true,
        ]);

        Staff::create([
            'name' => '李志明',
            'name_en' => 'Chih-Ming Lee',
            'position' => '資訊管理員',
            'position_en' => 'IT Administrator',
            'email' => 'hidden@example.edu',
            'visible' => false,
        ]);

        $visibleStaff = Staff::where('visible', true)->get();
        $hiddenStaff = Staff::where('visible', false)->get();

        $this->assertCount(1, $visibleStaff);
        $this->assertCount(1, $hiddenStaff);
        $this->assertEquals('visible@example.edu', $visibleStaff->first()->email);
        $this->assertEquals('hidden@example.edu', $hiddenStaff->first()->email);
    }

    /** @test */
    public function it_can_be_ordered_by_sort_order()
    {
        Staff::create([
            'name' => '張雅婷',
            'name_en' => 'Ya-Ting Chang',
            'position' => '系辦助理',
            'position_en' => 'Department Assistant',
            'email' => 'first@example.edu',
            'sort_order' => 2,
        ]);

        Staff::create([
            'name' => '李志明',
            'name_en' => 'Chih-Ming Lee',
            'position' => '資訊管理員',
            'position_en' => 'IT Administrator',
            'email' => 'second@example.edu',
            'sort_order' => 1,
        ]);

        $orderedStaff = Staff::orderBy('sort_order')->get();

        $this->assertEquals('second@example.edu', $orderedStaff->first()->email);
        $this->assertEquals('first@example.edu', $orderedStaff->last()->email);
    }

    /** @test */
    public function it_has_default_values()
    {
        $staff = Staff::create([
            'name' => '張雅婷',
            'name_en' => 'Ya-Ting Chang',
            'position' => '系辦助理',
            'position_en' => 'Department Assistant',
            'email' => 'test@example.edu',
        ]);

        $this->assertTrue($staff->visible);
        $this->assertEquals(0, $staff->sort_order);
    }

    /** @test */
    public function it_can_search_by_name_or_email()
    {
        Staff::create([
            'name' => '張雅婷',
            'name_en' => 'Ya-Ting Chang',
            'position' => '系辦助理',
            'position_en' => 'Department Assistant',
            'email' => 'yating.chang@example.edu',
        ]);

        Staff::create([
            'name' => '李志明',
            'name_en' => 'Chih-Ming Lee',
            'position' => '資訊管理員',
            'position_en' => 'IT Administrator',
            'email' => 'chihming.lee@example.edu',
        ]);

        // Search by Chinese name
        $results = Staff::where('name', 'LIKE', '%張雅婷%')->get();
        $this->assertCount(1, $results);

        // Search by English name
        $results = Staff::where('name_en', 'LIKE', '%Chang%')->get();
        $this->assertCount(1, $results);

        // Search by email
        $results = Staff::where('email', 'LIKE', '%chihming%')->get();
        $this->assertCount(1, $results);
    }
}
