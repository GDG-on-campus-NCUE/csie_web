# manage 管理頁面詳細規劃

## 0. 核心原則與整體流程
- 保持 `AppLayout → ManageLayout → ManagePage → FeatureComponent` 的層級分工；頁面只負責資料取得與掌控權限，布局只處理排版、元件只專注於視覺。
- 前後端命名一致：Laravel 採 `App\\Http\\Controllers\\Manage` + `App\\Http\\Resources\\Manage` + `App\\Http\\Requests\\Manage`，對應前端 `resources/js/pages/manage/<domain>`。
- 所有列表預設採用後端分頁（LengthAwarePaginator），封裝為 `usePaginatedResource` hook，統一處理換頁、排序、分頁狀態同步，並在 UI 顯示分頁控制（上一頁/下一頁/跳頁）。
- 統一以 `Tag` 模組維護標籤，任何表單涉及標籤都透過同一個多選組件與 `/manage/tags/options` API，避免重複定義。
- 共用的 Rich Text/附件/日期挑選器皆獨立成組件，並在表單中統一使用 `useForm` + schema 驗證（Zod + server-side FormRequest）。

## 1. 共通基礎建設
### 1.1 共用檔案與工具
- [x] `resources/js/lib/manage/api-client.ts`：包裝 axios instance、統一錯誤處理與 CSRF。
- [x] `resources/js/hooks/manage/use-paginated-resource.ts`：接受 `{ route, params }`，回傳 `data, meta, onPageChange, onFilterChange`。
- [x] `resources/js/components/manage/manage-page-header.tsx`：標題、副標題、麵包屑、工具列統一樣式。
- [x] `resources/js/components/manage/table-empty.tsx` 與 `table-loading.tsx`：列表空態、載入態共用。

### 1.2 共用資料結構與型別
- [x] `@/types/manage/index.d.ts` 增加 `PaginationMeta`, `FilterOption`, `TagOption` 型別。
- [x] 擴充 `@/types/shared` 的 `SharedData`，加入 `flash`, `abilities`, `spaces` 基礎資料。
- [x] `resources/js/lib/manage/sidebar-nav-groups.ts` 改由常數檔 `nav-config.ts` 餵入，保持導航與權限一致。

### 1.3 表單元件庫
- [x] `resources/js/components/manage/forms/`：建立 `FormSection`, `FormField`, `FormActions`，整合 label、錯誤、說明文字。
- [x] `TagMultiSelect`：支援搜尋、顯示使用次數、可直接新建（綁定 `/manage/tags`）。
- [x] `AttachmentUploader`：支援多檔、排序、預覽、刪除，並回傳附件 ID 清單。

## 2. 儀表板（/manage/dashboard）
### 2.1 後端
- [x] `DashboardController@index`：依角色回傳 `metrics`, `activities`, `quickLinks`, `personalTodos`。
- [x] 建立 `DashboardMetricService` 彙整公告、標籤、附件、space 使用狀況。
- [x] Resource：`DashboardResource` 格式化數據、日期、連結 URL。

### 2.2 前端
- [x] `resources/js/pages/manage/admin/dashboard.tsx`：拆為 `OverviewCards`, `RecentActivities`, `QuickActions` 子元件。
- [x] 使用 `useTranslator('manage.dashboard')` 提供欄位字典。
- [x] 卡片資料：公告總數/草稿/排程、使用者註冊數、空間使用率（space usage）。
- [x] 活動列表顯示 `title`, `status`, `timestamp`, `actor`，提供載入更多。
- [x] Quick Actions 依能力顯示按鈕（建立公告、邀請教師、上傳附件、連結 Space 資源）。

## 3. 管理員模組（role = admin）
### 3.1 公告管理（/manage/admin/posts）
#### 3.1.1 資料與 API
- [x] `Post` 模型加入 `excerpt`, `published_at`, `visibility`, `space_id` 欄位。
- [x] 附件 morph type 資料清理（統一別名與遷移腳本）。
- [x] `Manage\PostController`：
	- [x] `index`
	- [x] `store`
	- [x] `update`
	- [x] `destroy`
	- [x] `restore`
	- [x] `bulk`
- [x] 篩選參數：`keyword`, `status`, `tag`, `category`, `publisher`, `published_between`。

