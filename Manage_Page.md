# Manage Page 規範

此文件提供專案後台（Manage）介面每個管理頁面的詳細設計與實作規範。依循專案整體架構：Laravel 11 後端、Inertia.js + React（TypeScript）前端、Tailwind CSS 做樣式。目標是定義清楚的路由、Controller、Model 關聯、授權（Policy）、前端 props 接口、UI 欄位、篩選/排序/分頁、表單驗證與測試案例。

每個管理頁面章節都包括：
- 概要 (what)
- 路由（routes/manage.php）
- Controller（方法名、輸入/輸出）
- Model / 關聯建議
- Policy / 授權規則
- 前端 Page 組件與主要子元件
- props 範例（Inertia）
- 列表頁功能（欄位、篩選、排序、分頁、批次操作）
- 編輯/建立表單（欄位、驗證、文件上傳處理）
- 邊界情況與錯誤處理
- 測試建議（後端 PHPUnit、前端 Jest + RTL）

---

## 通用規則（Manage 頁面）
- 所有 Manage 路由放於 `routes/manage.php`，並套用 `auth` 與 `role:admin|manager` 中介層。
- Controller 應使用 Resource Controller 命名慣例（index, create, store, show, edit, update, destroy）。
- 所有列表 API 採用 cursor 或 offset-based 分頁（專案偏好 offset 分頁搭配 Eloquent 的 paginate）。
- 列表預設每頁 15 條；允許 query param `per_page`（max 200）。
- 授權：使用相應 Model Policy（如 `UserPolicy`, `PostPolicy`），Controller 在 entry points 呼叫 `authorize()`。
- 前端 props 應儘量簡潔：`{ data: CollectionResource, filters, meta, translations }`。
- 所有檔案上傳採用 Storage disk（`public`），必要時啟用 virus-scan（若環境支援）。

---

## 1. Users 管理
概要：管理平台使用者帳戶、角色分配、啟用/停用

路由（manage.php）:
- GET /manage/users -> UserController@index
- GET /manage/users/create -> UserController@create
- POST /manage/users -> UserController@store
- GET /manage/users/{user}/edit -> UserController@edit
- PUT/PATCH /manage/users/{user} -> UserController@update
- DELETE /manage/users/{user} -> UserController@destroy
- POST /manage/users/{user}/impersonate -> UserController@impersonate (optional)

Controller 要點：
- Index: 接收 filters (q, role, status, created_from, created_to), sort, per_page
- Store/Update: validation（name, email unique, password nullable on update）
- Destroy: 檢查是否為最後一位 admin、回收使用者關聯資料或標記 soft delete

Model 關聯：User hasMany Posts, Announcements, etc.

Policy：UserPolicy 管控 viewAny, view, create, update, delete, impersonate

前端 Page 與子元件：
- `pages/manage/users/index.tsx`（列表）
- `pages/manage/users/edit.tsx`（編輯/建立共用）
- `components/manage/users/UserTable.tsx`
- `components/manage/users/UserForm.tsx`

props 範例（index）:
{
  data: UserResource::collection($users),
  filters: ['q' => '', 'role' => '', 'status' => ''],
  meta: $users->toArray()
}

列表欄位：ID, Avatar, Name, Email, Role, Status (active/disabled), Created At, Actions
功能：搜尋（q 搜 name/email）、角色篩選、多選批次刪除/匯出、切換啟用狀態、分頁

表單欄位（create/edit）：
- name (required)
- email (required, email)
- roles (multi-select)
- password (required on create, nullable on update, confirmation)
- status (active/disabled)

驗證：Laravel FormRequest

測試建議：
- create/update/delete 的 feature tests（含 role 認證）
- 前端表單錯誤渲染與 submit 行為

---

## 2. Posts / Announcements 管理
概要：公告與文章管理（含分類、發佈狀態、排程）

路由：Resource routes /manage/posts

Controller 要點：
- 支援 rich content（存 raw HTML 或 Markdown + sanitizer）
- 支援 featured image, attachments
- 發佈流程：draft / published / scheduled (publish_at)

Model 關聯：Post belongsTo User (author), belongsTo PostCategory, hasMany Attachment

Policy：PostPolicy 控制 create/update/delete/publish

列表功能：
- 欄位：ID, Title, Category, Author, Status, Published At, Views, Actions
- 篩選：category, status, author, date range
- 搜尋：title/content
- 批次操作：publish, unpublish, delete

