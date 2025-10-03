# 第四部分實作計畫：教師模組

## 📋 概述

實作教師角色 (role = teacher) 的管理功能，包含：
- 實驗室管理
- 研究計畫管理
- 教師公告/課程管理

## 🎯 實作優先順序

### 階段 1：實驗室管理 (4.2) - 優先
**原因：** 已有 Lab 模型基礎，可以快速實作並建立模式

### 階段 2：研究計畫管理 (4.3)
**原因：** 已有 Project 模型基礎，邏輯相對獨立

### 階段 3：教師公告/課程管理 (4.1)
**原因：** 可重用 Post 管理的架構，但需要額外的課程分類功能

---

## 📦 階段 1：實驗室管理 (4.2)

### 後端實作

#### 1.1 資料庫結構檢查與調整

**現有欄位 (spaces 表):**
- ✅ `id`, `space_type`, `code`, `name`, `name_en`
- ✅ `location`, `capacity`, `website_url`
- ✅ `contact_email`, `contact_phone`
- ✅ `cover_image_url`, `description`, `description_en`
- ✅ `equipment_summary`, `visible`, `sort_order`
- ✅ `created_at`, `updated_at`, `deleted_at`

**需要新增的欄位：**
- ❌ `field` (研究領域) - 需要新增
- ❌ `principal_investigator_id` (負責教師) - 需要新增

**關聯表檢查：**
- ✅ `space_user` (成員關聯)
- ✅ `space_tag` (標籤關聯)

#### 1.2 建立遷移檔案

```bash
php artisan make:migration add_teacher_fields_to_spaces_table
```

```php
public function up()
{
    Schema::table('spaces', function (Blueprint $table) {
        $table->string('field')->nullable()->after('name_en')
            ->comment('研究領域');
        $table->unsignedBigInteger('principal_investigator_id')->nullable()
            ->after('field')->comment('負責教師ID');
            
        $table->foreign('principal_investigator_id')
            ->references('id')->on('users')
            ->nullOnDelete();
    });
}
```

#### 1.3 更新 Lab 模型

**檔案：** `app/Models/Lab.php`

需要新增：
- `field` 到 fillable
- `principal_investigator_id` 到 fillable
- `principalInvestigator()` 關聯方法
- 更新 `members()` 方法，區分負責人和成員

```php
protected $fillable = [
    // ... 現有欄位
    'field',
    'principal_investigator_id',
];

public function principalInvestigator(): BelongsTo
{
    return $this->belongsTo(User::class, 'principal_investigator_id');
}

public function members(): BelongsToMany
{
    return $this->belongsToMany(User::class, 'space_user', 'space_id', 'user_id')
        ->withPivot('role', 'access_level')
        ->withTimestamps();
}
```

#### 1.4 建立 Controller

**檔案：** `app/Http/Controllers/Manage/Teacher/LabController.php`

```php
<?php

namespace App\Http\Controllers\Manage\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabController extends Controller
{
    public function index(Request $request)
    {
        // 查詢教師負責或參與的實驗室
        // 支援篩選、搜尋、分頁
    }
    
    public function create()
    {
        // 顯示建立表單
    }
    
    public function store(Request $request)
    {
        // 驗證並建立實驗室
    }
    
    public function show(Lab $lab)
    {
        // 顯示實驗室詳細資料
    }
    
    public function edit(Lab $lab)
    {
        // 顯示編輯表單
    }
    
    public function update(Request $request, Lab $lab)
    {
        // 驗證並更新實驗室
    }
    
    public function destroy(Lab $lab)
    {
        // 軟刪除實驗室
    }
}
```

#### 1.5 建立 Request 驗證類別

**檔案：** `app/Http/Requests/Manage/Teacher/StoreLabRequest.php`

```php
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],
        'name_en' => ['nullable', 'string', 'max:255'],
        'field' => ['required', 'string', 'max:255'],
        'location' => ['nullable', 'string', 'max:255'],
        'capacity' => ['nullable', 'integer', 'min:1'],
        'description' => ['nullable', 'string'],
        'description_en' => ['nullable', 'string'],
        'website_url' => ['nullable', 'url'],
        'contact_email' => ['nullable', 'email'],
        'contact_phone' => ['nullable', 'string', 'max:50'],
        'equipment_summary' => ['nullable', 'string'],
        'members' => ['nullable', 'array'],
        'members.*' => ['exists:users,id'],
        'tags' => ['nullable', 'array'],
        'tags.*' => ['string', 'max:50'],
        'visible' => ['boolean'],
    ];
}
```

#### 1.6 建立 Resource

**檔案：** `app/Http/Resources/Manage/Teacher/LabResource.php`

