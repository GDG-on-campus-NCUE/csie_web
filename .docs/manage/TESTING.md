# 管理後台測試指南

本文件說明如何執行管理後台測試，包含 Feature 測試和 E2E 測試。

## 📚 測試文檔

- **[Dusk E2E 測試指南](../../tests/Browser/DUSK_TESTING.md)** - 完整的端到端測試指南
- **plan.md** - 功能規劃與測試需求
- **ARCHITECTURE.md** - 前端架構規範

## 測試類型

### 1. Feature 測試（單元與整合測試）
使用 PHPUnit 進行後端 API 和業務邏輯測試。

### 2. Dusk E2E 測試（端到端測試）
使用 Laravel Dusk 進行完整的使用者操作流程測試。詳見 **[Dusk E2E 測試指南](../../tests/Browser/DUSK_TESTING.md)**。

---

## 測試檔案位置

### Feature 測試
- **使用者管理**: `tests/Feature/Manage/Admin/UserManagementTest.php`
- **附件資源**: `tests/Feature/Manage/Admin/AttachmentManagementTest.php`
- **稽核記錄**: `tests/Feature/Manage/ManageActivityAuditTest.php`

### Dusk E2E 測試
- **使用者管理**: `tests/Browser/Manage/Admin/UserManagementTest.php`
- **附件上傳**: `tests/Browser/Manage/Admin/AttachmentUploadTest.php`

## 執行測試

### 1. 執行所有管理後台測試

```bash
php artisan test --testsuite=Feature --filter="Manage"
```

### 2. 執行特定模組測試

#### 使用者管理測試
```bash
php artisan test tests/Feature/Manage/Admin/UserManagementTest.php
```

#### 附件資源測試
```bash
php artisan test tests/Feature/Manage/Admin/AttachmentManagementTest.php
```

#### 稽核記錄測試
```bash
php artisan test tests/Feature/Manage/ManageActivityAuditTest.php
```

### 3. 執行特定測試案例

```bash
# 測試管理員可以查看使用者列表
php artisan test --filter="test_admin_can_view_user_list"

# 測試批次刪除附件
php artisan test --filter="test_admin_can_bulk_delete_attachments"

# 測試稽核日誌記錄
php artisan test --filter="test_post_publish_logs_activity"
```

### 4. 執行測試並顯示詳細輸出

```bash
php artisan test tests/Feature/Manage/Admin/UserManagementTest.php --verbose
```

### 5. 執行測試並生成覆蓋率報告

```bash
php artisan test --coverage --coverage-html=coverage
```

## 測試覆蓋範圍

### 使用者管理 (15+ 測試案例)
- ✅ 查看使用者列表
- ✅ 權限驗證（非管理員無法存取）
- ✅ 更新使用者資料
- ✅ 批次更新使用者狀態
- ✅ 發送密碼重設連結
- ✅ 模擬登入功能
- ✅ 為使用者綁定 Space
- ✅ 角色篩選
- ✅ 狀態篩選
- ✅ 關鍵字搜尋
- ✅ 使用者停用
- ✅ 查看使用者詳細資料

### 附件資源 (15+ 測試案例)
- ✅ 查看附件列表
- ✅ 權限驗證（非管理員無法存取）
- ✅ 批次刪除附件
- ✅ 批次刪除驗證（需要有效 ID）
- ✅ 類型篩選
- ✅ 可見性篩選
- ✅ Space 篩選
- ✅ 標籤篩選
- ✅ 關鍵字搜尋
- ✅ 日期範圍篩選
- ✅ 排序功能
- ✅ Grid/List 檢視模式切換
- ✅ 顯示關聯資訊
- ✅ 分頁功能

### 稽核記錄 (10+ 測試案例)
- ✅ 公告發佈記錄
- ✅ 標籤合併記錄
- ✅ 標籤分割記錄
- ✅ 使用者角色變更記錄
- ✅ 使用者狀態變更記錄
- ✅ 批次使用者狀態更新記錄
- ✅ 密碼重設連結發送記錄
- ✅ 模擬登入記錄
- ✅ 使用者停用記錄
- ✅ 附件批次刪除記錄
- ✅ 公告批次操作記錄
- ✅ 稽核日誌屬性完整性
- ✅ 時間線顯示功能

