<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Staff;

class StaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $staffMembers = [
            [
                'name' => '張雅婷',
                'name_en' => 'Ya-Ting Chang',
                'position' => '系辦助理',
                'position_en' => 'Department Assistant',
                'email' => 'yating.chang@csie.example.edu',
                'phone' => '04-2345-6789',
                'bio' => '負責系務行政工作，包含學生事務處理、文件管理等。',
                'bio_en' => 'Responsible for departmental administrative work, including student affairs processing and document management.',
                'visible' => true,
                'sort_order' => 1,
            ],
            [
                'name' => '李志明',
                'name_en' => 'Chih-Ming Lee',
                'position' => '資訊管理員',
                'position_en' => 'IT Administrator',
                'email' => 'chihming.lee@csie.example.edu',
                'phone' => '04-2345-6790',
                'bio' => '維護系上資訊設備，管理網路與伺服器環境。',
                'bio_en' => 'Maintains departmental IT equipment and manages network and server environments.',
                'visible' => true,
                'sort_order' => 2,
            ],
            [
                'name' => '王美惠',
                'name_en' => 'Mei-Hui Wang',
                'position' => '會計助理',
                'position_en' => 'Accounting Assistant',
                'email' => 'meihui.wang@csie.example.edu',
                'phone' => '04-2345-6791',
                'bio' => '處理系所財務相關事務，包含經費管理和報帳作業。',
                'bio_en' => 'Handles departmental financial affairs, including budget management and reimbursement procedures.',
                'visible' => true,
                'sort_order' => 3,
            ],
            [
                'name' => '陳建華',
                'name_en' => 'Chien-Hua Chen',
                'position' => '實驗室管理員',
                'position_en' => 'Laboratory Manager',
                'email' => 'chienhua.chen@csie.example.edu',
                'phone' => '04-2345-6792',
                'bio' => '管理實驗室設備，協助教學與研究相關事務。',
                'bio_en' => 'Manages laboratory equipment and assists with teaching and research-related matters.',
                'visible' => true,
                'sort_order' => 4,
            ],
            [
                'name' => '劉淑芬',
                'name_en' => 'Shu-Fen Liu',
                'position' => '圖書管理員',
                'position_en' => 'Library Administrator',
                'email' => 'shufen.liu@csie.example.edu',
                'phone' => '04-2345-6793',
                'bio' => '管理系所圖書資源，協助師生查詢相關資料。',
                'bio_en' => 'Manages departmental library resources and assists faculty and students with research materials.',
                'visible' => true,
                'sort_order' => 5,
            ],
        ];

        foreach ($staffMembers as $staffData) {
            Staff::create($staffData);
        }
    }
}
