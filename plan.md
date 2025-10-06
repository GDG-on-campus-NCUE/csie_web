# Manage 後台全面改善藍圖

> 依據 `.docs/ARCHITECTURE.md`、`.docs/UI_DESIGN_GUIDELINES.md` 與 `.docs/manage/ui.md`，統整現有架構與痛點，提出可執行的 UI/UX 與後端調整計畫，優先處理管理介面與響應式體驗，確保行動裝置改採卡片呈現、不再出現水平捲動。

## 1. 現況盤點

### 1.1 架構概述
- 前端頁面位於 `resources/js/pages/manage/**`，透過 `ManagePage` → `ManageMain` → 功能模組組成版面，並由 `components/manage` 提供共用元件。
- 側邊欄、麵包屑、快速導覽由 `manage-sidebar-*`、`manage-quick-nav.tsx` 等控制；頁面主要資料透過 Inertia response (`SharedData`) 注入。
- UI 元件以 `components/ui` 設計系統為基礎，搭配 `lib/shared` 與 `lib/manage` 的工具函式處理格式化與資料轉換。
- 權限控管透過 Laravel Policy 與前端 `can()` helper，教師管理頁面尚未曝光。

### 1.2 後端資料流
- Laravel controller / repository 回傳 `Manage*ListResponse` 類型（定義於 `@/types/manage`），包含 `data`, `meta`, `links`, `filters`、`statusSummary` 等欄位。
- 批次操作（匯出、刪除、狀態更新）各自提供 route，但回傳欄位未一致對齊行動版卡片所需資訊（缺少摘要、連絡資訊、翻譯鍵）。
- 目前缺少欄位 metadata 或排序規則，前端需手動定義欄位寬度與顯示方式。

### 1.3 主要痛點
- 按鈕色彩與排版缺乏統一（例如公告、標籤頁仍使用 `variant="tonal"`）。
- RWD 經驗不一致：多數列表僅提供表格且在手機出現水平捲動；工具列在窄螢幕會溢出。
- 缺少行動版批次操作流程（選取列後沒有合適的操作容器）。
- 多語系文字與日期格式化在部分頁面採用硬寫文字或 `new Date()`。
- 文件維護沒有共識，plan.md 與 UI 指南更新不同步，導致執行落差。

## 2. 改善策略總覽

### 2.1 UI / UX 規範（詳見 `.docs/manage/ui.md`）
- 建立標準按鈕群組、卡片樣式與排版節奏，所有頁面必須套用。
- 建議新增 `ManageToolbar` 元件，負責行動版垂直排列與桌機水平排列。
- 推動統一的 `ResponsiveDataView` 元件，桌機渲染表格、行動裝置渲染卡片。
- 定義色彩語意（Primary / Success / Warning / Danger / Neutral）與陰影層級，連動到 `tailwind.config.cjs` token。
- 規範互動狀態：Hover、Focus、Disabled、Loading 均需有視覺回饋。

### 2.2 響應式資料呈現
- 列表型頁面依欄位重要性建立 metadata，桌機顯示全部、平板顯示主要欄位、手機採卡片。
- 卡片內固定呈現：標題、狀態、更新時間、摘要描述、主要操作按鈕；次要資訊放置在折疊區。
- 盤點所有批次操作路徑，統一以底部固定操作列呈現（手機），並提供取消/確認按鈕與 Toast。
- 針對資料量較大頁面（Messages、Attachments）加入無限捲動或分頁固定操作列。

### 2.3 後端配合
- 調整 API 回傳，新增 `summary`, `badges`, `actions` 欄位支援卡片模式；提供 `availableBulkActions` 供前端決定是否顯示。
- 提供欄位 metadata API（欄位鍵、標籤、顯示優先度、支援裝置、翻譯 key）。
- 在 `Manage*Policy` 中補齊新動作的授權判斷，供前端讀取。

### 2.4 專案治理
- 建立「UI 變更提交流程」，涉及 `manage` 頁面的 PR 必須連結設計稿與計畫項目。
- 與 QA、設計、後端建立雙週同步，確認落地順序與阻塞點。
- 所有核銷格需於 PR 說明中勾選並附上截圖或 API Schema 更新連結。

## 3. 里程碑與任務清單

> 時程預估 5 週，依難度與依賴順序安排。每個任務皆附核銷格，完成後需於 PR 描述勾選。

### Milestone A — 基礎規範與共用元件（Week 1）
- [x] 補齊 `.docs/manage/ui.md`：新增色票、按鈕尺寸、Spacing 圖表、範例截圖流程。
- [x] 建立 `@/components/manage/manage-toolbar.tsx`：支援 `orientation="horizontal" | "vertical"`、自動在 `<md` 切換；撰寫 Storybook 範例。
- [x] 建立 `@/components/manage/responsive-data-view.tsx`：提供 `table`, `card` render props、`breakpoint`、`stickyActions`，並含骨架載入狀態。
- [x] 擴充 `components/manage/data-card.tsx`：支援標題、狀態、主內容 slots、行動版操作列，並提供 `badgeColor` 設定。
- [x] 更新 `components/manage/table-empty.tsx` 與 `table-loading.tsx`，加入 icon 與說明文字 props，統一尺寸。
- [x] 寫成 `MIGRATION_GUIDE.md` 草稿，指引舊頁面如何套用新元件。

