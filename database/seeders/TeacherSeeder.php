<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Teacher;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = [
            [
                'name' => ['zh-TW' => '王志明', 'en' => 'Chih-Ming Wang'],
                'title' => ['zh-TW' => '教授', 'en' => 'Professor'],
                'email' => 'chihming.wang@csie.example.edu',
                'phone' => '04-2345-7001',
                'office' => 'IB501',
                'bio' => [
                    'zh-TW' => '專精於人工智慧與機器學習領域，發表多篇國際期刊論文。',
                    'en' => 'Specializes in artificial intelligence and machine learning, with numerous international journal publications.'
                ],
                'expertise' => [
                    'zh-TW' => ['人工智慧', '機器學習', '深度學習'],
                    'en' => ['Artificial Intelligence', 'Machine Learning', 'Deep Learning']
                ],
                'education' => [
                    'zh-TW' => ['美國史丹佛大學電腦科學博士', '台灣大學資訊工程碩士'],
                    'en' => ['Ph.D. in Computer Science, Stanford University, USA', 'M.S. in Computer Science and Information Engineering, National Taiwan University']
                ],
                'sort_order' => 1,
                'visible' => true,
            ],
            [
                'name' => ['zh-TW' => '陳美玲', 'en' => 'Mei-Ling Chen'],
                'title' => ['zh-TW' => '副教授', 'en' => 'Associate Professor'],
                'email' => 'meiling.chen@csie.example.edu',
                'phone' => '04-2345-7002',
                'office' => 'IB502',
                'bio' => [
                    'zh-TW' => '專長於軟體工程、系統設計與開發流程優化。',
                    'en' => 'Expertise in software engineering, system design, and development process optimization.'
                ],
                'expertise' => [
                    'zh-TW' => ['軟體工程', '系統設計', '開發流程'],
                    'en' => ['Software Engineering', 'System Design', 'Development Process']
                ],
                'education' => [
                    'zh-TW' => ['美國加州大學柏克萊分校電腦科學博士', '清華大學資訊科學碩士'],
                    'en' => ['Ph.D. in Computer Science, UC Berkeley, USA', 'M.S. in Computer Science, National Tsing Hua University']
                ],
                'sort_order' => 2,
                'visible' => true,
            ],
            [
                'name' => ['zh-TW' => '李建華', 'en' => 'Jian-Hua Li'],
                'title' => ['zh-TW' => '助理教授', 'en' => 'Assistant Professor'],
                'email' => 'jianhua.li@csie.example.edu',
                'phone' => '04-2345-7003',
                'office' => 'IB503',
                'bio' => [
                    'zh-TW' => '研究重點為網路安全、密碼學與資訊安全。',
                    'en' => 'Research focuses on network security, cryptography, and information security.'
                ],
                'expertise' => [
                    'zh-TW' => ['網路安全', '密碼學', '資訊安全'],
                    'en' => ['Network Security', 'Cryptography', 'Information Security']
                ],
                'education' => [
                    'zh-TW' => ['美國麻省理工學院電腦科學博士', '台灣大學電機工程碩士'],
                    'en' => ['Ph.D. in Computer Science, MIT, USA', 'M.S. in Electrical Engineering, National Taiwan University']
                ],
                'sort_order' => 3,
                'visible' => true,
            ],
            [
                'name' => ['zh-TW' => '張雅雯', 'en' => 'Ya-Wen Chang'],
                'title' => ['zh-TW' => '教授', 'en' => 'Professor'],
                'email' => 'yawen.chang@csie.example.edu',
                'phone' => '04-2345-7004',
                'office' => 'IB504',
                'bio' => [
                    'zh-TW' => '專精於資料庫系統、大數據分析與雲端運算。',
                    'en' => 'Specializes in database systems, big data analytics, and cloud computing.'
                ],
                'expertise' => [
                    'zh-TW' => ['資料庫系統', '大數據分析', '雲端運算'],
                    'en' => ['Database Systems', 'Big Data Analytics', 'Cloud Computing']
                ],
                'education' => [
                    'zh-TW' => ['美國卡內基美隆大學電腦科學博士', '交通大學資訊科學碩士'],
                    'en' => ['Ph.D. in Computer Science, Carnegie Mellon University, USA', 'M.S. in Computer Science, National Chiao Tung University']
                ],
                'sort_order' => 4,
                'visible' => true,
            ],
            [
                'name' => ['zh-TW' => '劉國峰', 'en' => 'Guo-Feng Liu'],
                'title' => ['zh-TW' => '副教授', 'en' => 'Associate Professor'],
                'email' => 'guofeng.liu@csie.example.edu',
                'phone' => '04-2345-7005',
                'office' => 'IB505',
                'bio' => [
                    'zh-TW' => '研究領域包括人機介面、多媒體系統與遊戲設計。',
                    'en' => 'Research areas include human-computer interaction, multimedia systems, and game design.'
                ],
                'expertise' => [
                    'zh-TW' => ['人機介面', '多媒體系統', '遊戲設計'],
                    'en' => ['Human-Computer Interaction', 'Multimedia Systems', 'Game Design']
                ],
                'education' => [
                    'zh-TW' => ['美國華盛頓大學電腦科學博士', '成功大學資訊工程碩士'],
                    'en' => ['Ph.D. in Computer Science, University of Washington, USA', 'M.S. in Computer Science and Information Engineering, National Cheng Kung University']
                ],
                'sort_order' => 5,
                'visible' => true,
            ],
        ];

        foreach ($teachers as $teacherData) {
            Teacher::create($teacherData);
        }
    }
}
