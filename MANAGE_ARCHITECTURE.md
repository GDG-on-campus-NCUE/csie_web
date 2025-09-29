# 管理頁面架構設計文檔

## 概述

本文檔說明了管理後台的組件化設計與權限控制機制，支援三種使用者角色：`admin`（管理員）、`teacher`（教師）、`user`（一般使用者）。

## 架構特點

### 1. 組件化設計
- **統一的側邊欄組件**：`ManageSidebar` 取代了原本的三個獨立組件
- **權限控制組件**：`RoleGuard` 和 `PermissionGuard` 提供細粒度的權限控制
- **工具函數集合**：權限檢查、角色判斷等輔助功能

### 2. 權限控制機制
- 基於角色的訪問控制（RBAC）
- 組件層級的權限守衛
- 預定義的權限常數

### 3. 語言國際化
- 所有文字內容使用語言檔案
- 支援繁體中文（zh-TW）和英文（en）
- 結構化的翻譯鍵值配置

## 核心組件

### 1. 統一側邊欄組件 (`ManageSidebar`)

```tsx
// 位置：/resources/js/components/manage/sidebar/manage-sidebar.tsx
<ManageSidebar role={role} />
```

**功能特點：**
- 根據使用者角色動態調整導航項目
- 使用 `useMemo` 優化性能
- 完整的國際化支援
- 響應式設計

**角色權限對應：**
- **Admin**: 完整的系統管理功能
- **Teacher**: 教學相關功能（公告、實驗室、課程）
- **User**: 基本的個人設定功能

### 2. 權限守衛組件 (`RoleGuard`)

```tsx
// 位置：/resources/js/components/manage/guards/role-guard.tsx

// 基本用法
<RoleGuard allowedRoles={['admin']}>
  <AdminOnlyComponent />
</RoleGuard>

// 帶有權限不足時的回退內容
<RoleGuard 
  allowedRoles={['admin', 'teacher']} 
  fallback={<div>權限不足</div>}
>
  <TeacherAdminComponent />
</RoleGuard>
```

### 3. 權限管理工具 (`PermissionGuard`)

```tsx
// 位置：/resources/js/components/manage/utils/permission-utils.tsx

// 使用預定義權限
<PermissionGuard permission="MANAGE_USERS">
  <UserManagementComponent />
</PermissionGuard>

// Hook 用法
const canManageUsers = usePermission('MANAGE_USERS');
const userRole = useCurrentRole();
```

**權限常數定義：**
```tsx
export const MANAGE_PERMISSIONS = {
    MANAGE_USERS: ['admin'],
    MANAGE_POSTS: ['admin', 'teacher'],
    MANAGE_LABS: ['admin', 'teacher'],
    MANAGE_PROFILE: ['admin', 'teacher', 'user'],
    // ... 更多權限
}
```

### 4. 統一佈局組件 (`ManageLayout`)

```tsx
// 位置：/resources/js/layouts/manage/manage-layout.tsx
<ManageLayout breadcrumbs={breadcrumbs} role={role}>
  {children}
</ManageLayout>
```

**改進內容：**
- 簡化組件邏輯，移除 `useMemo` 的複雜判斷
- 統一使用 `ManageSidebar` 組件
- 自動角色偵測與權限控制

## 角色功能對應

### Admin（管理員）
- 系統管理：使用者管理、師資管理、設定管理
- 內容管理：公告、標籤、附件管理
- 學術管理：實驗室、教室、課程、學程管理
- 聯絡管理：聯絡訊息處理

### Teacher（教師）
- 內容管理：公告發布與管理
- 學術管理：實驗室介紹、課程資訊
- 個人管理：個人資料設定

### User（一般使用者）
- 個人管理：個人資料、安全設定
- 基本功能：檢視個人儀表板

## 語言控制

### 語言檔案結構
```php
// lang/zh-TW/manage.php 和 lang/en/manage.php
[
    'sidebar' => [
        'admin' => [...],
        'teacher' => [...],
        'user' => [...],
    ],
    'layout' => [
        'brand' => [...],
        'breadcrumbs' => [...],
    ],
    'dashboard' => [
        'admin' => [...],
        'teacher' => [...],
        'user' => [...],
    ]
]
```

### 使用方式
```tsx
const { t } = useTranslator('manage');
const title = t('sidebar.admin.dashboard');
const description = t(`dashboard.${role}.description`);
```

## 使用範例

### 1. 基本權限控制

```tsx
function ManagePage() {
    return (
        <ManageLayout>
            {/* 只有管理員可以看到 */}
            <RoleGuard allowedRoles={['admin']}>
                <UserManagementSection />
            </RoleGuard>
            
            {/* 管理員和教師都可以看到 */}
            <RoleGuard allowedRoles={['admin', 'teacher']}>
                <PostManagementSection />
            </RoleGuard>
            
            {/* 所有角色都可以看到 */}
            <ProfileSection />
        </ManageLayout>
    );
}
```

### 2. 條件式功能顯示

```tsx
function QuickActions() {
    const canManageUsers = usePermission('MANAGE_USERS');
    const role = useCurrentRole();
    
    return (
        <div>
            {canManageUsers && (
                <Button href="/manage/users">
                    管理使用者
                </Button>
            )}
            
            <PermissionGuard permission="MANAGE_POSTS">
                <Button href="/manage/posts">
                    管理公告
                </Button>
            </PermissionGuard>
        </div>
    );
}
```

## 開發指南

### 1. 新增權限

在 `/components/manage/utils/permission-utils.tsx` 中添加新權限：

```tsx
export const MANAGE_PERMISSIONS = {
    // 現有權限...
    NEW_PERMISSION: ['admin', 'teacher'] as ManageRole[],
}
```

### 2. 新增功能模組

```tsx
// 使用權限守衛包裝新功能
<PermissionGuard permission="NEW_PERMISSION">
    <NewFeatureComponent />
</PermissionGuard>
```

### 3. 添加語言支援

在相應的語言檔案中添加翻譯：

```php
// lang/zh-TW/manage.php
'new_feature' => [
    'title' => '新功能',
    'description' => '功能描述',
],
```

## 維護建議

1. **保持權限定義集中化**：所有權限都在 `MANAGE_PERMISSIONS` 中定義
2. **使用語言檔案**：避免在組件中硬編碼文字
3. **組件化原則**：將可重複使用的邏輯提取為獨立組件
4. **權限檢查**：在適當的層級進行權限檢查，避免過度檢查
5. **效能優化**：使用 `useMemo` 和 `useCallback` 優化重複計算

## 檔案結構

```
resources/js/
├── components/manage/
│   ├── sidebar/
│   │   └── manage-sidebar.tsx          # 統一側邊欄
│   ├── guards/
│   │   └── role-guard.tsx             # 角色權限守衛
│   ├── utils/
│   │   └── permission-utils.tsx       # 權限管理工具
│   └── dashboard/
│       └── manage-quick-actions.tsx   # 示例組件
├── layouts/manage/
│   └── manage-layout.tsx              # 統一佈局
lang/
├── zh-TW/
│   └── manage.php                     # 中文語言檔
└── en/
    └── manage.php                     # 英文語言檔
```

這個架構設計確保了代碼的簡潔性、可維護性和可擴展性，同時提供了完整的權限控制和國際化支援。
