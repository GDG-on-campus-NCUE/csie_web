# Manage 後台 UI 規劃藍本

> 本文件作為 manage 後台的 UI 單一事實來源，整合 `.docs/ARCHITECTURE.md` 與 `.docs/UI_DESIGN_GUIDELINES.md` 既有規範，補足行為、排版、元件組合與響應式細節，供設計與工程協作參考。

## 1. 視覺與字體系統

- **色票沿用**：綠（#10B981）= 建立/上傳、藍（#3B82F6）= 套用/確認、紅（#EF4444）= 刪除/重設、深灰（#1E293B）= 匯出/下載。Hover 色依 UI_DESIGN_GUIDELINES.md。
- **中性色**：背景 `bg-white/95`、容器邊框 `border-neutral-200/80`、區塊背景 `bg-neutral-50/70`。
- **排版**：標題使用 `text-2xl font-semibold`（頁面標題）、`text-lg font-medium`（卡片標題）、內文 `text-sm text-neutral-700`、輔助文字 `text-xs text-neutral-500`。
- **間距節奏**：頁面主容器 `gap-6`，卡片內 `space-y-3`，工具列 `gap-3`；手機工具列改為 `flex-col gap-2`。

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

- 桌機優先使用 `@/components/ui/table`，提供 `hover:bg-blue-50/40`，行高 `py-3`，字體 `text-sm`。
- 卡片視圖使用 `components/manage/data-card.tsx` 作基礎，擴充 props 以支援：標題、狀態、主資訊段落、操作按鈕區（左右對齊）、更多資訊折疊。

### 3.4 表單、抽屜與對話框

- 表單採 `space-y-4`，標籤 `text-sm font-medium text-neutral-700`。
- 抽屜（`detail-drawer.tsx`）與對話框（`components/ui/dialog.tsx`）在手機 `w-full h-full`，header 固定，body `overflow-y-auto`。
- 驗證錯誤使用 `text-sm text-rose-600`，表單底部提供主/次要按鈕。

### 3.5 狀態與回饋

- Loading：使用 `table-loading.tsx`、`Skeleton`（自 `components/ui/skeleton`）。
- Empty State：擴充 `table-empty.tsx` 支援 icon + 說明文字 + CTA。
- Toast：統一使用 `lib/shared/toast`（若存在）或建立 `useManageToast` helper，位置 `bottom-right`。

## 4. 響應式與資料呈現策略

- 斷點：`lg` (≥1024px) 保留表格；`md` (768–1023px) 隱藏次要欄位、工具列換行；`<768px` 改用卡片。
- 建議建立 `ResponsiveDataView`：接收 `mode?: 'table' | 'card' | 'auto'`、`table`、`card` render props、`breakpoint` 設定。
- 卡片欄位排序：標題 → 標籤/狀態 → 主內容（例如描述、時間、對象）→ 操作。
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