```php
public function toArray($request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'name_en' => $this->name_en,
        'field' => $this->field,
        'location' => $this->location,
        'capacity' => $this->capacity,
        'description' => $this->description,
        'website_url' => $this->website_url,
        'contact_email' => $this->contact_email,
        'contact_phone' => $this->contact_phone,
        'principal_investigator' => $this->whenLoaded('principalInvestigator'),
        'members' => $this->whenLoaded('members'),
        'members_count' => $this->when($this->relationLoaded('members'), 
            fn() => $this->members->count()
        ),
        'tags' => $this->tags,
        'visible' => $this->visible,
        'created_at' => $this->created_at?->toISOString(),
        'updated_at' => $this->updated_at?->toISOString(),
    ];
}
```

#### 1.7 建立 Policy

**檔案：** `app/Policies/LabPolicy.php` (已存在，需更新)

```php
public function viewAny(User $user): bool
{
    // Admin 可以看全部，Teacher 只能看自己負責或參與的
    return $user->role === 'admin' || $user->role === 'teacher';
}

public function view(User $user, Lab $lab): bool
{
    if ($user->role === 'admin') {
        return true;
    }
    
    // 是負責人或成員
    return $lab->principal_investigator_id === $user->id
        || $lab->members->contains($user);
}

public function create(User $user): bool
{
    return in_array($user->role, ['admin', 'teacher']);
}

public function update(User $user, Lab $lab): bool
{
    if ($user->role === 'admin') {
        return true;
    }
    
    // 只有負責人可以編輯
    return $lab->principal_investigator_id === $user->id;
}
```

#### 1.8 路由設定

**檔案：** `routes/manage/teacher.php` (新建)

```php
<?php

use App\Http\Controllers\Manage\Teacher\LabController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:teacher,admin'])->group(function () {
    Route::prefix('teacher')->name('teacher.')->group(function () {
        // 實驗室管理
        Route::resource('labs', LabController::class);
        
        // 成員管理
        Route::post('labs/{lab}/members', [LabController::class, 'addMember'])
            ->name('labs.members.add');
        Route::delete('labs/{lab}/members/{user}', [LabController::class, 'removeMember'])
            ->name('labs.members.remove');
    });
});
```

在 `routes/web.php` 中引入：

```php
require __DIR__.'/manage/teacher.php';
```

### 前端實作

#### 2.1 型別定義

**檔案：** `resources/js/types/manage/teacher.d.ts`

```typescript
export interface Lab {
  id: number;
  name: string;
  name_en: string | null;
  field: string;
  location: string | null;
  capacity: number | null;
  description: string | null;
  description_en: string | null;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  principal_investigator?: User;
  principal_investigator_id?: number;
  members?: User[];
  members_count?: number;
  tags: string[];
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface LabFilters {
  search?: string;
  field?: string;
  visible?: boolean;
  tag?: string;
}
```

#### 2.2 列表頁面

**檔案：** `resources/js/pages/manage/teacher/labs/index.tsx`

功能：
- ✅ 表格顯示實驗室列表
- ✅ 欄位：名稱、領域、負責人、成員數、標籤、可見性、操作
- ✅ 搜尋框（關鍵字）
- ✅ 篩選器（領域、可見性、標籤）
- ✅ 分頁控制
- ✅ 新增實驗室按鈕
- ✅ 編輯、刪除操作

#### 2.3 建立/編輯表單

**檔案：** `resources/js/pages/manage/teacher/labs/create.tsx` 和 `edit.tsx`

表單欄位：
- 基本資訊：名稱（中英）、研究領域、地點、容量
- 描述資訊：描述（中英）、設備摘要
- 聯絡資訊：網站、Email、電話
- 成員管理：負責人（自動設為當前教師）、成員選擇器
- 標籤選擇：使用 TagMultiSelect 元件
- 可見性：顯示/隱藏開關

#### 2.4 詳細頁面

**檔案：** `resources/js/pages/manage/teacher/labs/show.tsx`

顯示內容：
- ✅ 實驗室基本資訊卡片
- ✅ 負責人資訊
- ✅ 成員列表（含新增/移除功能）
- ✅ 研究領域與設備介紹
- ✅ 聯絡資訊
- ✅ 標籤顯示
- ✅ 操作按鈕（編輯、刪除）

### 測試實作

#### 3.1 Feature 測試

**檔案：** `tests/Feature/Manage/Teacher/LabManagementTest.php`

測試案例：
- ✅ test_teacher_can_view_their_labs
- ✅ test_teacher_can_create_lab
- ✅ test_teacher_can_update_their_lab
- ✅ test_teacher_cannot_update_other_lab
- ✅ test_teacher_can_delete_their_lab
- ✅ test_teacher_can_add_members
- ✅ test_teacher_can_remove_members
- ✅ test_admin_can_view_all_labs
- ✅ test_regular_user_cannot_access_labs

#### 3.2 Dusk E2E 測試

**檔案：** `tests/Browser/Manage/Teacher/LabManagementTest.php`

