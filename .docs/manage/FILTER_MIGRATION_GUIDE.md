# 管理頁面篩選器遷移指南

> 本指南協助將現有管理頁面的篩選器重構為使用 `ManageFilterGrid` 元件，確保布局統一與響應式體驗一致。

## 目標

1. **統一布局**：所有篩選器使用 12 欄網格系統
2. **響應式設計**：手機全寬、平板和桌面自動調整
3. **按鈕規範**：使用統一的顏色語意
4. **維護性提升**：減少重複代碼、提高可讀性

## 遷移步驟

### 步驟 1：識別現有篩選器結構

找出頁面中的篩選器區域，通常包含：
- 搜尋輸入框
- 下拉選單（狀態、分類、標籤等）
- 日期選擇器
- 操作按鈕（套用、重設、匯出等）

### 步驟 2：匯入新元件

```tsx
import ManageFilterGrid, { 
    ManageFilterField, 
    ManageFilterActions 
} from '@/components/manage/manage-filter-grid';
```

### 步驟 3：重構篩選器標記

#### 舊寫法（避免使用）

```tsx
// ❌ 舊寫法：使用自定義的 flex 布局
<div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
    <Input placeholder="搜尋..." className="flex-1" />
    <Select className="w-full md:w-40">{/* ... */}</Select>
    <Select className="w-full md:w-40">{/* ... */}</Select>
    <div className="flex gap-2">
        <Button>套用</Button>
        <Button variant="outline">重設</Button>
    </div>
</div>
```

#### 新寫法（推薦）

```tsx
// ✅ 新寫法：使用 ManageFilterGrid
<ManageFilterGrid>
    {/* 搜尋框佔 4 欄（桌面）、6 欄（平板）、12 欄（手機） */}
    <ManageFilterField size="third">
        <Input placeholder="搜尋..." className="h-10" />
    </ManageFilterField>
    
    {/* 狀態篩選佔 3 欄（桌面） */}
    <ManageFilterField size="quarter">
        <Select className="h-10">
            <option value="">全部狀態</option>
            {/* ... */}
        </Select>
    </ManageFilterField>
    
    {/* 標籤篩選佔 3 欄（桌面） */}
    <ManageFilterField size="quarter">
        <Select className="h-10">
            <option value="">全部標籤</option>
            {/* ... */}
        </Select>
    </ManageFilterField>
    
    {/* 操作按鈕 */}
    <ManageFilterActions
        primary={
            <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                <Filter className="mr-2 h-4 w-4" />
                套用篩選
            </Button>
        }
        secondary={
            <Button variant="outline" className="w-full">
                <RefreshCcw className="mr-2 h-4 w-4" />
                重設
            </Button>
        }
    />
</ManageFilterGrid>
```

### 步驟 4：修正按鈕顏色

參考 `.docs/manage/ui.md` 中的按鈕顏色規範：

| 動作類型 | 使用顏色 | Tailwind 類別 |
|---------|---------|--------------|
| 新增/建立 | Success | `bg-[#10B981] hover:bg-[#059669] text-white` |
| 套用/確認 | Primary | `bg-[#3B82F6] hover:bg-[#2563EB] text-white` |
| 匯出/下載 | Neutral | `bg-[#1E293B] hover:bg-[#0F172A] text-white` |
| 刪除/停用 | Danger | `bg-[#EF4444] hover:bg-[#DC2626] text-white` |
| 取消/重設 | Ghost | `variant="ghost"` 或 `variant="outline"` |

#### 按鈕修正範例

```tsx
// ❌ 舊寫法
<Button variant="tonal">新增公告</Button>
<Button>套用</Button>

// ✅ 新寫法
<Button className="bg-[#10B981] hover:bg-[#059669] text-white">
    <Plus className="mr-2 h-4 w-4" />
    新增公告
</Button>
<Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
    <Filter className="mr-2 h-4 w-4" />
    套用篩選
</Button>
```

## 常見布局模式

### 模式 A：標準篩選器（搜尋 + 2 個下拉 + 操作）

```tsx
<ManageFilterGrid>
    <ManageFilterField size="third">
        <Input placeholder="搜尋..." className="h-10" />
    </ManageFilterField>
    
    <ManageFilterField size="quarter">
        <Select className="h-10">{/* 狀態 */}</Select>
    </ManageFilterField>
    
    <ManageFilterField size="quarter">
        <Select className="h-10">{/* 分類 */}</Select>
    </ManageFilterField>
    
    <ManageFilterActions
        primary={<Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white">套用</Button>}
        secondary={<Button variant="outline" className="w-full">重設</Button>}
    />
</ManageFilterGrid>
```

### 模式 B：包含日期範圍

```tsx
<ManageFilterGrid>
    <ManageFilterField size="third">
        <Input placeholder="搜尋..." className="h-10" />
    </ManageFilterField>
    
    <ManageFilterField size="quarter">
        <Select className="h-10">{/* 狀態 */}</Select>
    </ManageFilterField>
    
    <ManageFilterField size="quarter">
        <Input type="date" className="h-10" />
    </ManageFilterField>
    
    <ManageFilterField size="quarter">
        <Input type="date" className="h-10" />
    </ManageFilterField>
    
    <ManageFilterActions
        fullWidth
        primary={<Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white">套用</Button>}
        secondary={
            <>
                <Button variant="outline" className="w-full">重設</Button>
                <Button className="w-full bg-[#1E293B] hover:bg-[#0F172A] text-white">匯出</Button>
            </>
        }
    />
</ManageFilterGrid>
```

