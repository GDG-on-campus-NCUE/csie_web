# Manage 後台 UI 規劃藍本

> 本文件作為 manage 後台的 UI 單一事實來源，整合 `.docs/ARCHITECTURE.md` 與 `.docs/UI_DESIGN_GUIDELINES.md` 既有規範，補足行為、排版、元件組合與響應式細節，供設計與工程協作參考。

## 1. 視覺與字體系統

### 1.1 色彩規範

| 語意 | Hex | Tailwind 推薦類別 | 使用情境 |
| --- | --- | --- | --- |
| Primary | `#3B82F6` | `bg-[#3B82F6] hover:bg-[#2563EB] text-white` | 主要動作按鈕、表格重點連結 |
| Success | `#10B981` | `bg-[#10B981] hover:bg-[#059669] text-white` | 建立、發布、上傳完成 |
| Warning | `#F97316` | `bg-[#F97316] hover:bg-[#EA580C] text-white` | 待審核、提醒使用者注意 |
| Danger | `#EF4444` | `bg-[#EF4444] hover:bg-[#DC2626] text-white` | 刪除、停用、錯誤提示 |
| Neutral | `#1E293B` | `bg-[#1E293B] hover:bg-[#0F172A] text-white` | 匯出、次要主要動作 |

- **Hover 與 Disabled 狀態**：色票 hover 需維持 20% 明度差距，Disabled 請搭配 `opacity-60 cursor-not-allowed`。

### 1.2 中性色與陰影

- 介面背景採用 `bg-neutral-50/60`，主要容器 `bg-white/95 shadow-sm`。
- 邊框一律使用 `border-neutral-200/80`，聚焦態可疊加 `ring-2 ring-blue-500/60`。

### 1.3 字體階層

- 頁面標題：`text-2xl font-semibold`。
- 功能模組 / 卡片標題：`text-lg font-semibold`。
- 內文：`text-sm text-neutral-700`。
- 輔助文字與標籤：`text-xs text-neutral-500`。

### 1.4 間距節奏

| 區塊 | 垂直間距 | 水平間距 |
| --- | --- | --- |
| 頁面主容器 | `gap-6` | `px-6` |
| 模組內區塊 | `space-y-4` | `px-6` |
| 資料卡片 | `space-y-3` | `px-5` |
| 工具列 | `gap-3 md:flex-row` | `md:items-center` |

Spacing 需與 Figma component library 一致，RWD 時維持 `min-h-[44px]` 的可點擊高度。

### 1.5 網格布局系統

管理頁面的篩選器與操作列需遵循統一的網格分配原則：

**基礎網格單位**：
- 採用 12 欄網格系統
- 手機（< 768px）：所有元件 `col-span-12`（100% 寬度）
- 平板（768px - 1024px）：依重要性分配 4-6-8 欄
- 桌面（≥ 1024px）：精細分配 2-3-4-6 欄

**篩選器元件網格分配**：

| 元件類型 | 手機 | 平板 | 桌面 | 說明 |
| --- | --- | --- | --- | --- |
| 搜尋輸入框 | 12 | 6 | 4 | 主要搜尋欄位 |
| 單選下拉選單 | 12 | 3 | 2 | 狀態、分類篩選 |
| 日期選擇器 | 12 | 3 | 2 | 起始/結束日期 |
| 主要動作按鈕 | 12 | 4 | 3 | 新增、套用篩選 |
| 次要動作按鈕 | 12 | 4 | 3 | 匯出、重設 |
| 批次操作按鈕 | 12 | 12 | auto | 依選取狀態顯示 |

**標準篩選器布局模式**：

```tsx
// 模式 A：搜尋 + 狀態 + 標籤 + 操作
<div className="grid grid-cols-12 gap-3">
  {/* 搜尋框 */}
  <div className="col-span-12 md:col-span-6 lg:col-span-4">
    <Input placeholder="搜尋..." />
  </div>
  
  {/* 狀態篩選 */}
  <div className="col-span-12 md:col-span-3 lg:col-span-2">
    <Select>{/* 選項 */}</Select>
  </div>
  
  {/* 標籤篩選 */}
  <div className="col-span-12 md:col-span-3 lg:col-span-2">
    <Select>{/* 選項 */}</Select>
  </div>
  
  {/* 操作按鈕組 */}
  <div className="col-span-12 lg:col-span-4 flex items-center gap-2 lg:justify-end">
    <Button className="flex-1 lg:flex-initial">套用</Button>
    <Button variant="outline" className="flex-1 lg:flex-initial">重設</Button>
  </div>
</div>
```

