# 🧪 Laravel Dusk E2E 測試指南

## 📋 目錄

- [環境配置](#環境配置)
- [快速開始](#快速開始)
- [測試覆蓋範圍](#測試覆蓋範圍)
- [測試執行](#測試執行)
- [測試結果](#測試結果)
- [技術實作](#技術實作)
- [常見問題](#常見問題)
- [維護指南](#維護指南)

---

## 環境配置

### 系統需求

- **PHP:** 8.2+
- **Laravel:** 11.x
- **Laravel Dusk:** 8.3.3
- **Chrome/Chromium:** 140.0.7339.207
- **ChromeDriver:** 140
- **Node.js:** 20+ (前端編譯)

### 安裝步驟

#### 1. 安裝 Laravel Dusk

```bash
composer require --dev laravel/dusk
php artisan dusk:install
```

#### 2. 安裝 ChromeDriver

```bash
php artisan dusk:chrome-driver 140
```

#### 3. 安裝 Chromium 瀏覽器

```bash
sudo apt-get update
sudo apt-get install -y chromium-browser
```

#### 4. 配置測試環境

創建 `.env.dusk.local` 文件：

```env
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/html/csie_fk/database/database.sqlite

SESSION_DRIVER=cookie
SESSION_DOMAIN=localhost
SESSION_SECURE_COOKIE=false

SANCTUM_STATEFUL_DOMAINS=localhost:8000
```

#### 5. 配置 DuskTestCase

`tests/DuskTestCase.php` 已配置為使用 Headless Chrome：

```php
protected function driver(): RemoteWebDriver
{
    $options = (new ChromeOptions)->addArguments([
        '--window-size=1920,1080',
        '--disable-search-engine-choice-screen',
        '--headless=new',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--remote-debugging-port=9222',
    ]);

    return RemoteWebDriver::create(
        'http://localhost:9515',
        DesiredCapabilities::chrome()->setCapability(
            ChromeOptions::CAPABILITY, $options
        ),
        300000,  // 連線超時 5 分鐘
        300000   // 請求超時 5 分鐘
    );
}
```

---

## 快速開始

### 1. 啟動應用程式

```bash
# 在第一個終端
php artisan serve
```

### 2. 執行所有測試

```bash
# 在第二個終端
php artisan dusk
```

### 3. 執行特定測試套件

```bash
# 使用者管理測試
php artisan dusk tests/Browser/Manage/Admin/UserManagementTest.php

# 附件上傳測試
php artisan dusk tests/Browser/Manage/Admin/AttachmentUploadTest.php
```

### 4. 執行單一測試

```bash
php artisan dusk --filter=test_admin_can_view_users_list
```

---

## 測試覆蓋範圍

### 📁 使用者管理測試 (UserManagementTest.php)

**測試檔案：** `tests/Browser/Manage/Admin/UserManagementTest.php`

| 測試案例 | 狀態 | 說明 |
|---------|------|------|
| test_admin_can_view_users_list | ✅ | 管理員可查看使用者列表 |
| test_admin_can_search_users | ✅ | 管理員可搜尋使用者 |
| test_admin_can_filter_users_by_role | ✅ | 管理員可依角色篩選 |
| test_admin_can_open_user_detail_drawer | ✅ | 管理員可開啟使用者詳細資訊 |
| test_admin_can_edit_user_role | ✅ | 管理員可編輯使用者角色 |
| test_admin_can_change_user_status | ✅ | 管理員可變更使用者狀態 |
| test_complete_user_management_workflow | ✅ | 完整使用者管理流程 |
| test_non_admin_cannot_access_users_page | ⚠️ | 非管理員存取控制（需一般使用者資料） |

**測試覆蓋功能：**
- ✅ 列表顯示與分頁
- ✅ 搜尋功能
- ✅ 角色篩選
- ✅ 使用者詳細資訊
- ✅ 角色編輯
- ✅ 狀態管理
- ✅ 完整工作流程

### 📎 附件上傳測試 (AttachmentUploadTest.php)

**測試檔案：** `tests/Browser/Manage/Admin/AttachmentUploadTest.php`

| 測試案例 | 狀態 | 說明 |
|---------|------|------|
| test_admin_can_open_upload_modal | ✅ | 管理員可開啟上傳對話框 |
| test_admin_can_upload_file | ✅ | 管理員可上傳檔案 |
| test_admin_can_edit_uploaded_file_info | ✅ | 管理員可編輯附件資訊 |
| test_admin_can_switch_view_modes | ✅ | 管理員可切換檢視模式 |
| test_admin_can_filter_attachments_by_type | ✅ | 管理員可依類型篩選 |
| test_complete_attachment_upload_workflow | ✅ | 完整附件上傳流程 |
| test_upload_progress_displays_correctly | ✅ | 上傳進度正確顯示 |
| test_non_admin_cannot_access_attachments_page | ⚠️ | 非管理員存取控制（需一般使用者資料） |

**測試覆蓋功能：**
- ✅ 上傳對話框
- ✅ 檔案上傳介面
- ✅ 附件資訊編輯
- ✅ Grid/List 檢視切換
- ✅ 類型篩選
- ✅ 完整上傳流程
- ✅ 進度顯示

---

## 測試執行

### 執行命令

```bash
# 執行所有 Dusk 測試
php artisan dusk

# 執行特定測試檔案
php artisan dusk tests/Browser/Manage/Admin/UserManagementTest.php

# 執行特定測試方法
php artisan dusk --filter=test_admin_can_view_users_list

# 執行測試並顯示詳細輸出
php artisan dusk --verbose

# 執行測試時停在第一個失敗
php artisan dusk --stop-on-failure
```

### 測試前準備

#### 1. 確保應用程式運行中

```bash
php artisan serve
# 應用會運行在 http://localhost:8000
```

#### 2. 確認測試帳號存在

測試使用 `grasonjas@gmail.com` 作為 admin 帳號。確認：

```bash
php artisan tinker
>>> User::where('email', 'grasonjas@gmail.com')->first()
```

應該返回具有 `role = 'admin'` 的使用者。

#### 3. 編譯前端資源

```bash
npm run build
```

---

## 測試結果

### 最新測試結果

**測試日期：** 2025-10-03  
**測試環境：** Headless Chrome 140  

#### UserManagementTest

```
PASS  Tests\Browser\Manage\Admin\UserManagementTest
✓ admin can view users list                     6.64s
✓ admin can search users                        3.39s
✓ admin can filter users by role                3.37s
✓ admin can open user detail drawer             4.37s
✓ admin can edit user role                      4.37s
✓ admin can change user status                  4.34s
✓ complete user management workflow             4.53s
- non admin cannot access users page            0.02s

Tests:  7 passed, 1 skipped
Duration: 31.13s
```

#### AttachmentUploadTest

```
PASS  Tests\Browser\Manage\Admin\AttachmentUploadTest
✓ admin can open upload modal                   6.39s
✓ admin can upload file                         3.73s
✓ admin can edit uploaded file info             3.71s
✓ admin can switch view modes                   3.67s
✓ admin can filter attachments by type          3.68s
✓ complete attachment upload workflow           3.80s
✓ upload progress displays correctly            3.71s
- non admin cannot access attachments page      0.03s

Tests:  7 passed, 1 skipped
Duration: 28.84s
```

**總計：** 14 passed, 2 skipped  
**成功率：** 87.5% (2 個測試因缺少一般使用者資料而跳過)  
**總時長：** 約 60 秒

---

## 技術實作

### 認證方式

**使用 `loginAs()` 方法（推薦）：**

```php
protected function getAdminUser(): User
{
    return User::where('email', 'grasonjas@gmail.com')->firstOrFail();
}

public function test_example(): void
{
    $admin = $this->getAdminUser();
    
    $this->browse(function (Browser $browser) use ($admin) {
        $browser->loginAs($admin)
            ->visit('/manage/admin/users')
            ->pause(3000)  // 等待頁面載入
            ->screenshot('test-screenshot')
            ->assertPathIs('/manage/admin/users');
    });
}
```

**優點：**
- ✅ 避免 CSRF token 問題
- ✅ 測試執行快速穩定
- ✅ 專注於功能測試而非登入流程
- ✅ 每個測試獨立執行

### 截圖功能

所有測試都會自動產生截圖，保存在 `tests/Browser/screenshots/` 目錄：

```php
$browser->screenshot('users-list')
    ->screenshot('before-search')
    ->screenshot('after-search');
```

### 等待與互動

```php
// 等待頁面載入
$browser->pause(3000);

// 等待特定元素
$browser->waitFor('.user-table', 10);

// 等待文字出現
$browser->waitForText('使用者管理');

// 等待並點擊
$browser->waitFor('.add-button')->click('.add-button');
```

### 常用測試模式

```php
// 1. 頁面訪問測試
$browser->loginAs($admin)
    ->visit('/manage/admin/users')
    ->assertPathIs('/manage/admin/users')
    ->screenshot('page-loaded');

// 2. 搜尋功能測試
$browser->loginAs($admin)
    ->visit('/manage/admin/users')
    ->type('input[type="search"]', 'keyword')
    ->pause(1000)
    ->screenshot('after-search');

// 3. 篩選功能測試
$browser->loginAs($admin)
    ->visit('/manage/admin/users')
    ->select('select[name="role"]', 'admin')
    ->pause(1000)
    ->screenshot('filtered-by-role');

// 4. 對話框互動測試
$browser->loginAs($admin)
    ->visit('/manage/admin/attachments')
    ->click('[data-testid="upload-button"]')
    ->pause(2000)
    ->screenshot('modal-opened');
```

---

## 常見問題

### Q: 測試執行很慢

**A:** E2E 測試需要啟動真實瀏覽器，每個測試平均需要 4-7 秒。這是正常的。可以：
- 使用 `--filter` 只執行需要的測試
- 並行執行測試（需要配置）
- 減少 `pause()` 的時間（但可能導致不穩定）

### Q: 看到 "沒有可用的一般使用者帳號" 訊息

**A:** 這是正常的 SKIPPED 訊息。如需測試權限控制，創建一般使用者：

```bash
php artisan tinker
>>> User::factory()->create([
    'role' => 'user',
    'email' => 'test@example.com',
    'password' => bcrypt('password')
])
```

### Q: 測試失敗提示找不到元素

**A:** 檢查：
1. 應用程式是否在運行 (`http://localhost:8000`)
2. 前端資源是否已編譯 (`npm run build`)
3. 查看截圖了解實際頁面狀態 (`tests/Browser/screenshots/`)
4. 增加 `pause()` 時間讓頁面充分載入

### Q: Chrome binary not found

**A:** 安裝 Chromium：

```bash
sudo apt-get update
sudo apt-get install -y chromium-browser
```

### Q: ChromeDriver version mismatch

**A:** 重新安裝匹配版本的 ChromeDriver：

```bash
php artisan dusk:chrome-driver --detect
# 或指定版本
php artisan dusk:chrome-driver 140
```

### Q: 419 CSRF token mismatch

**A:** 使用 `loginAs()` 方法而非表單登入。表單登入在 Headless 模式可能遇到 CSRF 問題。

### Q: Session 問題

**A:** 確保 `.env.dusk.local` 配置正確：

```env
SESSION_DRIVER=cookie
SESSION_DOMAIN=localhost
```

---

## 維護指南

### 添加新測試

1. **創建測試檔案**

```bash
php artisan dusk:make NewFeatureTest
```

2. **遵循命名規範**

```php
// tests/Browser/Manage/Admin/NewFeatureTest.php
class NewFeatureTest extends DuskTestCase
{
    protected function getAdminUser(): User
    {
        return User::where('email', 'grasonjas@gmail.com')->firstOrFail();
    }
    
    public function test_feature_works(): void
    {
        $admin = $this->getAdminUser();
        
        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/path')
                ->pause(3000)
                ->screenshot('feature-test')
                ->assertSee('Expected Text');
        });
    }
}
```

### 更新測試

當 UI 變更時，更新對應的選擇器和斷言：

```php
// 舊版
$browser->click('.old-button-class');

// 新版 - 使用 data-testid 更穩定
$browser->click('[data-testid="action-button"]');
```

### 測試資料管理

使用真實資料庫而非測試資料庫，確保：
1. 測試帳號存在且角色正確
2. 必要的參考資料已建立（Categories, Tags 等）
3. 測試後不會破壞生產資料

### 截圖管理

定期清理舊截圖：

```bash
rm -rf tests/Browser/screenshots/*
php artisan dusk  # 重新產生最新截圖
```

### CI/CD 整合

GitHub Actions 範例：

```yaml
name: Dusk Tests

on: [push, pull_request]

jobs:
  dusk:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, xml, ctype, json, fileinfo
          
      - name: Install Dependencies
        run: |
          composer install --no-interaction --prefer-dist
          npm install
          npm run build
          
      - name: Install Chrome
        run: |
          sudo apt-get update
          sudo apt-get install -y chromium-browser
          
      - name: Prepare Laravel
        run: |
          cp .env.dusk.example .env.dusk.local
          php artisan key:generate
          php artisan dusk:chrome-driver --detect
          
      - name: Start Chrome Driver
        run: ./vendor/laravel/dusk/bin/chromedriver-linux &
        
      - name: Run Laravel Server
        run: php artisan serve --no-reload &
        
      - name: Run Dusk Tests
        run: php artisan dusk
        
      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: tests/Browser/screenshots
```

---

## 相關文件

- **plan.md** - 功能規劃與架構設計
- **ARCHITECTURE.md** - 前端程式碼架構規範
- [Laravel Dusk 官方文件](https://laravel.com/docs/dusk)
- [ChromeDriver 下載](https://chromedriver.chromium.org/downloads)

---

**最後更新：** 2025-10-03  
**測試版本：** v1.0.0  
**維護者：** Development Team
