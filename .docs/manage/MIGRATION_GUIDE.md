# Manage 後台元件遷移指南 (草稿)

> 本指南協助既有 manage 頁面導入新版工具列、卡片與響應式資料呈現元件,確保在桌機與行動裝置有一致的體驗。

## 1. 遷移順序建議

1. 盤點頁面是否有列表資料,優先導入 `ResponsiveDataView`。
2. 更新行動版卡片樣式,改用新版 `DataCard`。
3. 重新整理頁面操作列,以 `ManageToolbar` 統一排版。
4. 替換空狀態與載入畫面,使用更新後的 `TableEmpty` 與 `TableLoading`。
5. 依需求補充 `mobileActions`、`stickyActions` 等行動版互動。

## 2. ResponsiveDataView

```tsx
import ResponsiveDataView from '@/components/manage/responsive-data-view';
import Table from '@/components/ui/table';
import DataCard from '@/components/manage/data-card';

<ResponsiveDataView
  mode="auto"
  breakpoint="md"
  isLoading={isLoading}
  isEmpty={items.length === 0}
  table={() => (
    <Table>
      {/* 表格內容 */}
    </Table>
  )}
  card={() => (
    <div className="space-y-4">
      {items.map((item) => (
        <DataCard key={item.id} title={item.title} />
      ))}
    </div>
  )}
  stickyActions={
    selectedIds.length > 0 ? (
      <>
        <Button className="bg-[#1E293B] hover:bg-[#0F172A] text-white">批次匯出</Button>
        <Button variant="outline">取消</Button>
      </>
    ) : null
  }
/>
```

- 預設 `mode="auto"` 會在 `<md` 顯示卡片,在 `>=md` 顯示表格。
- 若已有行動版自訂邏輯,可改為 `mode="card"` 或 `mode="table"`。
- `stickyActions` 僅在行動版顯示,適合批次操作。

## 3. DataCard

```tsx
<DataCard
  title={post.title}
  description={post.summary}
  status={{ label: post.statusLabel, tone: post.statusTone }}
  metadata={[
    { label: t('manage.author'), value: post.author },
    { label: t('manage.updated_at'), value: formatDate(post.updatedAt) },
  ]}
  actions={
    <>
      <Button size="sm">{t('actions.edit')}</Button>
      <Button size="sm" variant="outline">{t('actions.preview')}</Button>
    </>
  }
  mobileActions={
    <Button size="sm" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
      {t('actions.edit')}
    </Button>
  }
/>
```

- 新增 `children` slot 可插入自訂段落或列表。
- `mobileActions` 僅在 `<md` 顯示,可補充專屬操作。
- 若後端僅提供文字顏色,可使用 `status={{ label, badgeColor: 'bg-...' }}` 客製。

## 4. ManageToolbar

```tsx
import ManageToolbar from '@/components/manage/manage-toolbar';

<ManageToolbar
  primary={
    <>
      <Button className="bg-[#10B981] hover:bg-[#059669] text-white">{t('actions.create')}</Button>
      <Button variant="outline">{t('actions.reset')}</Button>
    </>
  }
  secondary={<Button variant="ghost">{t('actions.export')}</Button>}
>
  {/* 可放入篩選表單或補充說明 */}
</ManageToolbar>
```

- 預設 `orientation="horizontal"`, 行動版自動改為直向堆疊。
- 若需要垂直排版,設定 `orientation="vertical"`。
- `wrap` 可允許桌機段落自動換行避免溢出。

## 5. 狀態與回饋

- 空狀態: `TableEmpty` 可傳入自訂 `icon`, `title`, `description`, `action`。
- 載入: `TableLoading` 內建旋轉圖示與 Skeleton,可自訂 `message` 與 `description`。

## 6. 實作檢查清單

- [ ] 行動版無水平捲軸,操作按鈕可單手點擊。
- [ ] 表格欄位寬度不再硬寫,改由 `ResponsiveDataView` 控制。
- [ ] 狀態顏色符合 `.docs/manage/ui.md` 規範。
- [ ] 所有空狀態與載入畫面皆使用新元件。
- [ ] `plan.md` 內的對應任務已勾選並附上截圖。

> 如遇相容性問題,請於 PR 描述紀錄阻塞原因與暫時方案,供後續追蹤。
