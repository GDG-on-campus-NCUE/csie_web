# 學程管理架構更新報告

## 變更概述

根據需求分析，課程管理功能不會使用，學程內容將以文件方式上傳（基於公告系統）。因此對資料庫架構和相關模型進行了重大更新。

## 資料庫架構變更

### 1. Migration 檔案更新

**檔案**：`2025_09_13_100700_create_programs_table.php`（原：`create_programs_and_courses_tables.php`）

#### 移除的表格
- ❌ `courses` 表格（完全移除）
- ❌ `program_courses` 關聯表格（完全移除）

#### 保留並優化的表格
- ✅ `programs` 表格（簡化並優化）
- ✅ `program_posts` 關聯表格（新增，取代 program_courses）

#### Programs 表格結構
```php
Schema::create('programs', function (Blueprint $table) {
    $table->id();
    $table->string('code')->nullable()->comment('學程代碼');
    $table->enum('level', ['bachelor', 'master', 'ai_inservice', 'dual'])
          ->comment('學制類別：學士班、碩士班、AI在職專班、雙聯學制');
    $table->string('name')->comment('學程名稱（中文）');
    $table->string('name_en')->comment('學程名稱（英文）');
    $table->text('description')->nullable()->comment('學程簡介（中文）');
    $table->text('description_en')->nullable()->comment('學程簡介（英文）');
    $table->string('website_url')->nullable()->comment('官方網站連結');
    $table->boolean('visible')->default(true)->comment('是否顯示');
    $table->integer('sort_order')->default(0)->comment('排序');
    $table->softDeletes();
    $table->timestamps();
    
    $table->index(['level', 'visible', 'sort_order']);
});
```

#### Program Posts 關聯表格（新增）
```php
Schema::create('program_posts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
    $table->foreignId('post_id')->constrained('posts')->cascadeOnDelete();
    $table->enum('post_type', ['curriculum', 'regulation', 'course_map', 'other'])
          ->default('other')
          ->comment('公告類型：課程資訊、修業規定、課程地圖、其他');
    $table->integer('sort_order')->default(0)->comment('在該學程中的排序');
    $table->timestamps();
    
    $table->unique(['program_id', 'post_id']);
    $table->index(['program_id', 'post_type', 'sort_order']);
});
```

## 模型架構更新

### 1. Program Model 重構

**檔案**：`app/Models/Program.php`

#### 新增功能
- ✅ 學制類別選項管理
- ✅ 公告類型選項管理  
- ✅ 關聯公告的查詢方法
- ✅ 按類型取得公告的便利方法
- ✅ 多種 Scope 查詢方法
- ✅ 學制中文名稱 Accessor

#### 主要方法
```php
// 靜態選項方法
Program::getLevelOptions()      // 取得學制選項
Program::getPostTypeOptions()   // 取得公告類型選項

// 關聯方法
$program->posts()              // 所有關聯的公告
$program->getCurriculumPosts() // 課程資訊公告
$program->getRegulationPosts() // 修業規定公告
$program->getCourseMapPosts()  // 課程地圖公告

// Scope 方法
Program::visible()             // 只顯示可見的學程
Program::byLevel($level)       // 按學制篩選
Program::ordered()             // 按排序顯示
```

### 2. Course Model 處理

**狀態**：標記為移除（需要清理相關引用）

## 控制器更新

### 1. AcademicController 重構

**檔案**：`app/Http/Controllers/Manage/Admin/AcademicController.php`

#### 主要變更
- ❌ 移除對 `Course` 模型的依賴
- ✅ 專注於學程管理功能
- ✅ 整合公告關聯功能
- ✅ 簡化篩選和分頁邏輯

#### 新的 index 方法特點
- 學程列表顯示（含關聯公告）
- 按學制、可見性篩選
- 公告選項提供（供關聯使用）
- 公告類型管理
- 完整的分頁和排序功能

## 功能設計邏輯

### 1. 學程與公告關聯模式

```
學程 (Programs)
├── 學士班
│   ├── 課程資訊公告
│   ├── 修業規定公告
│   └── 課程地圖公告
├── 碩士班
│   ├── 課程資訊公告
│   └── 修業規定公告
└── AI在職專班
    └── 修業規定公告
```