測試案例：
- ✅ test_teacher_can_view_labs_list
- ✅ test_teacher_can_search_labs
- ✅ test_teacher_can_filter_by_field
- ✅ test_teacher_can_create_new_lab
- ✅ test_teacher_can_edit_lab
- ✅ test_teacher_can_add_member_to_lab
- ✅ test_teacher_can_remove_member_from_lab
- ✅ test_complete_lab_management_workflow

---

## 📦 階段 2：研究計畫管理 (4.3)

### 後端實作

#### 1.1 檢查 Project 模型

**現有結構：**
- ✅ 表：`research_projects`
- ✅ 欄位：title, sponsor, total_budget, start_date, end_date, etc.

**需要新增：**
- ❌ `title_en` (英文標題)
- ❌ `funding_source` (經費來源，替代 sponsor)
- ❌ `amount` (金額，替代 total_budget)
- ❌ `status` (狀態：進行中/已完成/已取消)
- ❌ `space_id` (關聯 Space)
- ❌ `attachments` (附件關聯)

#### 1.2 建立遷移

```bash
php artisan make:migration update_research_projects_table_for_manage
```

#### 1.3 Controller & Resource

類似 Lab 的結構，建立：
- `app/Http/Controllers/Manage/Teacher/ProjectController.php`
- `app/Http/Requests/Manage/Teacher/StoreProjectRequest.php`
- `app/Http/Resources/Manage/Teacher/ProjectResource.php`

### 前端實作

- `resources/js/pages/manage/teacher/projects/index.tsx`
- `resources/js/pages/manage/teacher/projects/create.tsx`
- `resources/js/pages/manage/teacher/projects/show.tsx`

### 測試實作

- Feature: `tests/Feature/Manage/Teacher/ProjectManagementTest.php`
- Dusk: `tests/Browser/Manage/Teacher/ProjectManagementTest.php`

---

## 📦 階段 3：教師公告/課程管理 (4.1)

### 實作策略

重用 Post 系統，但：
- 新增 `course` 類型的 PostCategory
- 教師只能管理自己建立的公告
- 新增課程特定欄位（受眾、開始/結束時間）

### 後端實作

#### 1.1 擴充 Post 模型

可能需要：
- `target_audience` (受眾)
- `course_start_at`, `course_end_at` (課程時間)

#### 1.2 Controller

- `app/Http/Controllers/Manage/Teacher/PostController.php`

功能類似 Admin 的 PostController，但：
- 只能查看/編輯自己的公告
- 自動設定 author 為當前教師

### 前端實作

- `resources/js/pages/manage/teacher/posts/index.tsx`
- 重用 Admin 的表單元件，調整權限邏輯

### 測試實作

- Feature: `tests/Feature/Manage/Teacher/PostManagementTest.php`
- Dusk: `tests/Browser/Manage/Teacher/PostManagementTest.php`

---

## 🎯 實作順序總結

### Week 1: 實驗室管理
- Day 1-2: 後端 API（遷移、模型、Controller、Request、Resource、Policy）
- Day 3-4: 前端頁面（列表、表單、詳細頁）
- Day 5: Feature 測試
- Day 6: Dusk E2E 測試
- Day 7: 修正與優化

### Week 2: 研究計畫管理
- Day 1-2: 後端 API
- Day 3-4: 前端頁面
- Day 5: Feature 測試
- Day 6: Dusk E2E 測試
- Day 7: 整合與測試

### Week 3: 教師公告管理
- Day 1-2: 擴充 Post 系統
- Day 3-4: 前端頁面調整
- Day 5: Feature 測試
- Day 6: Dusk E2E 測試
- Day 7: 最終測試與文檔

---

## 📝 開發檢查清單

### 每個功能模組必須包含：

**後端：**
- [ ] 資料庫遷移檔案
- [ ] 模型更新（關聯、屬性、方法）
- [ ] Controller（CRUD + 特殊操作）
- [ ] Request 驗證類別
- [ ] Resource 格式化
- [ ] Policy 權限控制
- [ ] 路由註冊
- [ ] 稽核日誌記錄

**前端：**
- [ ] 型別定義 (TypeScript)
- [ ] 列表頁面（含篩選、搜尋、分頁）
- [ ] 建立/編輯表單
- [ ] 詳細頁面
- [ ] 共用元件（如需要）
- [ ] 錯誤處理與使用者回饋

**測試：**
- [ ] Feature 測試（至少 10 個案例）
- [ ] Dusk E2E 測試（至少 8 個案例）
- [ ] 權限測試
- [ ] 邊界條件測試

**文檔：**
- [ ] plan.md 更新進度
- [ ] API 文檔（如需要）
- [ ] 使用說明（如需要）

---

## 🚀 開始實作

準備從 **階段 1：實驗室管理** 開始實作。

是否開始建立第一個功能？
