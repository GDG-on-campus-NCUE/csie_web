# 管理後台 UI 設計規範

> 本文件補充 ARCHITECTURE.md 中未涵蓋的 UI 設計規則，確保所有管理頁面具有一致的視覺風格和使用者體驗。

## 📋 目錄

1. [色彩系統](#色彩系統)
2. [按鈕設計](#按鈕設計)
3. [容器與卡片](#容器與卡片)
4. [表格設計](#表格設計)
5. [狀態標籤](#狀態標籤)
6. [抽屜與對話框](#抽屜與對話框)
7. [響應式設計 (RWD)](#響應式設計-rwd)
8. [多語言支援](#多語言支援)
9. [參考範例](#參考範例)

---

## 色彩系統

### 語意化按鈕顏色

參考聯絡訊息 (`/manage/admin/messages`) 頁面的成功實作：

```tsx
// ✅ 正確：明確的語意化色彩
<Button className="bg-[#10B981] hover:bg-[#059669] text-white">
  新增 / 上傳
</Button>

<Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
  套用篩選 / 確認操作
</Button>

<Button className="bg-[#EF4444] hover:bg-[#DC2626] text-white">
  刪除 / 重設
</Button>

<Button className="bg-[#1E293B] hover:bg-[#0F172A] text-white">
  匯出 / 次要操作
</Button>

// ❌ 避免：使用不明確的 variant
<Button variant="tonal">新增公告</Button>
```

### 中性與背景色

```tsx
// 容器背景
bg-white/95
border-neutral-200/80

// Hover 效果
hover:bg-blue-50/40      // 表格行
hover:bg-neutral-50      // 活動列表
hover:bg-neutral-50/70   // 標籤管理

// 選中狀態
bg-blue-50/50            // 勾選的列

// 區塊背景
bg-neutral-50/70         // Sheet 內容區
```

---

## 按鈕設計

### 主要操作按鈕

| 操作類型 | 背景色 | Hover 色 | 文字色 | Icon |
|---------|--------|---------|--------|------|
| 新增/上傳 | `#10B981` | `#059669` | `white` | Plus, CloudUpload, UserPlus |
| 確認/套用 | `#3B82F6` | `#2563EB` | `white` | Filter, CheckCircle |
| 刪除/重設 | `#EF4444` | `#DC2626` | `white` | Trash2, RefreshCcw |
| 匯出/下載 | `#1E293B` | `#0F172A` | `white` | Download |

### 次要操作按鈕

```tsx
// 批次操作、篩選選單
<Button variant="outline" size="sm">
  批次操作
</Button>

// 取消、關閉
<Button variant="ghost">
  取消
</Button>
```

### 按鈕組排列

```tsx
// ✅ 正確：使用語意化間距與對齊
<div className="flex items-center gap-3">
  <Button>主要操作</Button>
  <div className="w-px h-6 bg-neutral-200" /> {/* 分隔線 */}
  <Button variant="outline">次要操作</Button>
</div>
```

---

## 容器與卡片

### 標準卡片樣式

```tsx
// 主要內容容器
<section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
  {/* 內容 */}
</section>

// 統計卡片
<div className="rounded-xl border border-neutral-200/70 bg-white/80 px-4 py-3">
  <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
    標題
  </div>
  <div className="text-2xl font-semibold text-neutral-900">
    數值
  </div>
</div>
```

### 統計卡片網格

```tsx
// ✅ 響應式統計卡片排列
<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  {statusCards}
</div>
```

---

## 表格設計

### 表格容器

```tsx
<section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
  <Table>
    <TableHeader>
      <TableRow className="border-neutral-200/80">
        <TableHead className="text-neutral-500">欄位名稱</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="border-neutral-200/60 transition hover:bg-blue-50/40">
        {/* 資料列 */}
      </TableRow>
    </TableBody>
  </Table>
</section>
```

### 選中狀態

```tsx
<TableRow 
  className={cn(
    'border-neutral-200/60 transition-colors duration-150',
    isSelected && 'bg-blue-50/50'
  )}
>
```

### 表格欄位配色

- **表頭文字**：`text-neutral-500`
- **主要內容**：`text-neutral-800` (標題/名稱)
- **次要內容**：`text-neutral-600` (一般資料)
- **輔助資訊**：`text-neutral-400` 或 `text-neutral-500` (時間、ID)

---

## 狀態標籤

### Badge 樣式對照表

#### 公告狀態

```tsx
const statusVariantMap = {
  draft: 'outline',
  scheduled: 'secondary',
  published: 'default',
  hidden: 'outline',
  archived: 'outline',
};

<Badge variant={statusVariantMap[status]} className="capitalize">
  {t(`status.${status}`, status)}
</Badge>
```

#### 可見性

```tsx
const visibilityToneMap = {
  public: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  internal: 'bg-amber-100 text-amber-700 border-amber-200',
  private: 'bg-rose-100 text-rose-700 border-rose-200',
};

<Badge variant="outline" className={visibilityToneMap[visibility]}>
  {visibility}
</Badge>
```

#### 使用者狀態

```tsx
// 啟用
<Badge variant="outline" className="gap-1 border-2 border-emerald-200 bg-emerald-50 text-emerald-700">
  <ShieldCheck className="h-3 w-3" />
  啟用中
</Badge>

// 停用
<Badge variant="outline" className="gap-1 border-2 border-amber-200 bg-amber-50 text-amber-700">
  <ShieldAlert className="h-3 w-3" />
  已停用
</Badge>
```

---

## 抽屜與對話框

### Sheet (側邊抽屜)

```tsx
<Sheet open={detailOpen} onOpenChange={setDetailOpen}>
  <SheetContent className="w-full sm:max-w-xl">
    <SheetHeader>
      <SheetTitle className="flex items-center gap-2 text-lg font-semibold text-neutral-800">
        <Icon className="h-5 w-5 text-blue-600" />
        標題
      </SheetTitle>
      <SheetDescription className="text-sm text-neutral-500">
        描述文字
      </SheetDescription>
    </SheetHeader>

    {/* 內容區塊 */}
    <div className="flex flex-col gap-4">
      {/* 資訊卡片 */}
      <div className="rounded-lg border border-neutral-200/70 bg-neutral-50/80 p-3">
        {/* 內容 */}
      </div>
    </div>
  </SheetContent>
</Sheet>
```

### Dialog (對話框)

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>標題</DialogTitle>
      <DialogDescription>描述</DialogDescription>
    </DialogHeader>
    
    {/* 表單內容 */}
    
    <div className="flex items-center justify-end gap-2">
      <Button variant="outline" onClick={() => setOpen(false)}>
        取消
      </Button>
      <Button type="submit">
        確認
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

---

## 響應式設計 (RWD)

### Breakpoints 標準

```tsx
// Tailwind 預設斷點
sm: 640px   // 手機橫向、小平板
md: 768px   // 平板
lg: 1024px  // 筆電
xl: 1280px  // 桌機
2xl: 1536px // 大螢幕
```

### 工具列 (Toolbar) 響應式

```tsx
// ✅ 正確：優先處理垂直排列
<div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
  {/* 搜尋與篩選 */}
  <form className="flex flex-wrap items-center gap-2">
    <Input className="w-56" />
    <Select className="w-40" />
  </form>
  
  {/* 操作按鈕 */}
  <div className="flex flex-wrap items-center gap-2">
    <Button>主要操作</Button>
  </div>
</div>
```

### 統計卡片響應式

```tsx
// ✅ 正確：漸進式網格
<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  {/* Mobile: 1列，Tablet: 2列，Desktop: 4列 */}
</div>
```

### 表格響應式

```tsx
// 小螢幕使用卡片替代表格
{isMobile ? (
  <div className="grid gap-4">
    {items.map(item => (
      <Card key={item.id}>
        {/* 卡片內容 */}
      </Card>
    ))}
  </div>
) : (
  <Table>
    {/* 表格內容 */}
  </Table>
)}
```

---

## 多語言支援

### 使用 Translator Hook

```tsx
const { t } = useTranslator('manage');
const { t: tMessages } = useTranslator('manage.messages');

// ✅ 正確：所有文字使用 t()
<Button>
  {t('actions.create', '建立')}
</Button>

// ❌ 避免：寫死文字
<Button>建立</Button>
```

### 狀態與標籤翻譯

```tsx
// ✅ 正確：動態翻譯
<Badge>
  {t(`status.${item.status}`, item.status)}
</Badge>

// ✅ 正確：提供 fallback
{t('messages.empty.title', '尚無訊息')}
```

### 日期時間格式化

```tsx
// ✅ 統一使用工具函數
function formatDateTime(value: string | null, locale: string): string {
  if (!value) return '—';
  
  return new Date(value).toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 使用
{formatDateTime(item.created_at, locale)}
```

### 檔案大小格式化

```tsx
// ✅ 統一使用工具函數 (已在 shared/utils)
import { formatBytes } from '@/lib/shared/utils';

{formatBytes(attachment.size)}
```

---

## 參考範例

### 最佳實踐頁面

1. **聯絡訊息管理** (`/manage/admin/messages/index.tsx`)
   - ✅ 完整的色彩系統
   - ✅ 清晰的視覺層次
   - ✅ 優秀的 Sheet 設計
   - ✅ 狀態卡片展示

2. **使用者管理** (`/manage/admin/users/index.tsx`)
   - ✅ 完整的篩選器設計
   - ✅ Sheet 詳細資訊展示
   - ✅ 批次操作流程
   - ✅ 狀態 Badge 使用

3. **附件管理** (`/manage/admin/attachments/index.tsx`)
   - ✅ List/Grid 雙視圖
   - ✅ 完整的篩選系統
   - ✅ 批次下載/刪除
   - ✅ Toast 通知

### 需要改進的頁面

1. **公告管理** (`/manage/admin/posts/index.tsx`)
   - ⚠️ 按鈕使用 `variant="tonal"` 需改為明確色彩
   - ✅ StatusFilterTabs 設計良好，保持

2. **標籤管理** (`/manage/admin/tags/index.tsx`)
   - ⚠️ 按鈕顏色需明確指定
   - ⚠️ Toast 位置需統一
   - ✅ Dialog 表單設計良好

3. **儀表板** (`/manage/admin/dashboard.tsx`)
   - ✅ StatCard 設計良好
   - ⚠️ 活動列表需統一 hover 效果

---

## 檢查清單

在提交程式碼前，請確認：

### 視覺設計
- [ ] 按鈕顏色使用語意化色彩（綠/藍/紅/深灰）
- [ ] 容器使用標準樣式（rounded-xl, border-neutral-200/80）
- [ ] 表格具有 hover 效果（hover:bg-blue-50/40）
- [ ] Badge 使用正確的 variant 和色系

### 響應式
- [ ] Toolbar 在手機為垂直排列
- [ ] 統計卡片使用響應式 grid
- [ ] Sheet 在手機全螢幕顯示 (w-full)
- [ ] 按鈕群組自動換行 (flex-wrap)

### 多語言
- [ ] 所有文字使用 `t()` 函數
- [ ] 提供英文 fallback
- [ ] 日期使用統一格式化函數
- [ ] 狀態/標籤支援翻譯

### 互動體驗
- [ ] 載入中顯示 loading 狀態
- [ ] 操作後顯示 Toast 通知
- [ ] 批次操作前顯示確認對話框
- [ ] 表單驗證錯誤明確顯示

---

## 更新日誌

- **2025-10-06**: 初版建立，基於聯絡訊息頁面的成功設計模式
- 分析來源：`messages/index.tsx`, `users/index.tsx`, `attachments/index.tsx`, `posts/index.tsx`, `tags/index.tsx`, `dashboard.tsx`
