# manage 管理頁面詳細規劃

## 0. 核心原則與整體架構
- 以 `AppLayout` → `ManageLayout` → `ManagePage` → 專屬模組為層次，維持 components/layouts/pages 的分層；共通 UI 盡量放在 `resources/js/components/manage` 與 `resources/js/layouts/manage`。
- 後端統一建立 `App\\Http\\Controllers\\Manage` 命名空間，使用 RESTful controller + FormRequest 驗證 + Policy 授權，搭配 Inertia response 傳遞資料。
- 透過 `pageRole` 與 `pageSection` props 控制前端畫面，`pageSection` 將對應到一個 section component map（見 1.3），避免 `ManageDashboardPage` 腫脹。
- 一切資料操作採用 Laravel Resource route (`index/create/store/edit/update/destroy`) 或自訂 action (ex: `bulkUpdateStatus`)，並在前端建立對應 service hook (`resources/js/services/manage`)，集中 axios/fetch 呼叫。
- 所有表單/表格狀態管理預設走 React hook + Inertia form helper (`useForm`)，列表使用 shadcn/ui Table，視情況拆分成 `List`, `Toolbar`, `Dialog` 組件。

## 1. 共通前端元素
- 建立 `resources/js/pages/manage/__shared/section-map.ts`，輸出 `{ [key: string]: LazyExoticComponent }`，由 `dashboard.tsx` 依 `pageSection` 動態載入；提供 loading + fallback (未授權/尚未完成)。
- 產生 `resources/js/pages/manage/__shared/useManageSection.ts` hook，封裝 `usePage` 取得 `pageRole/pageSection/filters/pagination` 等通用 props。
- 建立 `resources/js/pages/manage/__shared/section-shell.tsx` 作為 section 容器，統一處理標題、動作列、錯誤態、空資料態、loading skeleton。
- Sidebar 導航資料與 section map 保持同步：調整 `ManageSidebarMain` 參考共用設定檔 `resources/js/lib/nav-items.ts`，避免重複定義路徑與標題。
- 全域訊息/錯誤處理：沿用現有 toast 機制，另在 `ManageLayout` 注入 `flash` 訊息展示。

## 2. 儀表板（/manage/dashboard）
- 規劃 `DashboardOverviewSection` 組件，根據 `pageRole` 顯示對應卡片：`admin` → 系統統計、佈告草稿；`teacher` → 課程/實驗室待辦；`user` → 最近公告、個人資料進度。
- 後端 `DashboardController@index` 聚合所需統計（近期公告數、訊息數、待審核件數、個人設定完成度），資料透過 Transformer （`app/Http/Resources/Manage/DashboardResource`）。
- 建立 `DashboardActivity` 子組件，用於顯示最近活動 timeline，未來可接 WebSocket/輪詢。
- 加上 Quick Actions 區塊（依角色顯示 `建立公告`、`上傳附件`、`編輯個人檔案` 等），並透過 Sidebar Quick link 導向。

## 3. 管理員專區（role: admin）
### 3.1 公告管理（/manage/posts）
- 路由：`Route::resource('posts', Manage\\PostController::class)`；額外 `POST /manage/posts/bulk-status`。
- Controller：`index` 提供篩選（分類/狀態/日期）、`store/update` 依 FormRequest 驗證（標題、時程、附件、標籤）、`destroy` 軟刪除、`restore` 自訂 action。
- 前端：建立 `resources/js/pages/manage/admin/posts/index.tsx`、`create.tsx`、`edit.tsx`，並將表單抽象成 `PostForm` component，整合 RichText 編輯器、附件上傳區塊（ reuse `AttachmentUploader`）。
- 列表支援：排序、關鍵字搜尋、批次操作（改狀態/刪除）、多語欄位顯示（繁中/英文），空態提供建立按鈕。
- 測試：Feature test 覆蓋授權（只有 admin/teacher 可 CRUD），表單驗證、附件同步、標籤 pivot 更新。

