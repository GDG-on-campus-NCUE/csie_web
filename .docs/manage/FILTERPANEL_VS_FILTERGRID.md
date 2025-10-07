# FilterPanel vs ManageFilterGrid 選擇指南

> 建立時間：2025-10-06

## 📊 元件比較

### FilterPanel（✅ 推薦用於管理頁面）

**特點**:
- ✅ **可折疊** (Collapsible) - 使用者可展開/收合
- ✅ **有標題和圖示** - 清楚顯示「篩選條件」
- ✅ **內建操作按鈕** - 自動提供「套用」和「重設」按鈕
- ✅ **卡片式設計** - 視覺層次分明
- ✅ **更符合傳統UI** - 類似其他管理系統的篩選面板

**適用場景**:
- ✅ 管理後台頁面（Posts, Tags, Users, etc.）
- ✅ 需要可折疊功能的篩選器
- ✅ 篩選條件較多，需要節省空間
- ✅ 需要內建「套用」和「重設」按鈕

**範例結構**:
```tsx
<FilterPanel
    title="篩選條件"
    collapsible={true}
    defaultOpen={true}
    onApply={handleApply}
    onReset={handleReset}
>
    <div className="grid grid-cols-12 gap-3">
        {/* 內部使用 12 欄網格布局 */}
        <div className="col-span-12 md:col-span-4 space-y-2">
            <label>搜尋</label>
            <Input />
        </div>
        {/* ...更多欄位 */}
    </div>
</FilterPanel>
```

---

### ManageFilterGrid（⚠️ 用於特殊場景）

**特點**:
- ✅ **固定顯示** - 始終可見，不可折疊
- ✅ **扁平化設計** - 無卡片包裝
- ✅ **靈活的操作按鈕位置** - 使用 ManageFilterActions 自定義
- ✅ **預定義尺寸** - full, half, third, quarter, two-thirds

**適用場景**:
- ⚠️ 需要始終顯示的簡單篩選器（1-3 個欄位）
- ⚠️ Storybook 展示網格系統用途
- ⚠️ 不需要折疊功能的特殊頁面

**範例結構**:
```tsx
<ManageFilterGrid>
    <ManageFilterField size="third">
        <Input placeholder="搜尋..." />
    </ManageFilterField>
    
    <ManageFilterField size="quarter">
        <Select>{/* 選項 */}</Select>
    </ManageFilterField>
    
    <ManageFilterActions
        primary={<Button>套用</Button>}
        secondary={<Button>重設</Button>}
    />
</ManageFilterGrid>
```

---

## 🎯 決策樹

```
需要可折疊功能？
├─ 是 → 使用 FilterPanel ✅
└─ 否 → 繼續...

是管理頁面嗎？
├─ 是 → 使用 FilterPanel ✅（建議開啟 collapsible）
└─ 否 → 繼續...

欄位數量 > 3 個？
├─ 是 → 使用 FilterPanel ✅
└─ 否 → ManageFilterGrid 或 FilterPanel 皆可

需要內建按鈕樣式？
├─ 是 → 使用 FilterPanel ✅
└─ 否 → 使用 ManageFilterGrid ⚠️
```

---

## 📝 實際應用案例

### 案例 1：公告管理頁面

**選擇**: FilterPanel ✅

**原因**:
1. 欄位較多（搜尋、標籤、每頁筆數）
2. 需要可折疊節省空間
3. 需要清楚的「篩選條件」標題
4. 符合管理後台的傳統UI

**實作**:
```tsx
<FilterPanel
    title="篩選條件"
    collapsible={true}
    defaultOpen={true}
    onApply={() => applyFilters()}
    onReset={handleClearFilters}
>
    <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-4 space-y-2">
            <label>搜尋公告</label>
            <Input type="search" value={keyword} onChange={...} />
        </div>
        <div className="col-span-12 md:col-span-4 space-y-2">
            <label>標籤篩選</label>
            <Select value={tag} onChange={...}>{/* 選項 */}</Select>
        </div>
        <div className="col-span-12 md:col-span-4 space-y-2">
            <label>每頁筆數</label>
            <Select value={perPage} onChange={...}>{/* 選項 */}</Select>
        </div>
    </div>
</FilterPanel>
```

### 案例 2：標籤管理頁面

**選擇**: FilterPanel ✅

**原因**:
1. 欄位多（搜尋、模組、狀態、每頁筆數）
2. 需要可折疊功能
3. 操作按鈕（合併、新增）需要獨立顯示
4. 內建的「套用」和「重設」按鈕很方便

**實作**:
```tsx
<>
    <FilterPanel
        title="互動式篩選"
        collapsible={true}
        defaultOpen={true}
        onApply={() => applyFilters()}
        onReset={handleResetFilters}
    >
        <div className="grid grid-cols-12 gap-3">
            {/* 4 個篩選欄位 */}
        </div>
    </FilterPanel>

    {/* 獨立的操作按鈕區 */}
    <div className="flex justify-between">
        <span>已選擇 {count} 筆</span>
        <div className="flex gap-2">
            <Button onClick={merge}>合併</Button>
            <Button onClick={create}>新增標籤</Button>
        </div>
    </div>
</>
```