### Milestone B — 頁面 UI 對齊（Week 2）
- [x] `manage/admin/posts`：套用新按鈕配色、ResponsiveDataView、Mobile 卡片；補齊篩選器的自動換行。
- [x] `manage/admin/tags`：重構工具列與對話框，確保表單 spacing 與行動版操作；補上標籤顏色選擇器預覽。
- [x] `manage/admin/messages` 與 `manage/admin/attachments`：比照最佳實踐，萃取共用卡片與批次操作流程；加入附件縮圖。
- [x] `manage/admin/dashboard`：調整活動列表 hover/empty 狀態、語意色彩，補上關鍵 KPI 卡片。
- [x] `manage/admin/users`：工具列改用 `ManageToolbar`，行動版新增卡片摘要顯示（角色、狀態、最後登入）。
- [x] 追蹤舊樣式（tonal button 等）並清單化遺留項目供後續清理（詳見 `.docs/manage/legacy-style-tracker.md`）。

### Milestone C — 後端資料與 API 調整（Week 3）
- [ ] 補齊 `Manage*ListResponse` 中卡片所需欄位（summary、primaryActions、secondaryActions）。
- [ ] 建立 `bulkUpdateStatus`, `bulkArchive`, `bulkExport` API 的統一輸出格式（`{ message, affected, nextStatus }`）。
- [ ] 導出欄位 metadata（欄位鍵、標籤、優先度、允許裝置），供前端決定顯示，並提供快取策略。
- [ ] 為卡片模式新增 `GET /manage/<entity>/<id>` 精簡摘要 API，行動版點擊卡片可載入詳細內容。
- [ ] 更新 `resources/lang/**` 對應翻譯鍵，並在 `@/lib/i18n` 建立日期/時間格式化 helper。

### Milestone D — 角色管理與擴充（Week 4）
- [ ] 建模 `Teacher` 管理資料：欄位（姓名、職稱、專長、聯絡資訊、排序）、權限檢查。
- [ ] 建立 `manage/admin/teachers/index.tsx` 骨架：使用 `ResponsiveDataView`、卡片顯示教師資訊、提供篩選（專長、職稱）。
- [ ] 管理者可建立/編輯教師：表單沿用 `.docs/manage/ui.md` 規範，提供預覽區塊與圖片上傳壓縮策略。
- [ ] 更新 `@/types/manage` 與 `@/lib/manage` 對應的型別與 helper，確保 Teacher 功能與既有資料結構相容。
- [ ] 擬定教師資料導入流程，含批次匯入/匯出範本與操作說明。

### Milestone E — 測試與驗收（Week 5）
- [ ] 撰寫 `@/components/manage/__tests__/responsive-data-view.test.tsx`，涵蓋斷點切換與 sticky actions。
- [ ] 更新現有 Cypress/Inertia 測試（若有）或新增瀏覽器測試，確保手機尺寸卡片渲染正確。
- [ ] 建立 UI 驗收檢查清單（依 `.docs/manage/ui.md` 與 `.docs/UI_DESIGN_GUIDELINES.md`），納入 CI 流程文件。
- [ ] 完成文件更新：在 PR 中勾選完成的任務並更新 plan.md 狀態。
- [ ] 安排設計驗收會議與錄影備存，確認顏色/互動符合預期。

## 4. 依賴與資源配置
- 設計：1 名 UI/UX 設計師（週投入 2 天）負責審核元件與提供 Figma 視覺稿。
- 前端：2 名開發者（週投入 4 天）負責元件實作、頁面重構與測試。
- 後端：1 名工程師（週投入 3 天）負責 API 調整、欄位 metadata 與匯出格式。
- QA：1 名測試人員（週投入 1.5 天）撰寫與執行測試腳本。
- 專案管理：1 名 PM（週投入 1 天）追蹤核銷格與會議紀錄。

## 5. 風險管理
- RWD 卡片資訊不足：預先蒐集各頁關鍵欄位並與利害關係人確認顯示優先順序。
- 後端欄位調整影響既有 API：先於 Sandbox 驗證並提供向下相容的 fallback。
- 開發進度落後：採取每日 Stand-up 回報進度，必要時調整優先順序（先完成高流量頁面）。
- 設計稿延遲：啟用臨時設計資源或採用 UI Guideline 既定樣式避免阻塞。

## 6. 溝通與追蹤
- 每週例會檢視 Milestone 進度，針對阻塞項即時調整優先順序。
- PR 模板需新增「對應任務」欄位，鏈結至 `plan.md` 勾選項，並附上畫面截圖或 API 回應樣本。
- 設計稿變更需同步更新 `.docs/manage/ui.md`，並於 Slack #manage-design 頻道公告。
- PM 每週五更新核銷情況與燃盡圖，並寄送週報給管理層。

## 7. 驗收標準
- 所有列表頁在 `<768px` 無水平捲軸，資料改為卡片呈現且操作按鈕可單手操作。
- 按鈕、Badge、容器色彩符合語意化規範；表單、對話框行動版皆全寬顯示。
- 批次操作流程具備 Loading → 確認 → Toast 三段式回饋。
- API 回傳結構支援卡片模式所需欄位，欄位 metadata 與前端呈現一致。
- 文件（`.docs/manage/ui.md`、`plan.md`）維持最新狀態，任務完成時於 PR 勾選核銷格。
- QA 驗收報告與設計驗收紀錄均確認無阻塞缺陷。
