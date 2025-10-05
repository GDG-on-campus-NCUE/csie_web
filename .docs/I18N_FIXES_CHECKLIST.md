# i18n 修復檢查清單

本文件記錄各管理頁面需要套用 `useTranslator` 的硬編碼中文文字。

## 修復規則

1. **使用 `useTranslator` hook**
   ```tsx
   const { t } = useTranslator('manage');
   const { t: tTags } = useTranslator('manage.tags');
   ```

2. **轉換模式**
   ```tsx
   // 修改前
   <Button>套用</Button>
   
   // 修改後
   <Button>{t('filters.apply', '套用')}</Button>
   ```

3. **帶參數的翻譯**
   ```tsx
   // 修改前
   `已選擇 ${count} 筆`
   
   // 修改後
   t('bulk.selected', '已選擇 :count 筆', { count })
   ```

---

## 📋 tags/index.tsx - 需修復項目 (優先度: P1)

### ✅ 已有 useTranslator
```tsx
const { t } = useTranslator('manage');
```

### ❌ 需新增特定 scope
```tsx
const { t: tTags } = useTranslator('manage.tags');
```

### 🔴 硬編碼項目清單

#### Toolbar 區域 (行 403-436)
- `placeholder="搜尋標籤名稱或代碼"` → `placeholder={tTags('filters.keyword_placeholder', '搜尋標籤名稱或代碼')}`
- `aria-label="搜尋標籤"` → `aria-label={tTags('filters.keyword_label', '搜尋標籤')}`
- `套用` → `{tTags('filters.apply', '套用')}`
- `aria-label="模組篩選"` → `aria-label={tTags('filters.context_label', '模組篩選')}`
- `全部模組` → `{tTags('filters.context_all', '全部模組')}`
- `aria-label="狀態篩選"` → `aria-label={tTags('filters.status_label', '狀態篩選')}`
- `全部狀態` → `{tTags('filters.status_all', '全部狀態')}`
- `aria-label="每頁筆數"` → `aria-label={tTags('filters.per_page_label', '每頁筆數')}`
- ` 筆/頁` → `{tTags('filters.per_page_option', ':count 筆/頁', { count: option })}`
- `重設` → `{tTags('filters.reset', '重設')}`
- `已選擇 {selectedIds.length} 筆` → `{tTags('bulk.selected', '已選擇 :count 筆', { count: selectedIds.length })}`
- `合併` → `{tTags('bulk.merge', '合併')}`
- `新增標籤` → `{tTags('actions.create', '新增標籤')}`

#### Page Header 區域 (行 477)
- `description="集中管理..."` → `description={tTags('description', '集中管理公告、附件與空間所使用的標籤，支援合併與拆分等維運操作。')}`

#### Table 區域 (行 489-580)
- `aria-label="選取全部"` → `aria-label={tTags('table.select_all', '選取全部')}`
- `標籤名稱` → `{tTags('table.name', '標籤名稱')}`
- `狀態` → `{tTags('table.status', '狀態')}`
- `aria-label={\`選取標籤 ${tag.name}\`}` → `aria-label={tTags('table.select_tag', '選取標籤 :name', { name: tag.name })}`
- `title="目前沒有符合條件的標籤"` → `title={tTags('empty.title', '目前沒有符合條件的標籤')}`
- `description="您可以調整篩選條件..."` → `description={tTags('empty.description', '您可以調整篩選條件，或建立新的標籤來分類後台資料。')}`
- `新增標籤` (按鈕) → `{tTags('empty.action', '新增標籤')}`

#### Toast Messages (行 238-348)
- `'已停用標籤' : '已啟用標籤'` → `tTags(tag.is_active ? 'toast.disabled' : 'toast.enabled', tag.is_active ? '已停用標籤' : '已啟用標籤')`
- `'更新狀態失敗'` → `tTags('toast.update_failed', '更新狀態失敗')`
- `'標籤已建立'` → `tTags('toast.created', '標籤已建立')`
- `'新增失敗'` → `tTags('toast.create_failed', '新增失敗')`
- `'請稍後再試。'` → `tTags('toast.retry', '請稍後再試。')`
- `'標籤已更新'` → `tTags('toast.updated', '標籤已更新')`
- `'請先選擇至少兩個標籤'` → `tTags('toast.select_minimum', '請先選擇至少兩個標籤')`
- `'標籤合併完成'` → `tTags('toast.merged', '標籤合併完成')`
- `'合併失敗'` → `tTags('toast.merge_failed', '合併失敗')`
- `'請輸入至少一個新標籤名稱'` → `tTags('toast.split_required', '請輸入至少一個新標籤名稱')`
- `'已建立新標籤'` → `tTags('toast.split_created', '已建立新標籤')`

#### Dialog: Create/Edit Tag (行 714-800)
- `{mode === 'create' ? '新增標籤' : '編輯標籤'}` → `{tTags(mode === 'create' ? 'dialog.create_title' : 'dialog.edit_title', mode === 'create' ? '新增標籤' : '編輯標籤')}`
- `'設定標籤的中英文名稱與顏色...'` → `{tTags('dialog.create_description', '設定標籤的中英文名稱與顏色，建立後可用於公告、附件與空間等模組。')}`
- `'更新標籤資訊並調整狀態...'` → `{tTags('dialog.edit_description', '更新標籤資訊並調整狀態，變更後會即時套用至所有關聯資料。')}`
- `label="套用模組"` → `label={tTags('form.context', '套用模組')}`
- `label="標籤名稱"` → `label={tTags('form.name', '標籤名稱')}`
- `label="狀態"` → `label={tTags('form.status', '狀態')}`
- `啟用標籤` → `{tTags('form.is_active', '啟用標籤')}`

