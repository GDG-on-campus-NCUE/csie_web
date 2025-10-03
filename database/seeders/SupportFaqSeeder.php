<?php

namespace Database\Seeders;

use App\Models\SupportFaq;
use Illuminate\Database\Seeder;

class SupportFaqSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $faqs = [
            // 帳號相關
            [
                'category' => 'account',
                'question' => '如何重設密碼？',
                'answer' => '您可以在登入頁面點擊「忘記密碼」連結，輸入您的電子郵件地址，系統將會發送重設密碼的連結到您的信箱。',
                'sort_order' => 1,
            ],
            [
                'category' => 'account',
                'question' => '如何更新個人資料？',
                'answer' => '登入後，請到「個人設定」→「個人資料」頁面，即可編輯您的姓名、聯絡資訊等個人資料。',
                'sort_order' => 2,
            ],
            [
                'category' => 'account',
                'question' => '如何變更電子郵件地址？',
                'answer' => '目前電子郵件地址無法自行更改，若需變更請聯繫系統管理員。',
                'sort_order' => 3,
            ],

            // 技術問題
            [
                'category' => 'technical',
                'question' => '無法上傳檔案怎麼辦？',
                'answer' => '請確認檔案大小不超過 10MB，且檔案格式為系統支援的格式（PDF、DOC、DOCX、JPG、PNG）。如問題持續，請清除瀏覽器快取後重試。',
                'sort_order' => 1,
            ],
            [
                'category' => 'technical',
                'question' => '為什麼看不到某些內容？',
                'answer' => '可能是權限設定問題，請確認您有足夠的權限存取該內容。若問題持續，請聯繫系統管理員。',
                'sort_order' => 2,
            ],
            [
                'category' => 'technical',
                'question' => '系統回應速度很慢怎麼辦？',
                'answer' => '建議使用最新版本的 Chrome、Firefox 或 Safari 瀏覽器。清除瀏覽器快取和 Cookie 也可能有助於改善速度。',
                'sort_order' => 3,
            ],

            // 功能說明
            [
                'category' => 'feature',
                'question' => '如何建立新公告？',
                'answer' => '教師與管理員可在「管理後台」→「公告管理」→「新增公告」建立新公告。填寫標題、內容、分類等資訊後即可發布。',
                'sort_order' => 1,
            ],
            [
                'category' => 'feature',
                'question' => '什麼是 Space 資源綁定？',
                'answer' => 'Space 代表實驗室、研究計畫或課程等資源空間。綁定後可以存取該空間的相關資料和檔案。',
                'sort_order' => 2,
            ],
            [
                'category' => 'feature',
                'question' => '如何加入實驗室？',
                'answer' => '請聯繫實驗室負責教師，由教師在實驗室管理頁面新增您為成員。',
                'sort_order' => 3,
            ],
            [
                'category' => 'feature',
                'question' => '如何使用標籤系統？',
                'answer' => '標籤可以幫助分類和搜尋內容。在建立公告或內容時，可以選擇現有標籤或建立新標籤。',
                'sort_order' => 4,
            ],

            // 其他
            [
                'category' => 'other',
                'question' => '系統維護時間是什麼時候？',
                'answer' => '系統通常在每週日凌晨 2:00-4:00 進行定期維護，維護期間可能無法存取系統。',
                'sort_order' => 1,
            ],
            [
                'category' => 'other',
                'question' => '如何聯繫技術支援？',
                'answer' => '您可以在「支援」頁面建立工單，或寄送電子郵件至 support@csie.example.com。',
                'sort_order' => 2,
            ],
            [
                'category' => 'other',
                'question' => '系統支援哪些瀏覽器？',
                'answer' => '系統支援最新版本的 Chrome、Firefox、Safari 及 Edge 瀏覽器。建議使用 Chrome 以獲得最佳體驗。',
                'sort_order' => 3,
            ],
        ];

        foreach ($faqs as $faq) {
            SupportFaq::firstOrCreate(
                [
                    'category' => $faq['category'],
                    'question' => $faq['question'],
                ],
                array_merge($faq, [
                    'status' => SupportFaq::STATUS_PUBLISHED,
                    'views' => rand(10, 500),
                ])
            );
        }

        $this->command->info('Support FAQs seeded successfully!');
    }
}