**分頁與資訊顯示**：
- 每頁數量選擇器：桌面 `col-span-2`，手機 `col-span-6`
- 總數顯示：與分頁選擇器同行，`col-span-4` 或 `col-span-6`
- 分頁控制器：獨立一行居中顯示

### 1.6 按鈕尺寸與規範

| 尺寸 | 高度 | Padding | Icon 大小 | 使用情境 |
| --- | --- | --- | --- | --- |
| `default` | `h-11` | `px-5` | `h-5 w-5` | 主要操作（桌機） |
| `sm` | `h-10` | `px-4` | `h-4 w-4` | 卡片行動列、桌機次要操作 |
| `xs` | `h-9` | `px-3` | `h-4 w-4` | 表格列內操作、手機工具列 |

**按鈕顏色使用規範**：

| 動作類型 | 顏色類別 | Tailwind 類別 | 使用情境 |
| --- | --- | --- | --- |
| 新增/建立 | Success | `bg-[#10B981] hover:bg-[#059669] text-white` | 新增公告、建立標籤 |
| 套用/確認 | Primary | `bg-[#3B82F6] hover:bg-[#2563EB] text-white` | 套用篩選、確認操作 |
| 發布/啟用 | Success | `bg-[#10B981] hover:bg-[#059669] text-white` | 發布公告、啟用功能 |
| 匯出/下載 | Neutral | `bg-[#1E293B] hover:bg-[#0F172A] text-white` | 匯出資料、下載檔案 |
| 編輯/修改 | Outline | `border-neutral-300 hover:bg-neutral-50` | 編輯內容 |
| 刪除/停用 | Danger | `bg-[#EF4444] hover:bg-[#DC2626] text-white` | 刪除項目、停用功能 |
| 取消/重設 | Ghost | `hover:bg-neutral-100` | 取消操作、重設表單 |
| 審核/警告 | Warning | `bg-[#F97316] hover:bg-[#EA580C] text-white` | 需審核、警告狀態 |

按鈕群組需保持 `gap-3`，手機小於 `md` 斷點時改為 `flex-col gap-2` 並填滿寬度。

**⚠️ 禁止使用的舊樣式**：
- ❌ `variant="tonal"` - 已廢棄，請改用明確的顏色類別
- ❌ 硬編碼顏色值 - 必須使用規範中的色票
- ❌ 自定義 hover 效果 - 統一使用規範中的 hover 色票

### 1.7 視覺截圖流程

1. 於 Storybook 或本地頁面切換至預期狀態，調整至 1440px 與 390px 兩種寬度。
2. 使用瀏覽器開發者工具的裝置模式截圖，確保保留 hover / focus 效果。
3. 將圖片存放於 `public/manage/ui-examples/<component>`，檔名採 `component-state-width.png`。
4. 在 PR 描述附上桌機與手機截圖，並於 `plan.md` 對應任務打勾。

## 2. 版型骨架

### 2.1 頂層框架

- `resources/js/layouts/manage/manage-page.tsx` 為基礎版型：固定頂部工具列、側邊欄（由 `manage-sidebar-*` 組件提供）與主內容區。
- Header 需保持 64px 高度、含語系切換、使用者資訊與登出。語系切換採 `LanguageSwitcher`，登出按鈕使用 `variant="ghost"`。

### 2.2 頁面主內容

- `ManageMain`（`resources/js/layouts/manage/manage-main.tsx`）負責：
  - 頁面標題、描述、麵包屑：`ManageMainHeader`
  - 工具列與操作群組：action 按鈕在左、輔助選單在右，手機時堆疊。
  - 主內容容器：採用標準卡片樣式包覆每個功能模組。
  - 底部資訊／批次操作提示由 `ManageMainFooter`。

## 3. 元件設計準則

### 3.1 按鈕群組

- `@/components/ui/button` 已支援 `variant="outline" | "ghost" | "destructive" | "default"`；為確保語意一致，所有主要操作需透過自訂 `className` 指定色票。
- 主要按鈕組合：
  ```tsx
  <div className="flex flex-wrap items-center gap-3">
    <Button className="bg-[#10B981] hover:bg-[#059669] text-white">
      <Plus className="mr-2 h-4 w-4" />
      {t('actions.create', '新增')}
    </Button>
    <div className="hidden h-6 w-px bg-neutral-200 lg:block" />
    <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
      <Filter className="mr-2 h-4 w-4" />
      {t('actions.apply', '套用篩選')}
    </Button>
    <Button className="bg-[#1E293B] hover:bg-[#0F172A] text-white" variant="default">
      <Download className="mr-2 h-4 w-4" />
      {t('actions.export', '匯出')}
    </Button>
  </div>
  ```