### 3.2 標籤管理（/manage/tags）
- 建立 `Manage\\TagController` + `TagRequest`，支援 CRUD + 合併（merge）/分裂（split）操作。
- 表格顯示使用次數、最後使用時間，支援快速編輯（inline edit）與啟用/停用 flag。
- 前端：`resources/js/pages/manage/admin/tags/index.tsx` 與 `TagDialog`；整合菁英功能（ex: 批次刪除前顯示關聯異動數）。
- 除錯：提供 `TagUsagePreview`，顯示受影響的公告列表連結。

### 3.3 使用者管理（/manage/users）
- Controller：`Manage\\UserController` 搭配 `UserFilter`, `UserRequest`；提供 `index`（篩選角色/狀態/關鍵字）、`updateRole`, `impersonate`, `resetPasswordLink` 等自訂 action。
- 前端：`resources/js/pages/manage/admin/users/index.tsx`，拆分 `UserList`, `UserFilters`, `UserActions`，支援 `InfiniteScroll` 或分頁。
- 詳細視窗（drawer/dialog）顯示個人資訊、角色、登入紀錄；可變更角色 (多選) 與發送通知。
- 整合 `ContactMessage` 及 `SupportTicket`（若有），顯示使用者互動紀錄。

### 3.4 附件資源（/manage/attachments）
- Controller：`Manage\\AttachmentController`，支援列表、上傳、重新命名、標記、刪除、下載簽章。
- 規劃使用 Laravel `Storage` + Signed URL，支援多檔上傳、拖放排序、metadata 編輯。
- 前端：`resources/js/pages/manage/admin/attachments/index.tsx`，提供 grid/list 切換、檔案預覽（圖片/PDF/音訊）、分類/標籤篩選。
- 實作批次操作（下載、移動、刪除），並顯示儲存空間使用情況。

### 3.5 聯絡表單（/manage/messages）
- Controller：`Manage\\MessageController` (模型 `ContactMessage`)；提供 `index`, `show`, `updateStatus`, `reply`。
- 前端：`resources/js/pages/manage/admin/messages/index.tsx`，以 mailbox layout 呈現，新舊排序、狀態標籤（new/processing/done）。
- `MessageDetailPanel` 顯示內容、附件、回覆歷程；回覆表單支援 Markdown，並呼叫 `Notification` 服務寄信。
- 加入快速標籤（ex: admissions, lecture, funding），便於分類。

## 4. 教師專區（role: admin|teacher）
### 4.1 教師公告（共用 /manage/posts）
- Teacher 與 Admin 共用 `PostController`，但權限限制為自己建立的公告；前端 reuse admin 頁面，但透過 props 控制可操作欄位（無法修改他人公告，少部分欄位只讀）。
- 新增 `PostPolicy` 驗證 teacher 只能 CRUD 自己負責分類。

### 4.2 實驗室管理（/manage/labs）
- Controller：`Manage\\LabController` (模型 `Lab`)；功能：列表、編輯多語欄位、關聯教師、實驗室成員。
- 前端頁面 `resources/js/pages/manage/teacher/labs/index.tsx` + `LabForm`；支援拖拉調整排序、上傳展示圖片、設定公開與否。
- 提供 `LabMembersSection`，可新增/移除成員（引用 `User` 模型）。

### 4.3 研究計畫（/manage/projects）
- Controller：`Manage\\ProjectController`；支援 CRUD、年份/類別/主持人篩選、檔案附件。
- 前端：`resources/js/pages/manage/teacher/projects/index.tsx`，使用 timeline 或 card layout，提供年度群組。
- 評估與 `Project` 模型關聯 `Publication` 或 `Attachment`，並在 UI 展示。

## 5. 會員 / 一般使用者專區（role: user）
- 共用 Dashboard 但顯示個人化 KPI：最近公告、個人資料完成度、支援票案件數。
- `Manage\\SupportPage` 提供 FAQ + 建立支援單表單（若暫未有後端，可先 stub）；成功提交後顯示 ticket 狀態。
- 提供 `ProfileSummary` 卡片，引導快速前往設定（profile/password/appearance）。

