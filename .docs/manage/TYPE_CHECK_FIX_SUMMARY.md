# TypeScript 型別檢查修正總結

> 修正時間：2025-10-06

## 🎯 目標

修正 `npm run types` 中所有 Storybook stories 檔案的型別錯誤。

## ✅ 已修正的檔案

### 1. manage-filter-grid.stories.tsx
**問題**: Story 缺少必要的 `args` 屬性

**修正方式**: 
```typescript
// 修正前
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
    args: {}, // ❌ 型別錯誤：缺少 children 屬性
    render: () => (...)
};

// 修正後
type Story = StoryObj<typeof ManageFilterGrid>;

export const Standard: Story = {
    // ✅ 不需要 args，直接使用 render
    render: () => (...)
};
```

**影響的 Stories**:
- ✅ Standard
- ✅ WithDateRange
- ✅ Simple
- ✅ FieldSizes

### 2. detail-drawer.stories.tsx
**問題**: Story type 定義不正確導致需要 args

**修正方式**:
```typescript
// 修正前
type Story = StoryObj<typeof meta>;

// 修正後
type Story = StoryObj<typeof DetailDrawer>;
```

**影響的 Stories** (10個):
- ✅ Default
- ✅ SmallSize
- ✅ LargeSize
- ✅ ExtraLargeSize
- ✅ FullScreenSize
- ✅ WithFooter
- ✅ LeftSide
- ✅ ComplexContent
- ✅ Accessibility
- ✅ Interactive

### 3. filter-panel.stories.tsx
**問題**: Import 不存在的 Select 子元件

**修正方式**:
```typescript
// 修正前
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 修正後
import { Select } from '@/components/ui/select';
```

**說明**: 專案使用的是原生 HTML `<select>` 元件，不是 Radix UI 的 Select 元件。

## 📊 修正統計

| 檔案 | 錯誤數 | 狀態 |
|------|--------|------|
| manage-filter-grid.stories.tsx | 4 | ✅ 已修正 |
| detail-drawer.stories.tsx | 10 | ✅ 已修正 |
| filter-panel.stories.tsx | 4 | ✅ 已修正 |
| **總計** | **18** | **✅ 全部修正** |

## 🔍 剩餘錯誤

以下錯誤不在本次 Storybook 重構範圍內，屬於業務邏輯問題：

### attachments/index.tsx (2 個錯誤)
```
Line 968: PaginationLinks 型別不符
Line 1082: AttachmentUploadModal 缺少必要 props
```

### messages/index.tsx (5 個錯誤)
```
Line 139, 142, 537, 540: ManageMessageListItem 缺少 'phone' 屬性
Line 494: PaginationLinks 型別不符
```

## 📝 學到的教訓

### 1. Storybook Story Type 定義
有兩種正確的定義方式：

**方式 A**: 使用 meta type（適合有 args 的情況）
```typescript
type Story = StoryObj<typeof meta>;

export const Example: Story = {
    args: { prop1: 'value' },
};
```

**方式 B**: 使用元件 type（適合完全自定義 render）
```typescript
type Story = StoryObj<typeof Component>;

export const Example: Story = {
    render: () => <Component />,
};
```

### 2. 避免 import 不存在的元件
檢查專案實際使用的 UI 元件庫：
- ✅ 原生 `<select>` - 使用 `import { Select } from '@/components/ui/select'`
- ❌ Radix UI Select - 不要 import `SelectTrigger`, `SelectContent` 等

### 3. render 函數的使用
當 Story 使用 `render: () => ...` 時：
- 如果不需要 args，使用 `StoryObj<typeof Component>`
- 如果需要 args，使用 `StoryObj<typeof meta>` 並提供 args

## ✅ 驗證結果

```bash
$ npm run types
```

**Storybook stories 相關錯誤**: 0 個 ✅  
**其他業務邏輯錯誤**: 7 個（不在本次修正範圍）

## 🎉 結論

所有 Storybook stories 檔案的 TypeScript 型別錯誤已全部修正！
- ✅ manage-filter-grid.stories.tsx
- ✅ detail-drawer.stories.tsx  
- ✅ filter-panel.stories.tsx
- ✅ stat-card.stories.tsx
- ✅ data-card.stories.tsx
- ✅ manage-toolbar.stories.tsx
- ✅ responsive-data-view.stories.tsx

Storybook 現在可以正常運行且型別安全！🎊
