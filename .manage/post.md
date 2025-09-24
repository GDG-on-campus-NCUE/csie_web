# Post 管理系統完整文件

## 目錄
- [資料庫結構](#資料庫結構)
- [模型與關聯](#模型與關聯)
- [控制器架構](#控制器架構)
- [前端元件](#前端元件)
- [服務層](#服務層)
- [批次匯入系統](#批次匯入系統)
- [路由定義](#路由定義)
- [錯誤處理與通知](#錯誤處理與通知)

## 資料庫結構

### Posts Table
```sql
-- 文件表主要欄位
posts:
  - id (主鍵)
  - category_id (外鍵 -> post_categories.id)
  - slug (唯一識別符)
  - status (狀態: draft, scheduled, published, archived)
  - publish_at (發布時間)
  - expire_at (過期時間)
  - pinned (置頂)
  - cover_image_url (封面圖片)
  - title (中文標題)
  - title_en (英文標題)
  - summary (中文摘要)
  - summary_en (英文摘要)
  - content (中文內容)
  - content_en (英文內容)
  - source_type (來源類型)
  - source_url (來源連結)
  - views (瀏覽次數)
  - tags (標籤 JSON)
  - created_by (建立者)
  - updated_by (更新者)
  - created_at, updated_at
  - deleted_at (軟刪除)
```

### Post Categories Table
```sql
-- 文章分類表
post_categories:
  - id (主鍵)
  - parent_id (父分類 ID, 可為 null)
  - slug (分類識別符)
  - name (中文名稱)
  - name_en (英文名稱)
  - sort_order (排序)
  - visible (是否顯示)
  - created_at, updated_at
  - deleted_at (軟刪除)
```

## 模型與關聯

### Post 模型 (`app/Models/Post.php`)
```php
// 主要功能
- 軟刪除 (SoftDeletes)
- 工廠模式 (HasFactory)
- 可填欄位定義
- 類型轉換 (casts)
- 關聯定義

// 關聯關係
- belongsTo: category (PostCategory)
- belongsTo: creator (User)
- belongsTo: updater (User)
- belongsToMany: tags (Tag)
- morphMany: attachments (Attachment)

// 查詢範圍
- scopePublished()
- scopeVisible()
- scopeWithCategory()
```

### PostCategory 模型 (`app/Models/PostCategory.php`)
```php
// 主要功能
- 軟刪除支援
- 階層式分類結構
- 可見性控制

// 關聯關係
- belongsTo: parent (自關聯)
- hasMany: children (子分類)
- hasMany: posts (文章)
```

## 控制器架構

### 管理後台控制器 (`app/Http/Controllers/Manage/PostController.php`)
```php
// 主要方法
- index(): 文章列表頁面
- create(): 新增文章表單
- store(): 儲存新文章
- show(): 顯示文章詳情
- edit(): 編輯文章表單
- update(): 更新文章
- destroy(): 刪除文章
- bulk(): 批次操作 (含匯入)

// 特殊功能
- 檔案上傳處理
- 附件管理
- 權限控制 (authorizeResource)
- 多語系內容處理
```

### API 控制器 (`app/Http/Controllers/Api/PostController.php`)
```php
// 繼承 BaseApiController
- 標準 CRUD 操作
- JSON 回應格式
- 資料驗證
- 自動設定建立者/更新者
```

### 分類控制器
```php
// API 版本: App\Http\Controllers\Api\PostCategoryController
// 管理版本: App\Http\Controllers\Manage\Admin\PostCategoryController
- 階層式分類管理
- 父子關係處理
- 可見性控制
```

## 前端元件

### 主要頁面元件
```
resources/js/pages/manage/posts/
├── index.tsx              # 文章列表頁
├── create.tsx            # 新增文章頁
├── edit.tsx              # 編輯文章頁
└── show.tsx              # 文章詳情頁
```

### 通用元件 (`resources/js/components/manage/post/`)

#### 1. 批次匯入對話框 (`bulk-import-dialog.tsx`)
```typescript
// 功能特色
- CSV 檔案上傳
- 檔案格式驗證
- 拖拽上傳支援
- 進度顯示
- 錯誤處理
- 使用者友善介面

// 主要 Props
interface BulkImportDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete?: (result: ImportResult) => void
}
```

#### 2. 文章表格 (`post-table.tsx`)
```typescript
// 功能
- 分頁顯示
- 排序功能
- 狀態篩選
- 操作按鈕
- 批量選擇

// 資料處理
- 狀態徽章顯示
- 日期格式化
- 作者資訊顯示
- 附件數量統計
```

#### 3. 文章表單 (`post-form.tsx`)
```typescript
// 表單欄位
- 基本資訊 (標題, 分類, 狀態)
- 內容編輯器 (富文本)
- 多語系支援
- 發布時間設定
- 標籤管理
- 附件上傳

// 驗證規則
- 必填欄位檢查
- 格式驗證
- 重複性檢查
```

#### 4. 篩選表單 (`post-filter-form.tsx`)
```typescript
// 篩選條件
- 關鍵字搜尋
- 分類篩選
- 狀態篩選
- 日期範圍
- 作者篩選
```

#### 5. 通知元件 (`post-toast.tsx`)
```typescript
// 通知類型
- 成功訊息
- 錯誤訊息
- 警告訊息
- 批次操作結果

// 自動關閉機制
- 設定顯示時間
- 手動關閉選項
- 動畫效果
```

#### 6. 警示元件 (`post-flash-alerts.tsx`)
```typescript
// 頁面級別通知
- 持久性訊息顯示
- 多種警示類型
- 可關閉設計
```

### Hook 與工具

#### Toast Hook (`resources/js/hooks/use-toast.ts`)
```typescript
// 提供方法
- showSuccess(message)
- showError(message)
- showBatchErrors(errors[])
- clearToasts()

// 狀態管理
- 通知佇列
- 自動清除
- 防重複顯示
```

## 服務層

### PostBulkImportService (`app/Services/PostBulkImportService.php`)
```php
// 主要職責
- CSV 檔案處理
- 資料驗證
- 批次匯入邏輯
- 錯誤收集與回報
- 資料庫交易管理

// 核心方法
public function importFromCsv(UploadedFile $file): array
{
    // 1. 檔案驗證
    $this->validateFile($file);
    
    // 2. CSV 解析
    $data = $this->parseCsv($file);
    
    // 3. 資料驗證
    $validatedData = $this->validateData($data);
    
    // 4. 批次建立
    $results = $this->createPosts($validatedData);
    
    return $this->formatResults($results);
}

// 驗證規則
- 檔案格式檢查 (CSV, 大小限制)
- 必要欄位驗證 (title, category_id, content)
- 資料格式驗證 (日期, 狀態值)
- 重複性檢查 (slug 唯一性)

// 錯誤處理
- 逐行錯誤記錄
- 詳細錯誤訊息
- 部分成功處理
- 交易回滾機制
```

### CrudService (`app/Services/CrudService.php`)
```php
// 通用 CRUD 操作
- 標準化資料處理
- 統一錯誤處理
- 權限檢查整合
```

## 批次匯入系統

### CSV 格式規範
```csv
title,category_id,status,publish_at,content,title_en,content_en,tags
"測試文章1",1,"published","2024-01-01 10:00:00","這是內容...","Test Post 1","This is content...","tag1,tag2"
"測試文章2",2,"draft",,"另一個內容...","Test Post 2","Another content...","tag3"
```

### 匯入流程
1. **檔案上傳**: 前端元件處理檔案選擇與驗證
2. **後端處理**: PostBulkImportService 執行匯入邏輯
3. **進度回報**: 即時顯示處理進度與錯誤
4. **結果展示**: 成功/失敗統計與詳細錯誤列表

### 錯誤處理策略
- **檔案層級**: 格式不正確、大小超限
- **資料層級**: 必填欄位缺失、格式錯誤
- **業務層級**: 分類不存在、重複 slug
- **系統層級**: 資料庫錯誤、權限問題

## 路由定義

### 管理後台路由 (`routes/manage.php`)
```php
// 文章管理
Route::resource('posts', PostController::class);
Route::post('posts/bulk', [PostController::class, 'bulk'])->name('posts.bulk');

// 分類管理
Route::resource('post-categories', PostCategoryController::class);
```

### API 路由 (`routes/api.php`)
```php
// RESTful API
Route::apiResource('posts', PostController::class);
Route::apiResource('post-categories', PostCategoryController::class);
```

### 前端路由對應
```typescript
// 自動生成路由助手
resources/js/routes/manage/posts/index.ts
resources/js/routes/manage/post-categories/index.ts
resources/js/actions/App/Http/Controllers/Manage/PostController.ts
```

## 錯誤處理與通知

### Toast 通知系統
```typescript
// 使用方式
const { showSuccess, showError, showBatchErrors } = useToast()

// 成功通知
showSuccess('文章建立成功！')

// 錯誤通知
showError('儲存失敗，請稍後再試')

// 批次錯誤
showBatchErrors([
  { row: 1, message: '標題不能為空' },
  { row: 3, message: '分類不存在' }
])
```

### Flash 訊息處理
```php
// Controller 中設定
session()->flash('success', '操作成功！')
session()->flash('error', '操作失敗！')

// 前端自動顯示
<PostFlashAlerts />
```

### 驗證錯誤顯示
- 表單層級驗證
- 即時錯誤提示
- 欄位級別標示
- 統一錯誤格式

## 效能最佳化

### 資料庫查詢最佳化
```php
// 預載關聯資料
Post::with(['category', 'creator', 'attachments'])
    ->withCount('attachments')
    ->paginate(20);

// 索引設計
- status 欄位索引 (查詢效率)
- publish_at 欄位索引 (發布時間排序)
- category_id 外鍵索引
```

### 前端效能
- 元件懶載入
- 分頁處理
- 快取策略
- 圖片延遲載入

## 安全性考量

### 授權控制
```php
// 控制器層級
$this->authorizeResource(Post::class, 'post');

// 政策定義
PostPolicy::class
- view, viewAny
- create, update, delete
- 特殊權限檢查
```

### 資料驗證
- 輸入資料清理
- XSS 防護
- CSRF 保護
- 檔案上傳安全檢查

### 軟刪除機制
- 避免資料永久遺失
- 提供恢復功能
- 關聯資料處理

---

## 維護與部署

### 日誌記錄
- 批次匯入操作記錄
- 錯誤詳情記錄
- 效能監控資料

### 資料備份
- 定期資料庫備份
- 附件檔案備份
- 匯入檔案保存

### 版本更新
- 資料庫遷移
- 新功能相容性
- 前端資產更新

此文件涵蓋了整個 Post 管理系統的架構與實作細節，可作為開發與維護的參考指南。
