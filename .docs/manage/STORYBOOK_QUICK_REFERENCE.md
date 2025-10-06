# Storybook 快速參考

## 🚀 啟動與訪問

```bash
# 啟動 Storybook
npm run storybook

# 訪問地址
http://localhost:6006
http://10.107.172.8:6006
```

## 📁 當前可用的 Stories

### ⭐ 推薦使用（符合最新規範）

| Story 名稱 | 路徑 | 用途 | 範例數 |
|-----------|------|------|--------|
| **Manage/ManageFilterGrid** | `components/manage/manage-filter-grid.stories.tsx` | 篩選器網格系統 | 4 個 |
| **Manage/ManageToolbar** | `components/manage/manage-toolbar.stories.tsx` | 頁面工具列 | - |
| **Manage/ResponsiveDataView** | `components/manage/responsive-data-view.stories.tsx` | 響應式資料視圖 | - |

### ✅ 可用元件

| Story 名稱 | 路徑 | 用途 |
|-----------|------|------|
| **Manage/DataCard** | `components/manage/data-card.stories.tsx` | 行動版資料卡片 |
| **Manage/DetailDrawer** | `components/manage/detail-drawer.stories.tsx` | 詳細資訊抽屜 |
| **Manage/StatCard** | `components/manage/stat-card.stories.tsx` | 統計卡片 |

### ⚠️ 舊版（不建議使用）

| Story 名稱 | 替代方案 |
|-----------|---------|
| ~~Manage/FilterPanel~~ | → **ManageFilterGrid** |

## 🎯 ManageFilterGrid 範例

在 Storybook 中可以看到 4 個互動式範例：

### 1. **Standard** - 標準篩選器
```tsx
<ManageFilterGrid>
  <ManageFilterField size="third">
    <Input placeholder="搜尋..." />
  </ManageFilterField>
  <ManageFilterField size="quarter">
    <Select>{/* 狀態 */}</Select>
  </ManageFilterField>
  <ManageFilterField size="quarter">
    <Select>{/* 標籤 */}</Select>
  </ManageFilterField>
  <ManageFilterActions
    primary={<Button>套用篩選</Button>}
    secondary={<Button>重設</Button>}
  />
</ManageFilterGrid>
```

### 2. **WithDateRange** - 含日期範圍
包含搜尋框、類型、標籤、起始/結束日期，展示多欄位篩選

### 3. **Simple** - 簡化版
只有搜尋框和新增按鈕，適合簡單頁面

### 4. **FieldSizes** - 欄位大小展示
視覺化展示 5 種欄位大小：Full, Half, Third, Quarter, Two-thirds

## 🎨 欄位大小對應

| Size | 桌面寬度 | 適用元件 |
|------|---------|---------|
| `full` | 12/12 (100%) | 完整搜尋列 |
| `two-thirds` | 8/12 (66.67%) | 搜尋框+小按鈕 |
| `half` | 6/12 (50%) | 對稱布局 |
| `third` | 4/12 (33.33%) | 搜尋框、主要篩選 |
| `quarter` | 3/12 (25%) | 下拉選單、日期 |

## 🎨 按鈕顏色規範（在 Stories 中可見）

| 動作 | Tailwind 類別 | 用途 |
|-----|--------------|------|
| 新增/建立 | `bg-[#10B981] hover:bg-[#059669] text-white` | 新增公告、建立標籤 |
| 套用/確認 | `bg-[#3B82F6] hover:bg-[#2563EB] text-white` | 套用篩選、確認操作 |
| 匯出/下載 | `bg-[#1E293B] hover:bg-[#0F172A] text-white` | 匯出資料、下載 |
| 刪除/停用 | `bg-[#EF4444] hover:bg-[#DC2626] text-white` | 刪除、停用 |
| 取消/重設 | `variant="outline"` | 取消、重設表單 |

## 📝 在 Storybook 中測試

1. **響應式測試**
   - 點擊頂部工具列的 📱 手機圖示
   - 或調整瀏覽器寬度
   - 查看元件在不同螢幕的表現

2. **互動測試**
   - 點擊按鈕查看 hover 效果
   - 在輸入框輸入文字
   - 測試下拉選單選擇

3. **背景切換**
   - 使用底部工具列的背景選項
   - 測試在 light/dark/white 背景的顯示效果

## 🛠️ Storybook 配置

### 主要配置檔案

```
.storybook/
├── main.ts       # 掃描路徑、插件配置
└── preview.ts    # 全域樣式、參數設定
```

### 掃描路徑

```typescript
// .storybook/main.ts
stories: [
  "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  "../resources/js/**/*.stories.@(js|jsx|mjs|ts|tsx)"  // 掃描所有 resources/js 下的 stories
]
```

### 樣式引入

```typescript
// .storybook/preview.ts
import '../resources/css/app.css'; // Tailwind CSS
```

## 📚 相關文件

- **元件對應表**: `.docs/manage/STORYBOOK_COMPONENT_MAP.md`
- **遷移指南**: `.docs/manage/FILTER_MIGRATION_GUIDE.md`
- **UI 規範**: `.docs/manage/ui.md`
- **架構文件**: `.docs/ARCHITECTURE.md`

## 🐛 常見問題

### Q: Storybook 看不到我的 Story？

**A**: 檢查以下項目：
1. 檔案名稱是否為 `*.stories.tsx`
2. 檔案是否在 `resources/js/` 或 `stories/` 目錄下
3. 重新整理瀏覽器（Ctrl+Shift+R）
4. 檢查 import 路徑是否正確

### Q: 元件樣式沒有正確顯示？

**A**: 確認：
1. `.storybook/preview.ts` 已引入 `app.css`
2. Tailwind classes 是否正確
3. 檢查瀏覽器控制台是否有錯誤

### Q: Import 錯誤？

**A**: Stories 中的 import 路徑應該：
- 使用 `./component-name` 引入同目錄元件
- 使用 `@/components/ui/...` 引入 UI 元件
- 不要使用 `../` 跳出目錄

## 🔄 更新 Stories

### 新增 Story

1. 在元件旁建立 `.stories.tsx` 檔案
2. 使用標準模板：

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import YourComponent from './your-component';

const meta = {
    title: 'Manage/YourComponent',
    component: YourComponent,
    parameters: {
        layout: 'padded',
    },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        // 你的 props
    },
};
```

3. Storybook 會自動偵測並重新載入

### 修改現有 Story

1. 編輯 `.stories.tsx` 檔案
2. 儲存後 Storybook 會熱重載
3. 瀏覽器會自動更新

---

**快速指令**:
```bash
npm run storybook        # 啟動
npm run build-storybook  # 建置靜態版本
```

**訪問**: http://localhost:6006