#### Dialog: Merge Tags (行 805-840)
- `<DialogTitle>合併標籤</DialogTitle>` → `<DialogTitle>{tTags('merge.title', '合併標籤')}</DialogTitle>`
- `'選取要保留的標籤...'` → `{tTags('merge.description', '選取要保留的標籤，其餘標籤的關聯資料將轉移至保留標籤，並自動停用。')}`
- `已選擇 {selectedTags.length} 個標籤` → `{tTags('merge.selected', '已選擇 :count 個標籤', { count: selectedTags.length })}`
- `label="保留標籤"` → `label={tTags('merge.keep_label', '保留標籤')}`
- `'合併中…' : '確認合併'` → `{tTags(isSubmitting ? 'merge.submitting' : 'merge.confirm', isSubmitting ? '合併中…' : '確認合併')}`

#### Dialog: Split Tags (行 875-915)
- `<DialogTitle>拆分標籤</DialogTitle>` → `<DialogTitle>{tTags('split.title', '拆分標籤')}</DialogTitle>`
- `'以逗號或換行輸入多個新標籤名稱...'` → `{tTags('split.description', '以逗號或換行輸入多個新標籤名稱，可快速建立細分類別。')}`
- `原標籤` → `{tTags('split.source_label', '原標籤')}`
- `label="新標籤名稱"` → `label={tTags('split.new_names_label', '新標籤名稱')}`
- `description="使用逗號或換行分隔..."` → `description={tTags('split.new_names_hint', '使用逗號或換行分隔，例如：國際交流,就業資訊,活動花絮')}`
- `保留原標籤（不會自動停用）` → `{tTags('split.keep_original', '保留原標籤（不會自動停用）')}`
- `'建立中…' : '建立新標籤'` → `{tTags(isSubmitting ? 'split.submitting' : 'split.confirm', isSubmitting ? '建立中…' : '建立新標籤')}`

---

## 📋 attachments/index.tsx - 檢查結果

### ✅ 狀態: 良好
- ✅ 已使用 `useTranslator('manage.attachments')`
- ✅ 所有 UI 文字都已套用 `tAttachments()`
- ✅ Toast 訊息已國際化
- ✅ Filter/Button/Table 標籤已完整

### 📝 小建議
可檢查 line 65: `{ value: 'created_at', label: '最新上傳' }` 是否需要國際化

---

## 📋 posts/index.tsx - 檢查結果

### ✅ 狀態: 優良
- ✅ 已使用 `useTranslator('manage.posts')`
- ✅ 所有 UI 文字都已套用 `tPosts()`
- ✅ Toast/Filter/Bulk 操作已完整國際化

---

## 📋 users/index.tsx - 檢查結果

### ✅ 狀態: 優良
- ✅ 已使用 `useTranslator('manage')`
- ✅ 所有 UI 文字都已套用 `t()`
- ✅ Filters/Actions/Table 標籤已完整

---

## 📋 messages/index.tsx - 檢查結果

### ✅ 狀態: 優良 (參考範例)
- ✅ 已使用 `useTranslator('manage.messages')`
- ✅ 所有 UI 文字都已套用 `tMessages()`
- ✅ 可作為其他頁面的最佳實踐參考

---

## 📋 dashboard.tsx - 檢查結果

### ⚠️ 狀態: 需少量修改
- ✅ 已使用 `useTranslator('manage')`
- ⚠️ 需檢查統計卡片的動態內容是否需要翻譯

---

## 執行優先順序

### P1 (High Priority) - 立即修復
- [x] ~~attachments~~ (已完成)
- [x] ~~posts~~ (已完成)
- [x] ~~users~~ (已完成)
- [ ] **tags** ← **當前任務：大量硬編碼需修復**

### P2 (Medium Priority) - 次要檢查
- [ ] dashboard (少量項目)
- [ ] messages (驗證完整性)

### P3 (Low Priority) - 最後完善
- [ ] 其他管理頁面 (posts/show.tsx 等詳情頁)

---

## 修復執行計畫 (tags 頁面)

### Phase 1: 新增 translator scope
```tsx
const { t: tTags } = useTranslator('manage.tags');
```

### Phase 2: 修復 Toolbar 區域 (9個項目)
- 搜尋框 placeholder 和 aria-label
- 套用按鈕文字
- 篩選器 labels 和 options
- 重設按鈕
- 批次操作文字

### Phase 3: 修復 Table 區域 (5個項目)
- TableHead 文字
- Empty state 文字
- Aria-label 屬性

### Phase 4: 修復 Toast Messages (12個項目)
- 所有 showSuccess/showError/showWarning 呼叫

### Phase 5: 修復 Dialogs (3個對話框)
- Create/Edit Dialog (8個文字)
- Merge Dialog (5個文字)
- Split Dialog (6個文字)

---

## 驗證清單

完成修復後，檢查：
- [ ] 所有 hardcoded 中文字串已移除
- [ ] 所有 t() 函數都有提供 fallback 文字
- [ ] placeholder/aria-label/title 等屬性都已國際化
- [ ] Toast 訊息都使用翻譯函數
- [ ] Dialog 標題和描述都已套用
- [ ] 表單 label 都已翻譯
- [ ] 沒有編譯錯誤
- [ ] 切換語言測試正常運作

---

## 預估工作量

- **tags 頁面**: ~50 處修改，預計 30-40 分鐘
- **其他檢查**: ~10 分鐘
- **總計**: ~50 分鐘

---

*建立時間: 2025-10-06*
*任務: CSIE 系統 UI 改版 - P1 i18n 修復*