### 模式 C：簡化版（僅搜尋 + 新增）

```tsx
<ManageFilterGrid>
    <ManageFilterField size="two-thirds">
        <Input placeholder="搜尋..." className="h-10" />
    </ManageFilterField>
    
    <ManageFilterActions
        primary={
            <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white">
                <Plus className="mr-2 h-4 w-4" />
                新增項目
            </Button>
        }
    />
</ManageFilterGrid>
```

## 欄位大小選擇指南

`ManageFilterField` 提供 5 種預設大小：

| Size | 桌面寬度 | 適用情境 |
|------|---------|---------|
| `full` | 12 欄 (100%) | 完整搜尋列 |
| `half` | 6 欄 (50%) | 對稱布局 |
| `third` | 4 欄 (33.33%) | 搜尋框、主要篩選 |
| `quarter` | 3 欄 (25%) | 下拉選單、日期 |
| `two-thirds` | 8 欄 (66.67%) | 搜尋框 + 小按鈕 |

**選擇原則**：
- 搜尋框通常使用 `third` 或 `two-thirds`
- 下拉選單使用 `quarter`
- 日期選擇器使用 `quarter`
- 按鈕群組自動佔據剩餘空間

## 頁面遷移檢查清單

### 公告管理 (`manage/admin/posts/index.tsx`)

- [ ] 替換篩選器為 `ManageFilterGrid`
- [ ] 修正「新增公告」按鈕為 Success 色
- [ ] 修正「套用篩選」按鈕為 Primary 色
- [ ] 修正「匯出」按鈕為 Neutral 色
- [ ] 修正批次操作按鈕顏色

### 標籤管理 (`manage/admin/tags/index.tsx`)

- [ ] 替換篩選器為 `ManageFilterGrid`
- [ ] 修正「新增標籤」按鈕為 Success 色
- [ ] 修正「套用」按鈕為 Primary 色
- [ ] 確保對話框內表單間距統一

### 使用者管理 (`manage/admin/users/index.tsx`)

- [ ] 替換篩選器為 `ManageFilterGrid`
- [ ] 修正「邀請新成員」按鈕為 Success 色
- [ ] 修正「套用篩選」按鈕為 Primary 色
- [ ] 修正「匯出」按鈕為 Neutral 色

### 附件管理 (`manage/admin/attachments/index.tsx`)

- [ ] 替換篩選器為 `ManageFilterGrid`
- [ ] 修正「上傳附件」按鈕為 Success 色
- [ ] 修正「套用條件」按鈕為 Primary 色
- [ ] 修正批次刪除按鈕為 Danger 色

### 聯絡訊息 (`manage/admin/messages/index.tsx`)

- [ ] 替換篩選器為 `ManageFilterGrid`
- [ ] 修正「匯出紀錄」按鈕為 Neutral 色
- [ ] 修正「標記為已讀」按鈕為 Primary 色

## 測試驗證

遷移完成後，請在以下環境測試：

1. **桌面** (≥1024px)：確認欄位分配正確、按鈕對齊
2. **平板** (768-1023px)：確認欄位自動調整、無溢出
3. **手機** (<768px)：確認所有欄位全寬、按鈕可單手操作

### 視覺檢查項目

- [ ] 所有篩選器容器有統一的圓角和陰影
- [ ] 欄位間距統一為 `gap-3`
- [ ] 按鈕高度統一為 `h-10` 或 `h-11`
- [ ] 手機版按鈕全寬且可輕鬆點擊
- [ ] 顏色符合語意規範（綠色=新增、藍色=套用、灰色=匯出、紅色=刪除）

## 常見問題

### Q: 我需要自定義欄位寬度怎麼辦？

A: 可以傳入自定義的 `className` 覆蓋預設大小：

```tsx
<ManageFilterField size="third" className="lg:col-span-5">
    {/* ... */}
</ManageFilterField>
```

### Q: 按鈕需要 loading 狀態怎麼處理？

A: 保持原有的 loading 邏輯，只修改顏色類別：

```tsx
<Button 
    className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white"
    disabled={isLoading}
>
    {isLoading ? <Spinner /> : <Filter className="mr-2 h-4 w-4" />}
    套用篩選
</Button>
```

### Q: ManageToolbar 和 ManageFilterGrid 有什麼區別？

A: 
- `ManageToolbar`：頁面頂部的通用操作列，支援水平/垂直排列
- `ManageFilterGrid`：專門用於篩選器的網格容器，固定 12 欄布局

通常一個頁面可能同時使用兩者：
```tsx
<ManageToolbar primary={/* 主要動作 */} secondary={/* 次要動作 */} />
<ManageFilterGrid>{/* 篩選欄位 */}</ManageFilterGrid>
```

## 相關資源

- [UI 設計規範](.docs/manage/ui.md)
- [ManageFilterGrid 元件文件](../../resources/js/components/manage/manage-filter-grid.tsx)
- [ManageToolbar 元件文件](../../resources/js/components/manage/manage-toolbar.tsx)
- [Button 顏色規範](.docs/manage/ui.md#16-按鈕尺寸與規範)