### 案例 3：Storybook 網格展示

**選擇**: ManageFilterGrid ✅

**原因**:
1. 用於展示網格系統本身
2. 不需要折疊功能
3. 需要清楚展示預定義尺寸（full, half, third, etc.）
4. Storybook 文件用途

---

## 🎨 設計原則

### FilterPanel 的優勢

1. **視覺層次**
   - Card 包裝提供清楚的邊界
   - 標題和圖示增強可識別性
   - 折疊功能節省螢幕空間

2. **使用者體驗**
   - 可折疊減少視覺雜亂
   - 內建按鈕位置固定，符合預期
   - 互動式提示（展開/收合圖示）

3. **開發便利性**
   - 不需要自行管理「套用」和「重設」按鈕
   - 自動處理折疊狀態
   - 統一的 API 設計

### ManageFilterGrid 的優勢

1. **簡潔性**
   - 無額外視覺包裝
   - 扁平化設計
   - 適合簡單場景

2. **靈活性**
   - 完全自定義操作按鈕位置
   - 預定義尺寸易於響應式設計
   - 可用於非篩選用途

---

## 📐 內部網格布局

兩個元件都支援內部使用 12 欄網格系統：

```tsx
<div className="grid grid-cols-12 gap-3">
    {/* full: 12 欄 */}
    <div className="col-span-12">...</div>
    
    {/* half: 6 欄 */}
    <div className="col-span-12 md:col-span-6">...</div>
    
    {/* third: 4 欄 */}
    <div className="col-span-12 md:col-span-4">...</div>
    
    {/* quarter: 3 欄 */}
    <div className="col-span-12 md:col-span-3">...</div>
    
    {/* two-thirds: 8 欄 */}
    <div className="col-span-12 md:col-span-8">...</div>
</div>
```

---

## 🔄 遷移指南

### 從 ManageToolbar 遷移到 FilterPanel

**Before** (ManageToolbar):
```tsx
<ManageToolbar
    primary={<form>...</form>}
    secondary={<div>操作按鈕</div>}
/>
```

**After** (FilterPanel):
```tsx
<>
    <FilterPanel
        title="篩選條件"
        onApply={handleApply}
        onReset={handleReset}
    >
        {/* 篩選欄位 */}
    </FilterPanel>
    
    {/* 獨立的操作按鈕區 */}
    <div className="操作按鈕區樣式">
        {/* 操作按鈕 */}
    </div>
</>
```

### 從 ManageFilterGrid 遷移到 FilterPanel

**Before** (ManageFilterGrid):
```tsx
<ManageFilterGrid>
    <ManageFilterField size="third">
        <Input />
    </ManageFilterField>
    <ManageFilterActions primary={...} secondary={...} />
</ManageFilterGrid>
```

**After** (FilterPanel):
```tsx
<FilterPanel onApply={...} onReset={...}>
    <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-4 space-y-2">
            <label>標籤</label>
            <Input />
        </div>
    </div>
</FilterPanel>
```

**關鍵差異**:
1. ✅ 添加 `label` 提升可讀性
2. ✅ 使用 `space-y-2` 統一間距
3. ✅ `onApply` 和 `onReset` 替代 ManageFilterActions
4. ✅ 內部使用標準網格類別（col-span-*）

---

## 📚 相關文件

- [FilterPanel 元件文件](./filter-panel.tsx)
- [ManageFilterGrid 元件文件](./manage-filter-grid.tsx)
- [UI 規範](./.docs/manage/ui.md)
- [重構進度](./REFACTORING_PROGRESS.md)

---

## 💡 最佳實踐

### ✅ DO

```tsx
// ✅ 管理頁面使用 FilterPanel
<FilterPanel title="篩選條件" collapsible={true}>
    <div className="grid grid-cols-12 gap-3">
        {/* 欄位加上 label */}
        <div className="col-span-12 md:col-span-4 space-y-2">
            <label className="text-sm font-medium text-neutral-700">
                搜尋
            </label>
            <Input />
        </div>
    </div>
</FilterPanel>

// ✅ 保持一致的按鈕顏色
<Button className="bg-[#10B981] hover:bg-[#059669]">
    新增
</Button>
```

### ❌ DON'T

```tsx
// ❌ 管理頁面不要用 ManageFilterGrid（除非有特殊原因）
<ManageFilterGrid>
    <ManageFilterField size="third">
        <Input /> {/* 缺少 label */}
    </ManageFilterField>
</ManageFilterGrid>

// ❌ 不要混用不同的按鈕顏色
<Button className="bg-red-500">套用</Button>
<Button className="bg-blue-500">重設</Button>
```

---

## 🎯 結論

**管理頁面一律使用 FilterPanel** ✅

理由：
1. 可折疊功能是管理頁面的標準需求
2. 內建按鈕減少重複程式碼
3. 卡片式設計提升視覺層次
4. 符合使用者對管理系統的預期
5. 更容易維護和擴展

ManageFilterGrid 保留給：
- Storybook 文件展示
- 特殊的非管理頁面場景
- 需要完全自定義的極簡篩選器
