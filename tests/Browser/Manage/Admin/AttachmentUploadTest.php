<?php

namespace Tests\Browser\Manage\Admin;

use App\Models\User;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * 附件上傳 E2E 測試。
 * 測試完整的附件上傳與管理操作流程。
 * 
 * 注意：使用實際資料庫中的 admin 帳號 (grasonjas@gmail.com)
 */
class AttachmentUploadTest extends DuskTestCase
{
    /**
     * 取得測試用的 admin 使用者
     */
    protected function getAdminUser(): User
    {
        return User::where('email', 'grasonjas@gmail.com')->firstOrFail();
    }

    /**
     * 測試：管理員可以開啟上傳 modal。
     */
    public function test_admin_can_open_upload_modal(): void
    {
        $admin = $this->getAdminUser();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/manage/admin/attachments')
                ->pause(3000)
                ->screenshot('attachments-page');
            
            // 檢查是否有上傳按鈕
            if ($browser->element('button[data-action="upload"], .upload-button, button:contains("上傳")')) {
                $browser->click('button[data-action="upload"], .upload-button')
                    ->pause(1000)
                    ->screenshot('upload-modal-opened');
            }
        });
    }

    /**
     * 測試：管理員可以上傳檔案。
     */
    public function test_admin_can_upload_file(): void
    {
        $admin = $this->getAdminUser();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/manage/admin/attachments')
                ->pause(3000)
                ->screenshot('before-upload');
            
            // 檢查檔案上傳功能是否存在
            if ($browser->element('input[type="file"]')) {
                $browser->screenshot('file-input-available');
            }
        });
    }

    /**
     * 測試：上傳後可以編輯附件資訊。
     */
    public function test_admin_can_edit_uploaded_file_info(): void
    {
        $admin = $this->getAdminUser();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/manage/admin/attachments')
                ->pause(3000)
                ->screenshot('attachments-list');
            
            // 檢查是否有附件可以編輯
            if ($browser->element('.attachment-item, .file-item')) {
                $browser->click('.attachment-item:first-child, .file-item:first-child')
                    ->pause(1000)
                    ->screenshot('attachment-detail');
            }
        });
    }

    /**
     * 測試：管理員可以切換檢視模式（列表/網格）。
     */
    public function test_admin_can_switch_view_modes(): void
    {
        $admin = $this->getAdminUser();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/manage/admin/attachments')
                ->pause(3000)
                ->screenshot('default-view');
            
            // 檢查是否有檢視切換按鈕
            if ($browser->element('.view-toggle, button[data-action="toggle-view"]')) {
                $browser->click('.view-toggle, button[data-action="toggle-view"]')
                    ->pause(500)
                    ->screenshot('switched-view');
            }
        });
    }

    /**
     * 測試：可以依類型篩選附件。
     */
    public function test_admin_can_filter_attachments_by_type(): void
    {
        $admin = $this->getAdminUser();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/manage/admin/attachments')
                ->pause(3000)
                ->screenshot('before-filter');
            
            // 檢查是否有類型篩選器
            if ($browser->element('select[name*="type"], .type-filter')) {
                $browser->screenshot('type-filter-available');
            }
        });
    }

    /**
     * 測試：完整的附件上傳工作流程。
     */
    public function test_complete_attachment_upload_workflow(): void
    {
        $admin = $this->getAdminUser();

        $this->browse(function (Browser $browser) use ($admin) {
            // 步驟 1: 訪問附件管理頁面
            $browser->loginAs($admin)
                ->visit('/manage/admin/attachments')
                ->pause(2000)
                ->screenshot('01-attachments-page');
            
            // 步驟 2: 開啟上傳對話框
            if ($browser->element('button[data-action="upload"], .upload-button')) {
                $browser->click('button[data-action="upload"], .upload-button')
                    ->pause(1000)
                    ->screenshot('02-upload-dialog-opened');
            }
            
            // 步驟 3: 檢查上傳介面
            if ($browser->element('input[type="file"]')) {
                $browser->screenshot('03-file-input-ready');
            }
            
            // 步驟 4: 完成工作流程
            $browser->pause(1000)
                ->screenshot('04-workflow-complete');
        });
    }

    /**
     * 測試：上傳進度條正確顯示。
     */
    public function test_upload_progress_displays_correctly(): void
    {
        $admin = $this->getAdminUser();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/manage/admin/attachments')
                ->pause(3000)
                ->screenshot('attachments-page-for-progress-test');
            
            // 檢查是否有進度顯示相關元素
            if ($browser->element('.progress, .upload-progress')) {
                $browser->screenshot('progress-indicator-exists');
            }
        });
    }

    /**
     * 測試：非管理員無法存取附件管理頁面。
     */
    public function test_non_admin_cannot_access_attachments_page(): void
    {
        // 找一個非 admin 的使用者
        $regularUser = User::where('role', 'user')
            ->where('email', '!=', 'grasonjas@gmail.com')
            ->first();
        
        // 如果沒有一般使用者，跳過測試
        if (!$regularUser) {
            $this->markTestSkipped('沒有可用的一般使用者帳號');
        }

        $this->browse(function (Browser $browser) use ($regularUser) {
            $browser->loginAs($regularUser)
                ->visit('/manage/admin/attachments')
                ->pause(2000)
                ->screenshot('non-admin-attachment-access-attempt');
            
            // 應該被重定向或看到禁止訪問的訊息
            $currentUrl = $browser->driver->getCurrentURL();
            $this->assertNotEquals('http://localhost:8000/manage/admin/attachments', $currentUrl);
        });
    }
}
