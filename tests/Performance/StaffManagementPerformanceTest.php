<?php

namespace Tests\Performance;

use Tests\TestCase;
use App\Models\Staff;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class StaffManagementPerformanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Skip authentication middleware for performance testing
        $this->withoutMiddleware();
    }

    /** @test */
    public function staff_model_queries_are_efficient()
    {
        // Create 100 staff records
        Staff::factory()->count(100)->create();

        $startTime = microtime(true);

        // Test basic query performance
        $staff = Staff::visible()->orderBy('sort_order')->get();

        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds

        $this->assertCount(100, $staff);

        // Assert query time is under 50ms
        $this->assertLessThan(50, $executionTime,
            "Staff query took {$executionTime}ms, which exceeds 50ms limit");
    }

    /** @test */
    public function teacher_model_queries_are_efficient()
    {
        // Create 100 teacher records, ensure they're visible
        Teacher::factory()->count(100)->create(['visible' => true]);

        $startTime = microtime(true);

        // Test basic query performance
        $teachers = Teacher::visible()->orderBy('sort_order')->get();

        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds

        $this->assertCount(100, $teachers);

        // Assert query time is under 50ms
        $this->assertLessThan(50, $executionTime,
            "Teacher query took {$executionTime}ms, which exceeds 50ms limit");
    }

    /** @test */
    public function staff_creation_is_efficient()
    {
        $staffData = [
            'name' => ['zh-TW' => '測試職員', 'en' => 'Test Staff'],
            'position' => ['zh-TW' => '行政人員', 'en' => 'Administrative Staff'],
            'email' => 'test@example.edu',
            'phone' => '04-1234-5678',
            'visible' => true,
        ];

        $startTime = microtime(true);

        $staff = Staff::create($staffData);

        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds

        $this->assertInstanceOf(Staff::class, $staff);

        // Assert creation time is under 50ms
        $this->assertLessThan(50, $executionTime,
            "Staff creation took {$executionTime}ms, which exceeds 50ms limit");
    }

    /** @test */
    public function teacher_creation_is_efficient()
    {
        $teacherData = [
            'name' => ['zh-TW' => '測試教師', 'en' => 'Test Teacher'],
            'title' => ['zh-TW' => '教授', 'en' => 'Professor'],
            'email' => 'teacher@example.edu',
            'phone' => '04-1234-5678',
            'office' => 'IB501',
            'visible' => true,
        ];

        $startTime = microtime(true);

        $teacher = Teacher::create($teacherData);

        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds

        $this->assertInstanceOf(Teacher::class, $teacher);

        // Assert creation time is under 50ms
        $this->assertLessThan(50, $executionTime,
            "Teacher creation took {$executionTime}ms, which exceeds 50ms limit");
    }

    /** @test */
    public function search_functionality_is_performant()
    {
        // Create 100 staff records with searchable content
        Staff::factory()->count(100)->create();

        $startTime = microtime(true);

        // Test search performance
        $results = Staff::search('Test')->get();

        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds

        // Assert search time is under 100ms
        $this->assertLessThan(100, $executionTime,
            "Staff search took {$executionTime}ms, which exceeds 100ms limit");
    }

    /** @test */
    public function bulk_operations_are_efficient()
    {
        $startTime = microtime(true);

        // Create 50 staff records in bulk
        Staff::factory()->count(50)->create();

        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds

        $this->assertEquals(50, Staff::count());

        // Assert bulk creation time is under 500ms
        $this->assertLessThan(500, $executionTime,
            "Bulk staff creation took {$executionTime}ms, which exceeds 500ms limit");
    }

    /** @test */
    public function json_field_operations_are_efficient()
    {
        $startTime = microtime(true);

        // Create teacher with complex JSON fields
        $teacher = Teacher::create([
            'name' => ['zh-TW' => '測試教師', 'en' => 'Test Teacher'],
            'title' => ['zh-TW' => '教授', 'en' => 'Professor'],
            'email' => 'teacher@example.edu',
            'bio' => ['zh-TW' => '這是一個長的個人簡介...', 'en' => 'This is a long biography...'],
            'expertise' => [
                'zh-TW' => ['人工智慧', '機器學習', '深度學習', '自然語言處理'],
                'en' => ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Natural Language Processing']
            ],
            'education' => [
                'zh-TW' => ['台灣大學資訊工程博士', '清華大學資訊科學碩士'],
                'en' => ['Ph.D. in Computer Science, National Taiwan University', 'M.S. in Computer Science, National Tsing Hua University']
            ],
        ]);

        // Test accessing JSON fields
        $name = $teacher->name;
        $expertise = $teacher->expertise;
        $education = $teacher->education;

        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds

        $this->assertIsArray($name);
        $this->assertIsArray($expertise);
        $this->assertIsArray($education);

        // Assert JSON operations time is under 100ms
        $this->assertLessThan(100, $executionTime,
            "JSON field operations took {$executionTime}ms, which exceeds 100ms limit");
    }
}