## 6. 帳號設定 (settings.*)
### 6.1 Profile（/manage/settings/profile）
- Controller：`Manage\\Settings\\ProfileController@edit/update`；使用 `UserProfile` 模型 + `UserProfileRequest`。
- 表單包含：基本資料、職稱、聯絡方式、社群連結（使用 `UserProfileLink`）、頭像上傳（avatar crop）。
- 前端頁面 `resources/js/pages/manage/setting/profile.tsx`（命名統一為 `resources/js/pages/manage/setting/profile.tsx`），拆分 `ProfileForm`, `SocialLinksForm`, `AvatarUploader`。

### 6.2 Password（/manage/settings/password）
- Controller：`Manage\\Settings\\PasswordController`；使用 Laravel 密碼驗證規則，支援強度提示。
- 前端：`resources/js/pages/manage/setting/password.tsx` + `PasswordStrengthMeter`，整合 `useForm`、顯示成功/錯誤 toast。

### 6.3 Appearance（/manage/settings/appearance）
- Controller：`Manage\\Settings\\AppearanceController`；儲存主題、語系、介面偏好（儀表板卡片排序）。
- 前端：`resources/js/pages/manage/setting/appearance.tsx`；使用現有 `AppearanceTabs` 與 `FloatingSettings`，增加 preview 區塊；變更時即時更新 `localStorage` 並同步到後端。

## 7. 支援中心（/manage/support）
- Controller：`Manage\\SupportController@index/store`；`index` 提供 FAQ, `store` 建立支援請求（資料表 `contact_messages` 或新 `support_tickets`）。
- 前端：`resources/js/pages/manage/user/support.tsx`；採兩欄布局（左側 FAQ accordion，右側支援單表單），送出後顯示 ticket 編號與預估回覆時間。

## 8. 後端 API 與資料層實作
- 建立 `app/Http/Controllers/Manage` 目錄，下分 `Admin`, `Teacher`, `Settings`, `Support` 子命名空間；共用基底 `ManageController`（注入 `AuthorizesRequests`、`ValidatesRequests`）。
- 導入 FormRequest：`Manage/PostRequest`, `Manage/TagRequest`, `Manage/UserRequest`, `Manage/AttachmentRequest`, `Manage/MessageReplyRequest`, `Manage/Settings/ProfileRequest` 等。
- 建立 `app/Policies` 內的 `PostPolicy`, `AttachmentPolicy`, `UserPolicy`, `LabPolicy`, `ProjectPolicy`, `ContactMessagePolicy`，於 `AuthServiceProvider` 綁定。
- 資料回傳統一透過 `JsonResource`：`Manage/PostResource`, `Manage/UserResource`, `Manage/AttachmentResource`, `Manage/ContactMessageResource`, `Manage/LabResource`, `Manage/ProjectResource`, `Manage/DashboardResource`。
- 列表查詢封裝成 `QueryBuilder` scope (`app/Models/Scopes/Manage`)，例如 `Post::query()->forManage($filters)`，提高重用性。

## 9. 權限、審核與測試
- 使用 Laravel `role` middleware + Policy；新增 `role` middleware 組態以支援 `role:admin,teacher`。
- Feature tests：
  - Dashboard：依角色回傳正確統計。
  - Posts/Tags/Users/Attachments/Messages CRUD + 權限。
  - Settings 更新／支援單建立。
- 前端測試：採用 Jest/RTL 對關鍵表單與 section map 進行渲染測試、互動測試。
- E2E（可用 Laravel Dusk 或 Playwright）覆蓋核心流程：建立公告、上傳附件、更新個人資料。

## 10. 里程碑與優先順序
1. 建立後端 Manage namespace、Section map 基礎、Dashboard props（Sprint 1）。
2. 行政功能（Posts/Tags/Users/Attachments/Messages）核心 CRUD 與 UI（Sprint 2-3）。
3. 教師專區（Labs/Projects + 共享 Posts 權限細緻化）（Sprint 4）。
4. 設定頁面與支援中心（Sprint 5）。
5. 整體優化：國際化、可用性測試、前端單元測試補強（Sprint 6）。
6. 文檔與維運：更新 `.docs/ARCHITECTURE.md`、撰寫手冊、建立監控告警（持續任務）。