#### 3.1.2 列表頁
- [x] 表格欄位：標題、分類、狀態、標籤、建立者、最後更新、瀏覽次數。
- [x] Toolbar：搜尋框（debounce）、狀態篩選、標籤篩選、批次操作下拉（發佈 / 封存 / 刪除）。
- [x] 支援多選列；在下方顯示分頁（每頁 10 筆），提供跳頁輸入框。
- [x] 空態卡片：提示尚無公告，提供「立即新增」。

#### 3.1.3 建立/編輯表單
- [x] 表單欄位：`title`, `title_en`, `slug`, `status`, `published_at`, `category_id`, `tags[]`, `space_id`, `summary`, `content`, `attachments[]`。
- [x] 驗證：標題必填、slug unique、已排程需 `published_at`、附件限制 10 個。
- [x] RichText 區塊整合 `sanitizeRichText`，顯示字數統計；附件區顯示已上傳檔案 chip。
- [x] 標籤選擇：整合 `TagMultiSelect` 與常用標籤推薦，補充手動新增輸入欄位。
- [x] 提供「儲存草稿」、「預覽」、「發佈」三個動作按鈕，按鈕停用狀態依提交中更新。

#### 3.1.4 詳細頁（show）
- [x] 顯示標題、狀態 badge、發佈資訊、標籤列表、連結 Space 資源摘要。
- [x] 附件列出可下載連結 + 檔案大小 + 標籤。
- [x] 歷程區塊：顯示最近 5 筆更新紀錄（人員、時間、變更摘要）。

#### 3.1.5 測試
- [x] Feature：
	- [x] 建立成功（含附件/主圖）
	- [x] 更新成功（含附件保留/移除）
	- [x] 批次操作
	- [x] 未授權阻擋
	- [x] 標籤同步詳測
- [ ] Dusk/Browser：建立公告流程、表單錯誤顯示、擷取成功提示。

### 3.2 標籤管理（/manage/admin/tags）
- [x] 列表欄位：名稱（中英）、使用次數、最後使用、狀態（啟用/停用）。
- [x] 篩選：依模組（公告/附件/space）、狀態、關鍵字。
- [x] 新增/編輯 Modal：欄位 `name`, `name_en`, `description`, `color`。
- [x] Merge 功能：選擇多個標籤 → 指派新的保留標籤 → 顯示受影響筆數確認。
- [x] Split 功能：以逗號分隔快速建立多個標籤，並選擇原標籤是否保留。
- [x] 前端提供即時搜尋結果 + 錯誤提示；後端建立對應 Action + 事件紀錄。

### 3.3 使用者管理（/manage/admin/users）
- [ ] 列表欄位：姓名、Email、角色、狀態、最近登入、所屬 Space。
- [ ] 篩選：角色（多選）、狀態、關鍵字、space。
- [ ] 支援分頁、排序（姓名、註冊時間、登入時間）。
- [ ] 詳細抽屜：基本資料、角色管理、多重 Space 授權、最近 10 次活動。
- [ ] 角色編輯表單：checkbox 群組 + 儲存按鈕。
- [ ] Actions：重設密碼連結、模擬登入 (impersonate)、停權/啟用。
- [x] 後端：`Manage\\UserController` + `UserFilter` + `UpdateRoleRequest` + Audit log。

### 3.4 附件資源（/manage/admin/attachments）
- [x] 資料表新增 `space_id`, `tags`, `description` 欄位。
- [ ] 列表支援 Grid/List 切換；欄位有縮圖、檔名、大小、標籤、綁定 Space、建立者。
- [x] 篩選：檔案類型、標籤、space、日期。
- [ ] 批次操作：下載、改標籤、移轉 Space、刪除。
- [ ] 上傳流程：拖放區 + 進度條 + 失敗重試；成功後可直接編輯名稱/備註。
- [ ] Detail Drawer：顯示檔案預覽、metadata、引用紀錄（哪篇公告使用）。

### 3.5 公告留言/聯絡表單（/manage/admin/messages）
- [x] 列表欄位：主旨、發送者、Email、狀態（新訊息/處理中/已結案）、提交時間。
- [x] 內有分頁、狀態篩選、關鍵字搜尋。
- [x] 詳細視窗：顯示訊息內容、附件、處理紀錄，提供回覆與更改狀態表單。
- [x] 後端：`Manage\MessageController` 完成列表/篩選/統計（`MessageReplyController` 待補強處理歷程）。

### 3.6 啟動稽核與記錄
- [ ] 所有敏感操作（公告發佈、標籤合併、user 角色變更）觸發 `ManageActivity` log。
- [x] `resources/js/components/manage/activity-timeline.tsx` 顯示最新 20 筆記錄。

