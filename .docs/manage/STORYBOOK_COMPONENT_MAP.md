# Manage 元件 Storybook 對應表

> 本文件記錄 `resources/js/components/manage/` 目錄下的元件及其對應的 Storybook stories

## 📚 Storybook 分類架構

```
Storybook
├── EXAMPLE (預設範例)
│   ├── Button
│   ├── Header
│   └── Page
│
└── MANAGE (管理後台元件)
    ├── DataCard
    ├── DetailDrawer
    ├── FilterPanel
    ├── ManageFilterGrid ⭐ (新增，推薦使用)
    ├── ManageToolbar
    ├── ResponsiveDataView
    └── StatCard
```

## 🗂️ 元件對應表

| 元件名稱 | 元件檔案 | Stories 檔案 | Story 標題 | 狀態 | 說明 |
|---------|---------|-------------|-----------|------|------|
| **ManageFilterGrid** | `manage-filter-grid.tsx` | `manage-filter-grid.stories.tsx` | `Manage/ManageFilterGrid` | ✅ 推薦 | **新標準**：12欄網格篩選器容器，含響應式欄位與按鈕群組 |
| **ManageFilterField** | `manage-filter-grid.tsx` | 同上 | - | ✅ | 篩選器欄位包裝器（5種大小） |
| **ManageFilterActions** | `manage-filter-grid.tsx` | 同上 | - | ✅ | 篩選器按鈕群組 |
| **ManageToolbar** | `manage-toolbar.tsx` | `manage-toolbar.stories.tsx` | `Manage/ManageToolbar` | ✅ 推薦 | 頁面頂部工具列，支援水平/垂直排列 |
| **ResponsiveDataView** | `responsive-data-view.tsx` | `responsive-data-view.stories.tsx` | `Manage/ResponsiveDataView` | ✅ 推薦 | 響應式資料視圖（表格/卡片切換） |
| **DataCard** | `data-card.tsx` | `data-card.stories.tsx` | `Manage/DataCard` | ✅ | 行動版資料卡片元件 |
| **DetailDrawer** | `detail-drawer.tsx` | `detail-drawer.stories.tsx` | `Manage/DetailDrawer` | ⚠️ | 詳細資訊側邊抽屜（需檢查） |
| **FilterPanel** | `filter-panel.tsx` | `filter-panel.stories.tsx` | `Manage/FilterPanel` | ⚠️ 舊版 | **已過時**，請改用 ManageFilterGrid |
| **StatCard** | `stat-card.tsx` | `stat-card.stories.tsx` | `Manage/StatCard` | ✅ | 儀表板統計卡片 |

## 📋 狀態說明

- ✅ **推薦**：符合最新規範，建議使用
- ✅ **正常**：功能正常，可繼續使用
- ⚠️ **舊版**：已有更好的替代方案
- ⚠️ **需檢查**：可能需要更新或修正
- 🔧 **開發中**：尚在開發或測試階段

## 🏗️ 架構對應

### 元件層級分類

#### 1. **容器元件** (Container Components)
負責布局與結構

| 元件 | 用途 | Stories | 推薦度 |
|-----|------|---------|--------|
| `ManageFilterGrid` | 篩選器網格容器 | ✅ | ⭐⭐⭐ |
| `ManageToolbar` | 頁面工具列 | ✅ | ⭐⭐⭐ |
| `ResponsiveDataView` | 響應式資料視圖 | ✅ | ⭐⭐⭐ |
| `DetailDrawer` | 詳細資訊抽屜 | ✅ | ⭐⭐ |
| ~~`FilterPanel`~~ | ❌ 舊版篩選器面板 | ⚠️ | ❌ 已棄用 |

#### 2. **展示元件** (Presentation Components)
負責資料呈現

| 元件 | 用途 | Stories | 推薦度 |
|-----|------|---------|--------|
| `DataCard` | 資料卡片 | ✅ | ⭐⭐⭐ |
| `StatCard` | 統計卡片 | ✅ | ⭐⭐⭐ |

