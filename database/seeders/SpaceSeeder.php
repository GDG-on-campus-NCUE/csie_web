<?php

namespace Database\Seeders;

use App\Models\Space;
use Illuminate\Database\Seeder;

class SpaceSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $spaces = [
            // space_type: 1=研究室、2=實驗室、3=教室
            [
                'code' => 'AI-LAB',
                'space_type' => 2,
                'name' => '人工智慧實驗室',
                'name_en' => 'AI Laboratory',
                'description' => '專注於機器學習、深度學習及人工智慧相關研究',
                'visible' => true,
            ],
            [
                'code' => 'CV-LAB',
                'space_type' => 2,
                'name' => '電腦視覺實驗室',
                'name_en' => 'Computer Vision Laboratory',
                'description' => '影像處理、物體辨識、3D 重建等研究',
                'visible' => true,
            ],
            [
                'code' => 'NLP-LAB',
                'space_type' => 2,
                'name' => '自然語言處理實驗室',
                'name_en' => 'NLP Laboratory',
                'description' => '文字探勘、機器翻譯、對話系統等研究',
                'visible' => true,
            ],
            [
                'code' => 'SECURITY-LAB',
                'space_type' => 2,
                'name' => '資訊安全實驗室',
                'name_en' => 'Security Laboratory',
                'description' => '網路安全、密碼學、資安攻防研究',
                'visible' => true,
            ],
            [
                'code' => 'HCI-LAB',
                'space_type' => 2,
                'name' => '人機互動實驗室',
                'name_en' => 'HCI Laboratory',
                'description' => '使用者介面設計、AR/VR、互動設計研究',
                'visible' => true,
            ],
            [
                'code' => 'CLOUD-ROOM',
                'space_type' => 1,
                'name' => '雲端運算研究室',
                'name_en' => 'Cloud Computing Lab',
                'description' => '分散式系統、雲端架構、容器化技術研究',
                'visible' => true,
            ],
            [
                'code' => 'DATA-ROOM',
                'space_type' => 1,
                'name' => '資料科學研究室',
                'name_en' => 'Data Science Lab',
                'description' => '大數據分析、資料視覺化、統計學習研究',
                'visible' => true,
            ],
            [
                'code' => 'IOT-LAB',
                'space_type' => 2,
                'name' => '物聯網實驗室',
                'name_en' => 'IoT Laboratory',
                'description' => '物聯網系統、感測器網路、嵌入式系統研究',
                'visible' => true,
            ],
            [
                'code' => 'CLASSROOM-501',
                'space_type' => 3,
                'name' => '501 教室',
                'name_en' => 'Classroom 501',
                'location' => '資訊系館 5F',
                'capacity' => 60,
                'description' => '多媒體教學教室',
                'visible' => true,
            ],
            [
                'code' => 'CLASSROOM-502',
                'space_type' => 3,
                'name' => '502 教室',
                'name_en' => 'Classroom 502',
                'location' => '資訊系館 5F',
                'capacity' => 40,
                'description' => '小型討論教室',
                'visible' => true,
            ],
        ];

        foreach ($spaces as $space) {
            Space::firstOrCreate(
                ['code' => $space['code']],
                $space
            );
        }

        $this->command->info('Spaces seeded successfully!');
    }
}
