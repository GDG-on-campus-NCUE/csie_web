# 附件管理頁面更新範例

此文件展示如何將舊的狀態卡片改為使用新的 StatusFilterTabs 組件

## 步驟 1: 引入必要的組件和圖標

```typescript
import StatusFilterTabs from '@/components/manage/status-filter-tabs';
import { Image, FileText, Video, Music, FolderKanban } from 'lucide-react';
```

## 步驟 2: 在組件內建立篩選選項 (useMemo)

```typescript
export default function ManageAdminAttachmentsIndex() {
    // ... 其他程式碼 ...

    // 定義類型篩選選項
    const typeFilterOptions = useMemo(() => [
        {
            value: '',
            label: '全部附件',
            count: attachments.meta.total,
            icon: FolderKanban
        },
        {
            value: 'image',
            label: '圖片',
            count: typeSummary.image ?? 0,
            icon: Image
        },
        {
            value: 'document',
            label: '文件',
            count: typeSummary.document ?? 0,
            icon: FileText
        },
        {
            value: 'video',
            label: '影片',
            count: typeSummary.video ?? 0,
            icon: Video
        },
        {
            value: 'audio',
            label: '音訊',
            count: typeSummary.audio ?? 0,
            icon: Music
        }
    ], [attachments.meta.total, typeSummary]);

    // 處理類型篩選變更
    const handleTypeFilterChange = (value: string) => {
        updateFilterForm('type', value);
        applyFilters({ type: value });
    };
}
```

## 步驟 3: 在渲染中使用 StatusFilterTabs

```tsx
return (
    <>
        <Head title={pageTitle} />
        <ManagePage
            title={pageTitle}
            description="管理公告使用的文件與媒體資源。"
            breadcrumbs={breadcrumbs}
            toolbar={toolbar}
        >
            {/* 類型篩選標籤 - 取代原本的 Card 區塊 */}
            <section className="mb-4">
                <StatusFilterTabs
                    options={typeFilterOptions}
                    value={filterForm.type}
                    onChange={handleTypeFilterChange}
                />
            </section>

            {/* 主要內容區域 - 保持白底設計 */}
            <section className="rounded-xl border border-neutral-200/80 bg-white shadow-sm">
                {/* 表格或其他內容 */}
            </section>
        </ManagePage>
    </>
);
```

## 舊版本 (移除這些)

```tsx
// ❌ 舊的黑底 Card 設計
<section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
    {typeOptions.map((type) => (
        <Card key={type.value} className="border border-neutral-200/80">
            <CardContent className="flex flex-col gap-1 px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {type.label}
                </span>
                <span className="text-2xl font-semibold text-neutral-900">
                    {type.count ?? typeSummary[type.value] ?? 0}
                </span>
            </CardContent>
        </Card>
    ))}
</section>
```

## 其他頁面的圖標建議

### 聯絡訊息管理 (Contact Messages)
- MessageSquare (全部)
- Mail (未讀)
- MailCheck (已讀)
- Reply (已回覆)
- Archive (已封存)

### 使用者管理 (Users)
- Users (全部)
- UserCheck (已啟用)
- UserX (已停用)
- Clock (待審核)
- Shield (管理員)

### 實驗室管理 (Labs)
- Microscope (全部)
- Building2 (已發布)
- Edit3 (編輯中)
- Eye (已隱藏)

### 專案管理 (Projects)
- FolderKanban (全部)
- PlayCircle (進行中)
- CheckCircle (已完成)
- PauseCircle (已暫停)
- Archive (已封存)
