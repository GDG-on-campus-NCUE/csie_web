# Sidebar 與篩選組件更新說明

## 已完成的修改

### 1. 統一 Sidebar 顯示

**問題**: 之前在不同管理頁面中，sidebar 會顯示不同的內容（有時只顯示單一的儀表板項目）

**解決方案**: 
- 修改了 `ManageLayout` 組件，確保所有管理頁面都能正確接收並傳遞 props
- `AppLayout` 已經自動處理管理頁面的路由判斷，所有 `/manage` 開頭的路由都會使用 `ManageLayout`
- 現在所有管理頁面的 sidebar 都會根據用戶角色（admin/teacher/user）顯示完整的導航項目

**相關檔案**:
- `resources/js/layouts/manage/manage-layout.tsx` - 主要佈局組件
- `resources/js/layouts/app-layout.tsx` - 路由判斷
- `resources/js/components/manage/manage-sidebar-main.tsx` - Sidebar 主要內容
- `resources/js/lib/manage/sidebar-nav-groups.ts` - Sidebar 導航配置

### 2. 創建通用篩選組件

**新組件**: `StatusFilterTabs`
- 位置: `resources/js/components/manage/status-filter-tabs.tsx`
- 功能: 提供統一的狀態篩選 UI，支援圖標、計數、活動狀態等
- 設計: 白底、乾淨、現代化的設計風格

**特性**:
```typescript
interface StatusFilterOption {
    value: string;        // 篩選值
    label: string;        // 顯示標籤
    count?: number;       // 數量徽章
    icon?: React.ComponentType<{ className?: string }>; // 圖標
}
```

### 3. 改善公告管理頁面視覺設計

**修改內容**:
- 移除了黑底的狀態卡片 (Card)
- 使用新的 `StatusFilterTabs` 組件取代
- 將篩選工具列移到 toolbar 屬性中，整合在頁面標題下方

**視覺改進**:
- ✅ 白底、乾淨的設計
- ✅ 清晰的狀態圖標（草稿、發布、排程、隱藏、封存）
- ✅ 即時數量顯示
- ✅ 活動狀態高亮顯示
- ✅ 改善的標籤篩選功能

### 4. 支援 Toolbar 屬性

**新增功能**:
- `ManageMainProps` 新增 `toolbar` 屬性
- `ManagePageProps` 新增 `toolbar` 屬性
- `ManageMainHeader` 支援顯示 toolbar 區域

**使用方式**:
```tsx
<ManagePage
    title="標題"
    description="描述"
    breadcrumbs={breadcrumbs}
    toolbar={<div>您的篩選工具列</div>}
>
    {/* 頁面內容 */}
</ManagePage>
```

## 如何在其他管理頁面應用

### 範例：更新使用者管理頁面

1. **引入 StatusFilterTabs 組件**:
```tsx
import StatusFilterTabs from '@/components/manage/status-filter-tabs';
import { UserCheck, UserX, Clock, Users as UsersIcon } from 'lucide-react';
```

2. **定義狀態篩選選項**:
```tsx
const statusFilterOptions = useMemo(() => [
    { 
        value: '', 
        label: '全部使用者', 
        count: users.meta.total,
        icon: UsersIcon
    },
    {
        value: 'active',
        label: '已啟用',
        count: statusSummary.active ?? 0,
        icon: UserCheck
    },
    {
        value: 'inactive',
        label: '已停用',
        count: statusSummary.inactive ?? 0,
        icon: UserX
    },
    {
        value: 'pending',
        label: '待審核',
        count: statusSummary.pending ?? 0,
        icon: Clock
    }
], [users.meta.total, statusSummary]);
```

3. **使用組件**:
```tsx
<ManagePage
    title="使用者管理"
    description="管理系統使用者帳號與權限。"
    breadcrumbs={breadcrumbs}
    toolbar={yourFilterToolbar}
>
    {/* 狀態篩選標籤 */}
    <section className="mb-4">
        <StatusFilterTabs
            options={statusFilterOptions}
            value={filterForm.status}
            onChange={handleStatusFilterChange}
        />
    </section>
    
    {/* 其餘內容 */}
    <section className="rounded-xl border border-neutral-200/80 bg-white shadow-sm">
        {/* 表格或其他內容 */}
    </section>
</ManagePage>
```

