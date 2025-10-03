<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $tags = [
            // 學術類（context = academic）
            ['name' => '機器學習', 'slug' => 'machine-learning', 'context' => 'academic', 'color' => '#3B82F6'],
            ['name' => '深度學習', 'slug' => 'deep-learning', 'context' => 'academic', 'color' => '#8B5CF6'],
            ['name' => '人工智慧', 'slug' => 'artificial-intelligence', 'context' => 'academic', 'color' => '#06B6D4'],
            ['name' => '資料科學', 'slug' => 'data-science', 'context' => 'academic', 'color' => '#10B981'],
            ['name' => '計算機視覺', 'slug' => 'computer-vision', 'context' => 'academic', 'color' => '#F59E0B'],
            ['name' => '自然語言處理', 'slug' => 'nlp', 'context' => 'academic', 'color' => '#EF4444'],
            ['name' => '網路安全', 'slug' => 'cybersecurity', 'context' => 'academic', 'color' => '#DC2626'],
            ['name' => '雲端運算', 'slug' => 'cloud-computing', 'context' => 'academic', 'color' => '#0EA5E9'],
            ['name' => '物聯網', 'slug' => 'iot', 'context' => 'academic', 'color' => '#14B8A6'],
            ['name' => '區塊鏈', 'slug' => 'blockchain', 'context' => 'academic', 'color' => '#F97316'],

            // 課程類（context = course）
            ['name' => '必修課程', 'slug' => 'required-course', 'context' => 'course', 'color' => '#DC2626'],
            ['name' => '選修課程', 'slug' => 'elective-course', 'context' => 'course', 'color' => '#059669'],
            ['name' => '碩士課程', 'slug' => 'master-course', 'context' => 'course', 'color' => '#7C3AED'],
            ['name' => '博士課程', 'slug' => 'phd-course', 'context' => 'course', 'color' => '#DB2777'],
            ['name' => '實驗課程', 'slug' => 'lab-course', 'context' => 'course', 'color' => '#EA580C'],
            ['name' => '專題研究', 'slug' => 'research-seminar', 'context' => 'course', 'color' => '#2563EB'],

            // 活動類（context = event）
            ['name' => '學術研討會', 'slug' => 'academic-conference', 'context' => 'event', 'color' => '#7C3AED'],
            ['name' => '工作坊', 'slug' => 'workshop', 'context' => 'event', 'color' => '#0891B2'],
            ['name' => '演講', 'slug' => 'lecture', 'context' => 'event', 'color' => '#DB2777'],
            ['name' => '競賽', 'slug' => 'competition', 'context' => 'event', 'color' => '#DC2626'],
            ['name' => '展覽', 'slug' => 'exhibition', 'context' => 'event', 'color' => '#059669'],

            // 行政類（context = admin）
            ['name' => '重要公告', 'slug' => 'important', 'context' => 'admin', 'color' => '#DC2626'],
            ['name' => '系務公告', 'slug' => 'department', 'context' => 'admin', 'color' => '#0891B2'],
            ['name' => '獎學金', 'slug' => 'scholarship', 'context' => 'admin', 'color' => '#F59E0B'],
            ['name' => '徵才資訊', 'slug' => 'recruitment', 'context' => 'admin', 'color' => '#10B981'],
            ['name' => '設備維護', 'slug' => 'maintenance', 'context' => 'admin', 'color' => '#6B7280'],
        ];

        foreach ($tags as $tag) {
            // 需要加上 name_en 和 is_active
            $tag['name_en'] = ucwords(str_replace('-', ' ', $tag['slug']));
            $tag['is_active'] = true;

            Tag::firstOrCreate(
                ['slug' => $tag['slug'], 'context' => $tag['context']],
                $tag
            );
        }

        $this->command->info('Tags seeded successfully!');
    }
}