## 測試前準備

### 1. 設定測試資料庫

確保 `.env.testing` 檔案已正確設定測試資料庫：

```env
DB_CONNECTION=sqlite
DB_DATABASE=:memory:
```

或使用獨立的測試資料庫：

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=csie_test
DB_USERNAME=root
DB_PASSWORD=
```

### 2. 執行資料庫遷移

```bash
php artisan migrate --env=testing
```

### 3. 清除快取

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

## 測試最佳實踐

### 1. 測試隔離
- 每個測試案例使用 `RefreshDatabase` trait 確保資料庫乾淨
- 不依賴其他測試的執行順序

### 2. 資料工廠
- 使用 Factory 建立測試資料，確保資料一致性
- 避免硬編碼測試資料

### 3. 斷言明確
- 使用明確的斷言方法（`assertDatabaseHas`, `assertJsonPath` 等）
- 驗證關鍵業務邏輯與資料狀態

### 4. 錯誤情境
- 測試正常流程與異常流程
- 驗證權限控制與資料驗證

## 持續整合

建議在 CI/CD 流程中自動執行測試：

```yaml
# GitHub Actions 範例
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.2'
    - name: Install Dependencies
      run: composer install
    - name: Run Tests
      run: php artisan test --testsuite=Feature --filter="Manage"
```

---

## Dusk E2E 測試

### 快速執行

```bash
# 執行所有 E2E 測試
php artisan dusk

# 執行使用者管理測試
php artisan dusk tests/Browser/Manage/Admin/UserManagementTest.php

# 執行附件上傳測試
php artisan dusk tests/Browser/Manage/Admin/AttachmentUploadTest.php
```

### 測試覆蓋範圍

**使用者管理 (8 個測試):**
- ✅ 查看使用者列表
- ✅ 搜尋使用者
- ✅ 依角色篩選
- ✅ 開啟詳細資訊
- ✅ 編輯角色
- ✅ 變更狀態
- ✅ 完整工作流程
- ⚠️ 權限控制測試（需一般使用者）

**附件上傳 (8 個測試):**
- ✅ 開啟上傳對話框
- ✅ 上傳檔案
- ✅ 編輯附件資訊
- ✅ 切換檢視模式
- ✅ 依類型篩選
- ✅ 完整上傳流程
- ✅ 進度顯示
- ⚠️ 權限控制測試（需一般使用者）

**詳細說明請參考：** **[Dusk E2E 測試指南](../../tests/Browser/DUSK_TESTING.md)**

---

## 待補充測試

根據 plan.md，以下項目尚需補充測試：

1. **Dusk E2E 測試**
   - ✅ 使用者管理完整操作流程（已完成）
   - ✅ 附件上傳流程（已完成）
   - ❌ 公告 CRUD 流程
   - ❌ 標籤合併/分割操作
   - ❌ 批次操作互動流程

2. **Feature 測試**
   - ❌ 公告管理完整測試
   - ❌ 標籤管理測試
   - ❌ 訊息管理測試

## 問題排查

### 測試失敗常見原因

1. **資料庫連線問題**
   - 檢查 `.env.testing` 設定
   - 確認測試資料庫可存取

2. **權限問題**
   - 確認 Policy 已正確定義
   - 檢查使用者角色設定

3. **資料驗證失敗**
   - 檢查 FormRequest 驗證規則
   - 確認測試資料符合規則

4. **快取問題**
   - 清除所有快取
   - 重新執行測試

## 相關文件

---

## 相關文件

- **[Dusk E2E 測試指南](../../tests/Browser/DUSK_TESTING.md)** - 完整的 E2E 測試文檔
- **[plan.md](./plan.md)** - 功能規劃文件
- **[ARCHITECTURE.md](../.ARCHITECTURE.md)** - 前端架構規範
- [Laravel Testing Documentation](https://laravel.com/docs/testing)
- [Laravel Dusk Documentation](https://laravel.com/docs/dusk)
- [PHPUnit Documentation](https://phpunit.de/documentation.html)
```