表單（create/edit）：
- title (required)
- slug (optional auto-generate)
- category_id
- excerpt
- content (rich text) -> sanitize and optionally store delta or HTML
- featured_image (upload)
- attachments (multiple)
- publish_at (datetime nullable)
- tags (optional)

驗證：title required, content required

測試：
- publish flow, scheduled publish, draft saving
- attachment upload handling

---

## 3. Teachers / Staff 管理
- 概要：教職員資料、頭像、職稱、聯絡方式、個人連結與簡介
- Model：Teacher (name, title, email, phone, bio, avatar, links json)
- 列表欄位：avatar, name, title, unit, show_on_site, order
- 表單：name, title, email, phone, bio (rich text or plain), avatar upload, links（array）
- Policy：StaffPolicy
- 功能：拖放排序、匯入/匯出 CSV

測試：CRUD, avatar upload, ordering

---

## 4. Labs 管理
- 概要：實驗室頁面、負責人、成員、研究方向、相關出版物
- Model：Lab (name, slug, lead_id, description, cover_image)
- 關聯：Lab hasMany Members (Teacher), hasMany Projects, hasMany Publications
- 列表：name, lead, members_count, actions
- 表單：name, lead, description, cover_image, tags
- Policy：LabPolicy

測試：CRUD, lead assigned, members sync

---

## 5. Courses 管理
- 概要：課程資訊、學分、負責教師、上課語言
- Model：Course (code, title, credits, semester, instructor_id, description)
- 列表：code, title, credits, instructor, actions
- 表單：code, title, credits (number), semester (enum), instructor select, description

測試：CRUD, uniqueness of code

---

## 6. Attachments 管理
- 概要：管理上傳的檔案（資料庫 Attachment 模型）
- 欄位：id, filename, disk_path, mime_type, size, uploaded_by, attached_to_type, attached_to_id
- 功能：列表、搜尋、刪除、下載、批次刪除
- 安全性：只允許下載公開/authorized 的檔案，private 檔案需經授權

測試：upload rules, download authorization, cleaning orphaned files

---

## 7. Settings / Site Config 管理
- 概要：站台全域設定（site title, footer, theme colors, social links）
- 實作：單一列（singleton）設定或 key-value 表
- UI：分頁式設定（General, Appearance, Social, Mail）
- 表單：多種 input types（text, textarea, file, color, toggle）
- Policy：SettingsPolicy，僅 admin 可編輯

測試：save/load settings, file upload for logo

---

## 8. Users Roles & Permissions（若有）
- Model：Role, Permission（或使用 Spatie package）
- UI：角色管理、權限分配表單（checkbox matrix）
- 安全：不可 remove 所有 admin role，變更須有 audit log

測試：role CRUD, permission enforcement

---

## 9. Audit Logs / Activity
- 概要：系統操作記錄（誰做了什麼、何時、目標）
- Model：AuditLog (user_id, action, target_type, target_id, changes json, ip)
- UI：過濾（user, action type, date range）、查看變更內容
- 保留策略：60-180 天或依系統需求

測試：log created on create/update/delete

---

## 10. Bulk Import / Export
- 支援 CSV 匯入（users, teachers, courses）並在背景 job 處理
- 匯入結果需產生 report（成功/失敗行與原因）
- 匯出支援過濾條件

測試：large import, error handling, resume/cancel

---

## 測試策略總結
- 後端：Feature tests 覆蓋 CRUD、授權、validation、檔案處理與 background jobs
- 前端：Jest + RTL tests 覆蓋主要 Page snapshot、表單互動（含 error flow）
- E2E（選用）：Playwright/Cypress 驗證常見使用情境（登入、建立內容、刪除）

---

## 範例：Posts Index Controller Pseudocode
```php
public function index(Request $request)
{
    $this->authorize('viewAny', Post::class);

    $query = Post::with('author', 'category');

    if ($request->filled('q')) {
        $query->where('title', 'like', '%'.$request->q.'%');
    }

    if ($request->filled('category')) {
        $query->where('category_id', $request->category);
    }

    $posts = $query->orderBy($request->get('sort', 'created_at'), $request->get('direction', 'desc'))
        ->paginate($request->get('per_page', 15));

    return Inertia::render('manage/posts/index', [
        'data' => PostResource::collection($posts),
        'filters' => $request->only(['q', 'category', 'status']),
        'meta' => $posts->toArray(),
    ]);
}
```

---