#### 3. **複合元件** (Composite Components)
由多個子元件組成

| 父元件 | 子元件 | 說明 |
|-------|-------|------|
| `ManageFilterGrid` | `ManageFilterField`<br>`ManageFilterActions` | 完整的篩選器系統 |
| `ResponsiveDataView` | `Table`<br>`DataCard` | 桌面表格 + 行動卡片 |

## 🔄 遷移路徑

### 從 FilterPanel 遷移到 ManageFilterGrid

```tsx
// ❌ 舊寫法（FilterPanel）
<FilterPanel>
  <Input />
  <Select />
  <Button>套用</Button>
</FilterPanel>

// ✅ 新寫法（ManageFilterGrid）
<ManageFilterGrid>
  <ManageFilterField size="third">
    <Input />
  </ManageFilterField>
  <ManageFilterField size="quarter">
    <Select />
  </ManageFilterField>
  <ManageFilterActions
    primary={<Button>套用</Button>}
  />
</ManageFilterGrid>
```

**優勢**：
- ✅ 統一的 12 欄網格系統
- ✅ 語意化的欄位大小（third, quarter 等）
- ✅ 自動響應式處理
- ✅ 符合最新 UI 規範

## 📁 檔案位置對應

### 元件檔案
```
resources/js/components/manage/
├── data-card.tsx
├── data-card.stories.tsx ✅
├── detail-drawer.tsx
├── detail-drawer.stories.tsx ✅
├── filter-panel.tsx
├── filter-panel.stories.tsx ⚠️
├── manage-filter-grid.tsx
├── manage-filter-grid.stories.tsx ⭐
├── manage-toolbar.tsx
├── manage-toolbar.stories.tsx ✅
├── responsive-data-view.tsx
├── responsive-data-view.stories.tsx ✅
├── stat-card.tsx
└── stat-card.stories.tsx ✅
```

### 使用範例
```
resources/js/pages/manage/
├── admin/
│   ├── posts/index.tsx          (使用 ManageFilterGrid ✅)
│   ├── tags/index.tsx           (待更新)
│   ├── users/index.tsx          (待更新)
│   ├── attachments/index.tsx    (待更新)
│   └── messages/index.tsx       (待更新)
└── teacher/
    ├── posts/index.tsx
    ├── labs/index.tsx
    └── projects/index.tsx
```

## 🎯 使用建議

### 新開發頁面
1. 使用 `ManageFilterGrid` 建立篩選器
2. 使用 `ManageToolbar` 建立操作列
3. 使用 `ResponsiveDataView` 處理資料呈現
4. 參考 Storybook 範例快速實作

### 現有頁面重構
1. 查看 `.docs/manage/FILTER_MIGRATION_GUIDE.md`
2. 對照 Storybook 中的 ManageFilterGrid 範例
3. 參考 `posts/index.tsx` 重構範例
4. 遵循按鈕顏色規範（詳見 `.docs/manage/ui.md`）

## 🔍 快速查找

### 在 Storybook 中找到元件
1. 啟動 Storybook: `npm run storybook`
2. 訪問 `http://localhost:6006`
3. 左側導航 → **MANAGE** 分類
4. 選擇對應元件查看範例

### 在代碼中找到元件
```bash
# 查找元件定義
find resources/js/components/manage -name "*.tsx" -not -name "*.stories.tsx"

# 查找元件使用
grep -r "ManageFilterGrid" resources/js/pages/manage/
```

## 📚 相關文件

- [UI 設計規範](.docs/manage/ui.md)
- [遷移指南](.docs/manage/FILTER_MIGRATION_GUIDE.md)
- [實施總結](.docs/manage/FILTER_UNIFICATION_SUMMARY.md)
- [架構文件](.docs/ARCHITECTURE.md)

---

**維護者**: 前端開發團隊  
**最後更新**: 2025-10-06  
**版本**: 1.0.0
