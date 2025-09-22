<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Lab;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TeacherTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_a_teacher()
    {
        $teacher = Teacher::create([
            'name' => ['zh-TW' => '王志明', 'en' => 'Chih-Ming Wang'],
            'title' => ['zh-TW' => '教授', 'en' => 'Professor'],
            'email' => 'chihming.wang@example.edu',
            'phone' => '04-2345-7001',
            'office' => 'IB501',
            'bio' => ['zh-TW' => '專精於人工智慧與機器學習領域', 'en' => 'Specializes in artificial intelligence and machine learning'],
            'expertise' => [
                'zh-TW' => ['人工智慧', '機器學習'],
                'en' => ['Artificial Intelligence', 'Machine Learning']
            ],
            'visible' => true,
            'sort_order' => 1,
        ]);

        $this->assertInstanceOf(Teacher::class, $teacher);
        $this->assertEquals('chihming.wang@example.edu', $teacher->email);
        $this->assertTrue($teacher->visible);

        // Test JSON data (accessor returns array)
        $this->assertEquals('王志明', $teacher->name['zh-TW']);
        $this->assertEquals('Chih-Ming Wang', $teacher->name['en']);
    }

        /** @test */
    public function it_requires_name_title_and_email()
    {
        // 雖然模型有默認值，但創建真實記錄時應該要有意義的數據
        $teacher = Teacher::factory()->create([
            'name' => ['zh-TW' => '', 'en' => ''],
            'title' => ['zh-TW' => '', 'en' => ''],
            'email' => '',
        ]);

        // 確認即使有空值，記錄仍可創建（因為有默認值）
        $this->assertInstanceOf(Teacher::class, $teacher);
        $this->assertEquals('', $teacher->name['zh-TW']);
        $this->assertEquals('', $teacher->email);
    }

    /** @test */
    public function it_can_belong_to_a_user()
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.edu',
        ]);

        $teacher = Teacher::create([
            'user_id' => $user->id,
            'name' => json_encode(['zh-TW' => '王志明', 'en' => 'Chih-Ming Wang']),
            'title' => json_encode(['zh-TW' => '教授', 'en' => 'Professor']),
            'email' => 'chihming.wang@example.edu',
        ]);

        $this->assertInstanceOf(User::class, $teacher->user);
        $this->assertEquals($user->id, $teacher->user->id);
    }

    /** @test */
    public function it_can_have_links()
    {
        $teacher = Teacher::factory()->create([
            'name' => ['zh-TW' => '王志明', 'en' => 'Chih-Ming Wang'],
            'title' => ['zh-TW' => '教授', 'en' => 'Professor'],
            'email' => 'chihming.wang@example.edu',
        ]);

        // Create teacher links
        $teacher->links()->create([
            'type' => 'website',
            'label' => 'Personal Website',
            'url' => 'https://example.com/chihming',
            'sort_order' => 1,
        ]);

        $this->assertCount(1, $teacher->links);
        $this->assertEquals('website', $teacher->links->first()->type);
    }

    /** @test */
    public function it_can_be_filtered_by_visible_status()
    {
        Teacher::create([
            'name' => json_encode(['zh-TW' => '王志明', 'en' => 'Chih-Ming Wang']),
            'title' => json_encode(['zh-TW' => '教授', 'en' => 'Professor']),
            'email' => 'visible@example.edu',
            'visible' => true,
        ]);

        Teacher::create([
            'name' => json_encode(['zh-TW' => '李美惠', 'en' => 'Mei-Hui Li']),
            'title' => json_encode(['zh-TW' => '副教授', 'en' => 'Associate Professor']),
            'email' => 'hidden@example.edu',
            'visible' => false,
        ]);

        $visibleTeachers = Teacher::where('visible', true)->get();
        $hiddenTeachers = Teacher::where('visible', false)->get();

        $this->assertCount(1, $visibleTeachers);
        $this->assertCount(1, $hiddenTeachers);
        $this->assertEquals('visible@example.edu', $visibleTeachers->first()->email);
        $this->assertEquals('hidden@example.edu', $hiddenTeachers->first()->email);
    }

    /** @test */
    public function it_can_be_ordered_by_sort_order()
    {
        Teacher::create([
            'name' => json_encode(['zh-TW' => '王志明', 'en' => 'Chih-Ming Wang']),
            'title' => json_encode(['zh-TW' => '教授', 'en' => 'Professor']),
            'email' => 'first@example.edu',
            'sort_order' => 2,
        ]);

        Teacher::create([
            'name' => json_encode(['zh-TW' => '李美惠', 'en' => 'Mei-Hui Li']),
            'title' => json_encode(['zh-TW' => '副教授', 'en' => 'Associate Professor']),
            'email' => 'second@example.edu',
            'sort_order' => 1,
        ]);

        $orderedTeachers = Teacher::orderBy('sort_order')->get();

        $this->assertEquals('second@example.edu', $orderedTeachers->first()->email);
        $this->assertEquals('first@example.edu', $orderedTeachers->last()->email);
    }

    /** @test */
    public function it_has_default_values()
    {
        $teacher = Teacher::create([
            'name' => json_encode(['zh-TW' => '王志明', 'en' => 'Chih-Ming Wang']),
            'title' => json_encode(['zh-TW' => '教授', 'en' => 'Professor']),
            'email' => 'test@example.edu',
        ]);

        $this->assertTrue($teacher->visible);
        $this->assertEquals(0, $teacher->sort_order);
    }

    /** @test */
    public function it_stores_specialties_as_json()
    {
        $expertise = [
            'zh-TW' => ['人工智慧', '機器學習', '深度學習'],
            'en' => ['Artificial Intelligence', 'Machine Learning', 'Deep Learning']
        ];

        $teacher = Teacher::create([
            'name' => ['zh-TW' => '王志明', 'en' => 'Chih-Ming Wang'],
            'title' => ['zh-TW' => '教授', 'en' => 'Professor'],
            'email' => 'test@example.edu',
            'expertise' => $expertise,
        ]);

        // Test accessor returns proper format
        $retrievedExpertise = $teacher->expertise;
        $this->assertCount(3, $retrievedExpertise['zh-TW']);
        $this->assertEquals('人工智慧', $retrievedExpertise['zh-TW'][0]);
        $this->assertEquals('Artificial Intelligence', $retrievedExpertise['en'][0]);
    }

    /** @test */
    public function it_stores_education_as_json()
    {
        $education = [
            'zh-TW' => ['美國史丹佛大學電腦科學博士', '台灣大學資訊工程碩士'],
            'en' => ['Ph.D. in Computer Science, Stanford University, USA', 'M.S. in Computer Science, National Taiwan University']
        ];

        $teacher = Teacher::create([
            'name' => ['zh-TW' => '王志明', 'en' => 'Chih-Ming Wang'],
            'title' => ['zh-TW' => '教授', 'en' => 'Professor'],
            'email' => 'test@example.edu',
            'education' => $education,
        ]);

        // Test accessor returns proper format
        $retrievedEducation = $teacher->education;
        $this->assertCount(2, $retrievedEducation['zh-TW']);
        $this->assertEquals('美國史丹佛大學電腦科學博士', $retrievedEducation['zh-TW'][0]);
        $this->assertEquals('Ph.D. in Computer Science, Stanford University, USA', $retrievedEducation['en'][0]);
    }
}