## 4. 教師模組（role = teacher）
### 4.1 教師公告/課程管理
- [ ] 列表欄位：標題、狀態、課程分類、最後更新。
- [ ] 表單欄位：課程名稱、受眾、開始/結束時間、附件、標籤、Space 連結（教師個人教學空間）。
- [ ] 提供「複製公告」與「快速發佈」功能。
- [ ] 分頁 + 篩選課程、狀態、標籤。

### 4.2 實驗室模組
- [ ] 列表顯示每個實驗室：名稱、領域、負責老師、學生名單、Space 連結。
- [ ] 表單欄位：`name`, `field`, `description`, `members[]`, `space_id`, `tags[]`, `public_url`。
- [ ] 成員管理使用多選清單 + 搜尋；提供批次邀請。

### 4.3 研究計畫
- [ ] 列表欄位：計畫名稱、主持人、期間、經費、狀態。
- [ ] 表單欄位：`title`, `title_en`, `funding_source`, `amount`, `start_at`, `end_at`, `summary`, `attachments`, `tags`, `space_id`。
- [ ] 顯示計畫文件下載、相關公告連結。

## 5. 一般使用者模組（role = user）
### 5.1 個人主頁（/manage/user/dashboard）
- [ ] 卡片：進度檢核（個人資料完整度、Space 資源綁定、待回覆訊息）。
- [ ] 最近的公告列表，支援標籤篩選與書籤功能。

### 5.2 個人資料（/manage/settings/profile）
- [ ] 表單欄位：姓名、英文姓名、暱稱、Email（唯讀）、連絡電話、學號/員工編號、職稱、頭像上傳、語系、時區。
- [ ] 使用 `AvatarUploader` 支援裁切預覽；變更語系後觸發重新整理。
- [ ] 變更歷程顯示最近 5 次修改。
- [ ] 後端：`ProfileController@update` + `UpdateProfileRequest`。

### 5.3 安全設定（/manage/settings/password`、`/manage/settings/security`）
- [ ] 表單欄位：舊密碼、新密碼、確認；顯示密碼強度指標。
- [ ] 顯示登入紀錄列表（裝置、IP、時間）；提供登出其他裝置按鈕。

### 5.4 外觀設定（appearance）
- [ ] 控制主題（淺/深）、字體大小、側欄固定選項；儲存在 user preferences。

### 5.5 Space 資源綁定
- [ ] 使用者可將帳號綁到一或多個 Space（如雲端資料夾/課程空間）。
- [ ] 表單欄位：`space_id`, `role`, `access_level`, `sync_options`（自動同步附件/公告）。
- [ ] 列表顯示目前綁定的 Space、權限、同步狀態，提供斷開/重新同步按鈕。
- [ ] 後端：`Manage\\UserSpaceController` 實作 `index`, `store`, `destroy`, `sync`。

## 6. 支援頁面（Support）
- [ ] 常見問題 (FAQ) 列表：分類、問題、狀態、排序。
- [ ] 支援單表單：欄位 `subject`, `category`, `priority`, `message`, `attachments[]`, `tags[]`。
- [ ] 工單詳情：交流紀錄、狀態更新、標籤、相關 Space 資源連結。

## 7. 通知與整合
- [ ] 實作通知中心：顯示系統提醒、支援標記已讀、分頁。
- [ ] Webhook/Email 觸發：公告發佈、Space 同步失敗、帳號權限變更。
- [ ] `NotificationPreference` 表單：使用者可勾選接收頻道（Email、App、LINE Bot）。

## 8. 測試策略與品質保證
- [ ] 每個模組至少具備 Feature 測試（授權 + 主要流程）與 FormRequest 單元測試。
- [ ] 前端使用 `@testing-library/react` 為關鍵元件撰寫互動測試（表單提交流程、分頁、篩選）。
- [ ] E2E 改用 Laravel Dusk 或 Playwright（擇一），覆蓋公告 CRUD、標籤合併、user 編輯 profile、Space 綁定流程。
- [ ] 建立 CI 工作流程：`npm run lint`, `npm run types`, `npm run test`, `phpunit`。

## 9. 發布與維運
- [ ] 撰寫資料遷移計畫：新增欄位（space_id、published_at……）、預填預設資料。
- [ ] 初始化 Seeder：建立預設標籤、Space 種子資料、測試帳號。
- [ ] 建立操作手冊：後台使用指南、常見錯誤排除流程。
- [ ] 監控指標：公告發佈失敗率、Space 同步狀況、API 錯誤通知。
