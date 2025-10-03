# 第四部分進度報告

## ✅ 已完成

### 1. 文檔規劃
- ✅ 建立 `PART4_IMPLEMENTATION_PLAN.md` - 完整實作計畫
- ✅ 測試文檔整理完成（合併為統一的 DUSK_TESTING.md）

### 2. 資料庫結構
- ✅ 建立遷移：`2025_10_02_180943_add_teacher_fields_to_spaces_table.php`
- ✅ 新增欄位：
  - `field` (研究領域)
  - `principal_investigator_id` (負責教師ID)
- ✅ 遷移已執行成功

### 3. 模型更新
- ✅ 更新 `Lab.php` 模型
  - 新增 `field` 和 `principal_investigator_id` 到 fillable
  - 新增 `principalInvestigator()` 關聯方法
  - 更新 `members()` 方法支援 pivot 資料

### 4. Request 驗證
- ✅ 建立 `StoreLabRequest.php` - 完整驗證規則和錯誤訊息
- ✅ 建立 `UpdateLabRequest.php` (檔案已建立，待補充內容)

## 📋 下一步工作

### 階段 1: 完成實驗室管理後端 (預計 2-3 小時)

1. **完成 UpdateLabRequest**
   - 複製 StoreLabRequest 的規則
   - 調整 name 的 unique 驗證

2. **建立 LabController**
   ```bash
   php artisan make:controller Manage/Teacher/LabController --resource
   ```
   - `index()` - 列表（篩選、搜尋、分頁）
   - `create()` - 建立頁面
   - `store()` - 儲存實驗室
   - `show()` - 顯示詳情
   - `edit()` - 編輯頁面
   - `update()` - 更新實驗室
   - `destroy()` - 軟刪除
   - `addMember()` - 新增成員
   - `removeMember()` - 移除成員

3. **建立 LabResource**
   ```bash
   php artisan make:resource Manage/Teacher/LabResource
   ```
   - 格式化輸出資料
   - 包含關聯載入（principalInvestigator, members, tags）

4. **更新 LabPolicy**
   - 檢查權限邏輯
   - 確保教師只能管理自己負責的實驗室

5. **建立路由**
   - 新建 `routes/manage/teacher.php`
   - 註冊 RESTful 路由
   - 新增成員管理路由

### 階段 2: 前端實作 (預計 3-4 小時)

1. **型別定義**
   - 建立 `resources/js/types/manage/teacher.d.ts`
   - 定義 Lab, LabFilters 介面

2. **列表頁面**
   - `resources/js/pages/manage/teacher/labs/index.tsx`
   - 表格、篩選器、搜尋、分頁

3. **建立/編輯頁面**
   - `resources/js/pages/manage/teacher/labs/create.tsx`
   - `resources/js/pages/manage/teacher/labs/edit.tsx`
   - 表單元件、驗證、提交

4. **詳細頁面**
   - `resources/js/pages/manage/teacher/labs/show.tsx`
   - 資訊卡片、成員管理

### 階段 3: 測試 (預計 2-3 小時)

1. **Feature 測試**
   ```bash
   php artisan make:test Manage/Teacher/LabManagementTest
   ```
   - 至少 10 個測試案例
   - 涵蓋 CRUD、權限、成員管理

2. **Dusk E2E 測試**
   ```bash
   php artisan dusk:make Manage/Teacher/LabManagementTest
   ```
   - 至少 8 個測試案例
   - 完整操作流程測試

### 階段 4: 更新 plan.md (預計 15 分鐘)

在完成每個功能後，更新 plan.md 中對應的 checkbox：

```markdown
### 4.2 實驗室模組
- [x] 列表顯示每個實驗室：名稱、領域、負責老師、學生名單、Space 連結。
- [x] 表單欄位：`name`, `field`, `description`, `members[]`, `space_id`, `tags[]`, `public_url`。
- [x] 成員管理使用多選清單 + 搜尋；提供批次邀請。
- [x] Feature 測試
- [x] Dusk E2E 測試
```

## 🎯 目標時間表

- **Day 1-2**: 完成實驗室管理後端 API
- **Day 3-4**: 完成實驗室管理前端頁面
- **Day 5**: Feature 測試
- **Day 6**: Dusk E2E 測試
- **Day 7**: 修正、優化、文檔更新

## 📝 注意事項

1. **權限控制**: 教師只能管理自己負責的實驗室，admin 可管理所有
2. **稽核日誌**: 所有操作需記錄到 ManageActivity
3. **標籤同步**: 使用現有的 Tag 系統
4. **成員管理**: 區分負責人（PI）和一般成員
5. **測試覆蓋**: 確保每個功能都有完整測試

## 🚀 立即執行

請執行以下命令繼續：

```bash
# 1. 完成 UpdateLabRequest
# 編輯 app/Http/Requests/Manage/Teacher/UpdateLabRequest.php

# 2. 建立 Controller
php artisan make:controller Manage/Teacher/LabController --resource

# 3. 建立 Resource
php artisan make:resource Manage/Teacher/LabResource

# 4. 建立路由檔案
# 新建 routes/manage/teacher.php

# 5. 建立測試帳號（如果還沒有 teacher 角色的使用者）
php artisan tinker
>>> User::factory()->create(['role' => 'teacher', 'email' => 'teacher@test.com', 'password' => bcrypt('12345678')])
```

準備好後，請告訴我繼續下一步！