### 2. 公告類型分類
- **curriculum**：課程資訊
- **regulation**：修業規定  
- **course_map**：課程地圖
- **other**：其他相關文件

### 3. 管理流程
1. **建立學程**：設定基本資訊（名稱、學制、描述等）
2. **上傳文件**：建立公告並上傳相關文件
3. **關聯設定**：將公告關聯到對應學程並設定類型
4. **排序管理**：調整學程和公告的顯示順序

## 待處理項目

### 1. 需要移除的檔案和引用
- [ ] `app/Models/Course.php` 模型檔案
- [ ] `app/Http/Controllers/Manage/Admin/CourseController.php`
- [ ] `app/Http/Controllers/Api/CourseController.php`
- [ ] 相關的路由定義
- [ ] AppServiceProvider 中的 Course 引用

### 2. 需要更新的檔案
- [ ] 前端頁面組件（學程管理頁面）
- [ ] 語言檔案（學程相關翻譯）
- [ ] 測試檔案更新

### 3. 新增功能建議
- [ ] 學程公告關聯的管理介面
- [ ] 批量操作功能
- [ ] 學程排序拖拽功能
- [ ] 公告類型圖示化顯示

## 實施完成項目

### ✅ 資料庫架構更新
- [x] 更新 migration 檔案，移除 courses 和 program_courses 表格
- [x] 建立 programs 和 program_posts 關聯表格
- [x] 成功執行資料庫遷移

### ✅ 後端程式碼清理
- [x] 刪除 `app/Models/Course.php` 模型檔案
- [x] 刪除 `CourseController.php` 控制器檔案（API 和 Manage）
- [x] 更新 `Program.php` 模型，加入新的關聯方法
- [x] 重構 `AcademicController.php`，專注於學程管理
- [x] 清理 `AppServiceProvider.php` 中的 Course 引用

### ✅ 路由系統更新
- [x] 移除 `routes/api.php` 中的 Course 路由
- [x] 移除 `routes/manage.php` 中的 Course 路由
- [x] 保留學程管理路由 `/manage/academics`

### ✅ 前端程式碼更新
- [x] 刪除 `resources/js/pages/manage/courses` 頁面
- [x] 更新 `ManageSidebar` 組件，移除課程連結
- [x] 更新權限系統，將 `MANAGE_COURSES` 改為 `MANAGE_ACADEMICS`
- [x] 更新快速操作和儀表板連結
- [x] 刪除舊的側邊欄組件檔案

### ✅ 語言檔案更新
- [x] 更新中文語言檔案 `lang/zh-TW/manage.php`
- [x] 更新英文語言檔案 `lang/en/manage.php`
- [x] 將「課程管理」更新為「學程管理」

### ✅ 系統優化
- [x] 清除快取和重新編譯
- [x] 前端資源建置成功
- [x] 建立預設學程資料

## 新系統架構特點

### 1. 簡化的學程管理
- **學程表格**：包含基本資訊（名稱、學制、描述等）
- **文件管理**：透過公告系統上傳和管理學程相關文件
- **類型分類**：curriculum（課程資訊）、regulation（修業規定）、course_map（課程地圖）、other（其他）

### 2. 角色權限整合
- **管理員**：完整的學程管理權限
- **教師**：可存取學程管理頁面，查看相關資訊
- **使用者**：透過前台頁面瀏覽學程資訊

### 3. 資料關聯優化
```php
// 新的關聯方式
$program->posts()                // 所有關聯公告
$program->getCurriculumPosts()   // 課程資訊
$program->getRegulationPosts()   // 修業規定
$program->getCourseMapPosts()    // 課程地圖
```

## 總結

這次重構成功將複雜的課程管理系統簡化為更實用的學程文件管理系統。透過與公告系統的整合，提供了更靈活的內容管理方式，管理員可以輕鬆地為不同學制上傳和管理相關文件，而不需要維護複雜的課程資料結構。

系統現在更加統一和易於維護，所有學程相關的文件都透過成熟的公告系統進行管理，確保了資料的一致性和可擴展性。
