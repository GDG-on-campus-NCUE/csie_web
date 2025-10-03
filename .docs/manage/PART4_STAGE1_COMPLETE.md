# 🎉 第四部分階段1完成報告 - 實驗室管理後端 API

## ✅ 已完成項目

### 1. 資料庫層 ✅
- ✅ 遷移檔案：`2025_10_02_180943_add_teacher_fields_to_spaces_table.php`
- ✅ 新增欄位：`field` (研究領域), `principal_investigator_id` (負責教師)
- ✅ 外鍵約束：principal_investigator_id → users.id
- ✅ 遷移已執行

### 2. 模型層 ✅
- ✅ `Lab.php` - 更新 fillable 欄位
- ✅ 新增 `principalInvestigator()` 關聯方法 (BelongsTo)
- ✅ 更新 `members()` 關聯方法 (支援 pivot 資料)
- ✅ 保留現有的標籤同步功能

### 3. Request 驗證層 ✅
- ✅ `StoreLabRequest.php` - 建立實驗室驗證規則
  - 必填：name, field
  - 可選：name_en, location, capacity, description, equipment_summary, etc.
  - 成員驗證：exists:users,id
  - 標籤驗證：字串陣列
  - 自動轉換 visible 為布林值

- ✅ `UpdateLabRequest.php` - 更新實驗室驗證規則
  - 使用 'sometimes' 規則允許部分更新
  - 其他規則與 Store 相同

### 4. Controller 層 ✅
- ✅ `LabController.php` - 完整的 RESTful API
  - ✅ `index()` - 列表（含搜尋、篩選、分頁、權限控制）
  - ✅ `create()` - 建立頁面（提供可選成員列表）
  - ✅ `store()` - 儲存實驗室（自動設定 PI、同步成員、記錄活動）
  - ✅ `show()` - 顯示詳情（載入關聯）
  - ✅ `edit()` - 編輯頁面（提供當前資料和可選成員）
  - ✅ `update()` - 更新實驗室（同步成員、記錄活動）
  - ✅ `destroy()` - 軟刪除（記錄活動）
  - ✅ `addMember()` - 新增成員（記錄活動）
  - ✅ `removeMember()` - 移除成員（記錄活動）

**特色功能：**
- 權限過濾：教師只能看自己負責或參與的實驗室
- 多維度搜尋：name, name_en, field, description
- 多種篩選：研究領域、可見性、標籤
- 排序支援
- 資料庫交易保護
- 完整錯誤處理

### 5. Resource 層 ✅
- ✅ `LabResource.php` - API 資源格式化
  - 基本欄位：id, name, field, location, capacity, etc.
  - 關聯載入：principalInvestigator, members, tags
  - 條件式載入：whenLoaded
  - 成員數統計：members_count
  - 時間戳記：ISO 格式

### 6. Policy 層 ✅
- ✅ `LabPolicy.php` - 權限控制
  - ✅ `before()` - Admin 擁有所有權限
  - ✅ `viewAny()` - Admin + Teacher 可查看列表
  - ✅ `view()` - Admin 全部 / Teacher 自己的 / 公開實驗室
  - ✅ `create()` - Admin + Teacher 可建立
  - ✅ `update()` - Admin 全部 / Teacher 只能更新自己負責的
  - ✅ `delete()` - Admin 全部 / Teacher 只能刪除自己負責的
  - ✅ `restore()` - 僅 Admin
  - ✅ `forceDelete()` - 僅 Admin
  - ✅ `manageMembers()` - Admin 全部 / Teacher 自己負責的

### 7. 路由層 ✅
- ✅ `routes/manage/teacher.php` - 已更新
  - RESTful 路由：labs.{index, create, store, show, edit, update, destroy}
  - 成員管理：labs.members.{add, remove}
  - 中介層：auth, verified, role:admin,teacher

### 8. 測試檔案建立 ✅
- ✅ `tests/Feature/Manage/Teacher/LabManagementTest.php` - 已建立（待實作內容）

---

## 📋 下一步工作

### 階段 1.1: 完成 Feature 測試 (1-2 小時)

需要實作的測試案例：