### 範例：更新標籤管理頁面

如果標籤管理需要狀態篩選：

```tsx
const contextFilterOptions = useMemo(() => [
    {
        value: '',
        label: '全部模組',
        count: tags.meta.total,
        icon: Tag
    },
    {
        value: 'post',
        label: '公告',
        count: contextSummary.post ?? 0,
        icon: Megaphone
    },
    {
        value: 'attachment',
        label: '附件',
        count: contextSummary.attachment ?? 0,
        icon: FolderKanban
    },
    // ... 更多選項
], [tags.meta.total, contextSummary]);
```

## 設計原則

### 1. 統一的視覺風格
- 使用白色背景 (`bg-white`)
- 淺色邊框 (`border-neutral-200/80`)
- 適當的陰影 (`shadow-sm`)
- 一致的圓角 (`rounded-xl`, `rounded-lg`)

### 2. 清晰的資訊層級
- 主要內容使用深色文字 (`text-neutral-900`)
- 次要資訊使用中等色調 (`text-neutral-600`)
- 輔助資訊使用淺色 (`text-neutral-500`)

### 3. 友好的互動體驗
- 懸停效果 (`hover:` 狀態)
- 活動狀態明確標示 (高亮顯示)
- 平滑的過渡動畫 (`transition-all duration-200`)

### 4. 響應式設計
- 移動端友好的佈局
- 使用 Tailwind 的響應式斷點 (`md:`, `lg:`, `xl:`)
- 彈性的 flex 和 grid 佈局

## 後續建議

1. **附件管理頁面**: 可以添加「全部」、「圖片」、「文件」、「影片」等類型篩選
2. **聯絡訊息頁面**: 可以添加「全部」、「未讀」、「已讀」、「已回覆」等狀態篩選
3. **使用者管理頁面**: 如上述範例，添加狀態篩選

## 技術細節

### Sidebar 渲染流程
```
AppLayout → (判斷 /manage 路由) → ManageLayout → ManageSidebar
                                                 ↓
                                           ManageSidebarMain
                                                 ↓
                                           buildSidebarNavGroups
                                                 ↓
                                           根據角色顯示導航項目
```

### 頁面結構
```
ManagePage (頂部導航 + 內容區域)
  ├─ Header (語言切換 + 使用者資訊 + 登出)
  └─ ManageMain
      ├─ ManageMainHeader (麵包屑 + 標題 + 描述 + actions + toolbar)
      ├─ ManageMainContent (children - 主要內容)
      └─ ManageMainFooter (footer)
```

## 測試清單

- [x] Sidebar 在所有管理頁面都顯示完整項目
- [x] 公告管理頁面使用新的篩選組件
- [x] 視覺設計改為白底、乾淨風格
- [x] StatusFilterTabs 組件可重用
- [x] Toolbar 屬性正常工作
- [ ] 測試其他管理頁面 (標籤、使用者、附件等)
- [ ] 確認響應式設計在移動端正常顯示
- [ ] 測試不同角色 (admin/teacher/user) 的 sidebar 顯示

## 相關檔案清單

### 新增檔案
- `resources/js/components/manage/status-filter-tabs.tsx` - 通用狀態篩選組件

### 修改檔案
- `resources/js/layouts/manage/manage-layout.tsx` - 支援完整 props 傳遞
- `resources/js/layouts/manage/manage-main.tsx` - 新增 toolbar 屬性
- `resources/js/layouts/manage/manage-page.tsx` - 新增 toolbar 屬性
- `resources/js/components/manage/manage-main-header.tsx` - 支援 toolbar 顯示
- `resources/js/pages/manage/admin/posts/index.tsx` - 使用新的篩選組件

### 相關檔案 (未修改)
- `resources/js/layouts/app-layout.tsx` - 自動判斷管理頁面
- `resources/js/components/manage/manage-sidebar-main.tsx` - Sidebar 主要內容
- `resources/js/lib/manage/sidebar-nav-groups.ts` - Sidebar 配置
- `resources/js/lib/manage/nav-config.ts` - 導航項目定義