- 行動版按鈕列：`flex-col`、`w-full`、主要按鈕 `w-full`、次要操作可 `justify-between`。

### 3.2 卡片與容器

- **標準容器**（表格、列表、卡片外層）：
  ```tsx
  <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
    <header className="flex items-center justify-between gap-3 border-b border-neutral-200/60 px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
      {actions}
    </header>
    <div className="px-6 py-5">
      {children}
    </div>
  </section>
  ```
- **資料卡片**：`space-y-3`，標題 `text-base font-medium`，狀態 badge 放在右上角，操作按鈕置於底部。
- **統計卡片**：沿用 `components/manage/stat-card.tsx`，保留 `rounded-xl` 與 `bg-white/80`。

### 3.3 表格與卡片視圖

- 優先使用 `@/components/manage/responsive-data-view` 控制呈現模式。
- 桌機 (`≥ md`) 使用 `@/components/ui/table`，列高 `py-3`、`text-sm`。
- 行動裝置 (`< md`) 使用 `@/components/manage/data-card`，必須提供標題、狀態徽章、主內容區與操作列。
- 若需顯示額外欄位，使用 `metadata` 區塊或在 `children` 中自定義段落。

### 3.4 表單、抽屜與對話框

- 表單採 `space-y-4`，標籤 `text-sm font-medium text-neutral-700`。
- 抽屜（`detail-drawer.tsx`）與對話框（`components/ui/dialog.tsx`）在手機 `w-full h-full`，header 固定，body `overflow-y-auto`。
- 驗證錯誤使用 `text-sm text-rose-600`，表單底部提供主/次要按鈕。

### 3.5 狀態與回饋

- Loading：使用 `table-loading.tsx` 或 `ResponsiveDataView` 內建骨架，樣式統一為 `rounded-xl border bg-white p-6`。
- Empty State：使用 `table-empty.tsx`，務必傳入 `icon`、`title`、`description` 與 `action`（選填），維持一致大小。
- Toast：統一使用 `lib/shared/toast`（若存在）或建立 `useManageToast` helper，位置 `bottom-right`。

## 4. 響應式與資料呈現策略

- 斷點：`lg` (≥1024px) 保留表格；`md` (768–1023px) 隱藏次要欄位、工具列換行；`<768px` 改用卡片。
- 建議建立 `ResponsiveDataView`：接收 `mode?: 'table' | 'card' | 'auto'`、`table`、`card` render props、`breakpoint` 設定。
- 卡片欄位排序：標題 → 標籤/狀態 → 主內容（描述、摘要、重點資料）→ 後設資訊 → 操作列。
- 批次操作：手機以 `Sticky Action Bar`（底部固定按鈕），桌機保留表格 checkbox 欄。

## 5. 管理頁面模板

| 類型 | 主要元件 | 說明 |
| --- | --- | --- |
| 儀表板 (`/manage/admin/dashboard`) | `stat-card`, `activity-timeline` | 保留現有卡片，補強 hover 與空資料顯示。
| 列表管理（公告、標籤、訊息、附件） | `ResponsiveDataView`, `table-empty`, `detail-drawer` | 依資料量決定欄位，手機轉為卡片。
| 角色管理（教師、行政） | `data-card`, `forms` | 教師在卡片內顯示專長、聯絡方式，支援 `ManageToolbar` 篩選。

## 6. 無障礙與互動細節

- Focus ring 使用 `outline-none ring-2 ring-offset-2 ring-blue-500/70`。
- Icon button（例如行操作）需提供 `aria-label`。
- 表格排序箭頭顏色 `text-neutral-500`，hover `text-neutral-800`。
- 移動端卡片內的操作按鈕至少 `min-h-[44px]`。

## 7. 文件維護

- UI 規範若有更新，需同步調整 `.docs/UI_DESIGN_GUIDELINES.md` 與此檔，並於 `plan.md` 記錄。
- 新增/調整元件時，於 `components/manage/__tests__` 增補快照或行為測試。