```php
// 基本 CRUD 測試
✅ test_teacher_can_view_their_labs_list
✅ test_teacher_cannot_view_other_teacher_labs
✅ test_admin_can_view_all_labs
✅ test_teacher_can_create_lab
✅ test_teacher_can_update_their_lab
✅ test_teacher_cannot_update_other_teacher_lab
✅ test_teacher_can_delete_their_lab
✅ test_teacher_cannot_delete_other_teacher_lab

// 搜尋與篩選測試
✅ test_can_search_labs_by_name
✅ test_can_filter_labs_by_field
✅ test_can_filter_labs_by_visibility
✅ test_can_filter_labs_by_tag

// 成員管理測試
✅ test_teacher_can_add_member_to_their_lab
✅ test_teacher_can_remove_member_from_their_lab
✅ test_teacher_cannot_manage_members_of_other_lab

// 權限測試
✅ test_regular_user_cannot_access_lab_management
✅ test_guest_cannot_access_lab_management

// 驗證測試
✅ test_lab_creation_requires_name_and_field
✅ test_lab_capacity_must_be_positive_integer
✅ test_lab_members_must_exist
```

### 階段 1.2: 建立前端型別定義 (30 分鐘)

```typescript
// resources/js/types/manage/teacher.d.ts
export interface Lab {
  id: number;
  name: string;
  name_en: string | null;
  field: string;
  // ... 其他欄位
}

export interface LabFilters {
  search?: string;
  field?: string;
  visible?: boolean;
  tag?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

### 階段 1.3: 建立前端頁面 (3-4 小時)

1. **列表頁** - `resources/js/pages/manage/teacher/labs/index.tsx`
   - 表格顯示
   - 搜尋框
   - 篩選器（領域、可見性、標籤）
   - 分頁控制
   - 新增按鈕

2. **建立頁** - `resources/js/pages/manage/teacher/labs/create.tsx`
   - 表單欄位
   - 成員選擇器
   - 標籤選擇器
   - 驗證與錯誤顯示

3. **編輯頁** - `resources/js/pages/manage/teacher/labs/edit.tsx`
   - 預填資料
   - 表單欄位
   - 成員管理

4. **詳細頁** - `resources/js/pages/manage/teacher/labs/show.tsx`
   - 資訊卡片
   - 成員列表
   - 操作按鈕

### 階段 1.4: Dusk E2E 測試 (2-3 小時)

```bash
php artisan dusk:make Manage/Teacher/LabManagementTest
```

測試案例：
- ✅ test_teacher_can_view_labs_list
- ✅ test_teacher_can_search_labs
- ✅ test_teacher_can_filter_by_field
- ✅ test_teacher_can_create_new_lab
- ✅ test_teacher_can_edit_their_lab
- ✅ test_teacher_can_add_member
- ✅ test_teacher_can_remove_member
- ✅ test_complete_lab_management_workflow

---

## 🎯 預計完成時間

- **階段 1.1 (Feature 測試)**: 2 小時
- **階段 1.2 (型別定義)**: 30 分鐘
- **階段 1.3 (前端頁面)**: 4 小時
- **階段 1.4 (Dusk 測試)**: 3 小時

**總計**: 約 9.5 小時 (約 2 個工作天)

---

## 📝 完成後需更新

### 1. plan.md
```markdown
### 4.2 實驗室模組
- [x] 後端 API（Controller, Request, Resource, Policy）
- [x] 列表顯示每個實驗室：名稱、領域、負責老師、學生名單
- [x] 表單欄位：name, field, description, members[], tags[]
- [x] 成員管理使用多選清單 + 搜尋
- [x] 權限控制（教師只能管理自己的）
- [ ] Feature 測試（待完成）
- [ ] 前端頁面（待完成）
- [ ] Dusk E2E 測試（待完成）
```

### 2. PART4_PROGRESS.md
更新進度，記錄完成的模組和遇到的問題。

---

## 🚀 立即執行

### 選項 A: 繼續完成 Feature 測試
```bash
# 編輯測試檔案
code tests/Feature/Manage/Teacher/LabManagementTest.php

# 執行測試
php artisan test tests/Feature/Manage/Teacher/LabManagementTest.php
```

### 選項 B: 先建立前端頁面
```bash
# 建立型別定義
code resources/js/types/manage/teacher.d.ts

# 建立列表頁
code resources/js/pages/manage/teacher/labs/index.tsx
```

### 選項 C: 建立測試教師帳號
```bash
php artisan tinker
>>> User::factory()->create(['role' => 'teacher', 'email' => 'teacher@test.com', 'password' => bcrypt('12345678'), 'status' => 1])
```

---

**後端 API 已完成！** 🎉

準備好繼續下一步時請告訴我要進行哪個階段！
