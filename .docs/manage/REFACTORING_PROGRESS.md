# 管理頁面重構進度

> 最後更新：2025-10-06

## 📋 總覽

將所有管理頁面的篩選器統一使用 `FilterPanel` 系統（可折疊互動式面板），並標準化按鈕顏色。

## ✅ 已完成的頁面

### 1. 公告管理 (Posts)
**檔案**: `resources/js/pages/manage/admin/posts/index.tsx`

**修改內容**:
- ✅ 改用 `FilterPanel`（可折疊）替代 `ManageFilterGrid`
- ✅ 移除 `ManageToolbar`，改用簡化的操作按鈕區
- ✅ 使用內部 12 欄網格布局：
  - 關鍵字搜尋（4 欄）
  - 標籤篩選（4 欄）
  - 每頁筆數（4 欄）
- ✅ 按鈕顏色標準化：
  - 新增公告：`#10B981` (Success)
  - 套用篩選：內建於 FilterPanel
- ✅ 互動功能：
  - 可折疊/展開篩選面板
  - 內建「套用」和「重設」按鈕
  - 狀態篩選標籤獨立顯示

**狀態**: ✅ 無編譯錯誤


### 2. 標籤管理 (Tags)
**檔案**: `resources/js/pages/manage/admin/tags/index.tsx`

**修改內容**:
- ✅ 改用 `FilterPanel`（可折疊）替代 `ManageToolbar`
- ✅ 使用內部 12 欄網格布局：
  - 關鍵字搜尋（4 欄）
  - 模組篩選（3 欄）
  - 狀態篩選（3 欄）
  - 每頁筆數（2 欄）
- ✅ 操作按鈕區獨立（不在 FilterPanel 內）：
  - 已選擇提示
  - 合併按鈕
  - 新增標籤按鈕
- ✅ 按鈕顏色標準化：
  - 新增標籤：`#10B981` (Success)
  - 套用篩選：內建於 FilterPanel
- ✅ 互動功能：
  - 可折疊/展開篩選面板
  - 內建「套用」和「重設」按鈕
  - 獨立操作按鈕區顯示選擇狀態

**狀態**: ✅ 無編譯錯誤


### 3. Storybook Stories 修正
**檔案**: 
- `resources/js/components/manage/filter-panel.stories.tsx`
- `resources/js/components/manage/stat-card.stories.tsx`

**修改內容**:
- ✅ 修正 import 路徑：`'../component'` → `'./component'`
- ✅ 清除 Vite 快取（`node_modules/.vite`）
- ✅ 重啟 Storybook 服務

**狀態**: ✅ Storybook 運行正常，無錯誤訊息


## 🚧 待完成的頁面

### 3. 使用者管理 (Users)
**檔案**: `resources/js/pages/manage/admin/users/index.tsx`
- [ ] 重構篩選器使用 `ManageFilterGrid`
- [ ] 標準化按鈕顏色

### 4. 附件管理 (Attachments)
**檔案**: `resources/js/pages/manage/admin/attachments/index.tsx`
- [ ] 重構篩選器使用 `ManageFilterGrid`
- [ ] 標準化按鈕顏色

### 5. 訊息管理 (Messages)
**檔案**: `resources/js/pages/manage/admin/messages/index.tsx`
- [ ] 重構篩選器使用 `ManageFilterGrid`
- [ ] 標準化按鈕顏色


## 📊 進度統計

- **已完成**: 2/5 頁面 (40%)
- **Storybook 修正**: ✅ 完成
- **架構文件**: ✅ 已更新


## 🎨 設計規範

### 網格系統
- **12 欄網格布局**
- **響應式斷點**: `xs` (mobile) → `md` → `lg`

### 預設尺寸
| 名稱 | 欄數 | 百分比 | 適用場景 |
|------|------|--------|----------|
| `full` | 12 | 100% | 完整寬度輸入 |
| `half` | 6 | 50% | 日期範圍 |
| `third` | 4 | 33.33% | 關鍵字搜尋 |
| `quarter` | 3 | 25% | 下拉選單 |
| `two-thirds` | 8 | 66.67% | 大型輸入 |

### 按鈕顏色規範
| 用途 | 顏色 | Hex | 情境 |
|------|------|-----|------|
| Success | 綠色 | `#10B981` | 新增、建立 |
| Primary | 藍色 | `#3B82F6` | 套用篩選、一般動作 |
| Neutral | 灰色 | `#1E293B` | 檢視、匯出 |
| Danger | 紅色 | `#EF4444` | 刪除、停用 |


## 🔗 相關文件

- [篩選器遷移指南](./.docs/manage/FILTER_MIGRATION_GUIDE.md)
- [UI 規範](./.docs/manage/ui.md)
- [Storybook 元件對照表](./.docs/manage/STORYBOOK_COMPONENT_MAP.md)
- [架構文件](./.docs/ARCHITECTURE.md)


## 📝 注意事項

1. **ManageFilterField 不接受 label prop**：直接將 Input/Select 放在 ManageFilterField 內，使用 aria-label 提供無障礙標籤

2. **ManageFilterActions 使用方式**：
   ```tsx
   <ManageFilterActions
       primary={<>篩選按鈕</>}
       secondary={<>操作按鈕</>}
   />
   ```

3. **Vite 快取問題**：修改 import 路徑後需清除 `node_modules/.vite` 並重啟開發伺服器

4. **Story 檔案 import 規範**：使用相對路徑 `'./component'` 而非 `'../component'`
