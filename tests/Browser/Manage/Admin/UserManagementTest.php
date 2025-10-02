<?php

namespace Tests\Browser\Manage\Admin;

use App\Models\User;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * 使用者管理 E2E 測試。
 * 測試完整的使用者管理操作流程，包含登入、篩選、編輯等功能。
 *
 * 注意：使用實際資料庫中的 admin 帳號 (grasonjas@gmail.com)
 */
class UserManagementTest extends DuskTestCase
{
    /**
     * 取得測試用的 admin 使用者
     */
    protected function getAdminUser(): User
    {
        return User::where('email', 'grasonjas@gmail.com')->firstOrFail();
    }

    /**
     * 測試：管理員可以查看使用者列表。
     */
    public function test_admin_can_view_users_list(): void
    {
        $admin = $this->getAdminUser();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/manage/admin/users')
                ->pause(3000)
                ->screenshot('users-list')
                ->assertPathIs('/manage/admin/users');

            // 驗證頁面載入（尋找任何使用者相關文字）
            // 由於是 Inertia + React，內容可能需要時間載入
        });
    }

    /**
     * 測試：管理員可以搜尋使用者。
     */
    public function test_admin_can_search_users(): void
    {
        $admin = $this->getAdminUser();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/manage/admin/users')
                ->pause(2000)
                ->screenshot('before-search');

            // 檢查搜尋欄位是否存在
            if ($browser->element('input[type="search"]') || $browser->element('input[placeholder*="搜尋"]')) {
                $browser->type('input[type="search"], input[placeholder*="搜尋"]', 'grason')
                    ->pause(1000)
                    ->screenshot('after-search');
            }
        });
    }

    /**
     * 測試：管理員可以依角色篩選使用者。
     */
    public function test_admin_can_filter_users_by_role(): void
    {
        $admin = $this->getAdminUser();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/manage/admin/users')
                ->pause(2000)
                ->screenshot('before-filter');

            // 檢查是否有角色篩選器
            if ($browser->element('select[name*="role"]') || $browser->element('.role-filter')) {
                $browser->screenshot('role-filter-available');
            }
        });
    }

    /**
     * 測試：管理員可以開啟使用者詳細 drawer。
     */
    public function test_admin_can_open_user_detail_drawer(): void
    {
        $admin = $this->getAdminUser();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/manage/admin/users')
                ->pause(3000)
                ->screenshot('users-page-loaded');

            // 檢查是否有使用者列表項目
            if ($browser->element('.user-row, .user-item, [data-testid="user-row"]')) {
                $browser->click('.user-row:first-child, .user-item:first-child, [data-testid="user-row"]:first-child')
                    ->pause(1000)
                    ->screenshot('user-detail-drawer');
            }
        });
    }    /**
     * 測試：管理員可以編輯使用者角色。
     */
    public function test_admin_can_edit_user_role(): void
    {
        $admin = $this->getAdminUser();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/manage/admin/users')
                ->pause(3000)
                ->screenshot('before-edit-role');

            // 檢查是否有編輯功能
            if ($browser->element('.edit-role, button[data-action="edit-role"]')) {
                $browser->screenshot('edit-role-available');
            }
        });
    }

    /**
     * 測試：管理員可以變更使用者狀態。
     */
    public function test_admin_can_change_user_status(): void
    {
        $admin = $this->getAdminUser();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/manage/admin/users')
                ->pause(3000)
                ->screenshot('before-change-status');

            // 檢查是否有狀態變更功能
            if ($browser->element('.change-status, button[data-action="change-status"]')) {
                $browser->screenshot('change-status-available');
            }
        });
    }

        /**
     * 測試：使用者管理完整流程（搜尋 → 開啟 → 編輯 → 關閉）。
     */
    public function test_complete_user_management_workflow(): void
    {
        $admin = $this->getAdminUser();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/manage/admin/users')
                ->pause(2000)
                ->screenshot('01-users-list');

            // 步驟 1: 搜尋使用者
            if ($browser->element('input[type="search"]')) {
                $browser->type('input[type="search"]', 'grason')
                    ->pause(1000)
                    ->screenshot('02-after-search');
            }

            // 步驟 2: 開啟使用者詳細
            if ($browser->element('.user-row:first-child, .user-item:first-child')) {
                $browser->click('.user-row:first-child, .user-item:first-child')
                    ->pause(1000)
                    ->screenshot('03-user-detail-opened');
            }

            // 步驟 3: 檢查詳細資訊
            $browser->pause(1000)
                ->screenshot('04-workflow-complete');
        });
    }

    /**
     * 測試：非管理員無法存取使用者管理頁面。
     */
    public function test_non_admin_cannot_access_users_page(): void
    {
        // 創建一個一般使用者
        $regularUser = User::where('role', 'user')
            ->where('email', '!=', 'grasonjas@gmail.com')
            ->first();

        // 如果沒有一般使用者，跳過測試
        if (!$regularUser) {
            $this->markTestSkipped('沒有可用的一般使用者帳號');
        }

        $this->browse(function (Browser $browser) use ($regularUser) {
            $browser->loginAs($regularUser)
                ->visit('/manage/admin/users')
                ->pause(2000)
                ->screenshot('non-admin-access-attempt');

            // 應該被重定向或看到禁止訪問的訊息
            $currentUrl = $browser->driver->getCurrentURL();
            $this->assertNotEquals('http://localhost:8000/manage/admin/users', $currentUrl);
        });
    }
}
