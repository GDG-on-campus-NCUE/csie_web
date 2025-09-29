# 組件重構報告

## 重構概述

根據您的要求，我們已經完成了組件架構的重構，移除了不必要的 `admin` 層級，並改進了組件化設計。

## 重構內容

### 1. 移除 Admin 層級

**之前的結構:**
```
components/manage/admin/
├── classrooms/
├── labs/  
├── shared/
└── dashboard/
```

**重構後的結構:**
```
components/manage/
├── classrooms/
├── labs/
├── shared/
└── dashboard/
```

### 2. 組件化改進

#### Classrooms 組件
- **位置**: `components/manage/classrooms/`
- **主要組件**:
  - `ClassroomTable` - 主表格組件
  - `ClassroomForm` - 表單組件  
  - `ClassroomFilterBar` - 篩選欄組件

- **子組件** (components/ 子目錄):
  - `ClassroomCard` - 單個教室卡片
  - `ClassroomCardHeader` - 卡片頭部
  - `ClassroomCardContent` - 卡片內容
  - `ClassroomCardFooter` - 卡片底部
  - `ClassroomBasicInfoForm` - 基本信息表單
  - `ClassroomStaffAssignmentForm` - 職員指派表單
  - `ClassroomDisplaySettingsForm` - 顯示設置表單

#### Labs 組件
- **位置**: `components/manage/labs/`
- **主要組件**:
  - `LabTable` - 主表格組件

- **子組件** (components/ 子目錄):
  - `LabCard` - 單個實驗室卡片
  - `LabCardCover` - 卡片封面
  - `LabCardHeader` - 卡片頭部
  - `LabCardContent` - 卡片內容  
  - `LabCardFooter` - 卡片底部

### 3. 共享組件移動

- `AssignableMultiSelect` 從 `admin/shared/` 移動到 `shared/`
- 統一了組件接口，提高了重用性

### 4. 類型定義

每個功能模組都有獨立的類型文件:
- `classrooms/types.ts` - 教室相關類型
- `labs/types.ts` - 實驗室相關類型

### 5. 工具函數

每個模組都有獨立的工具函數:
- `classrooms/utils.ts` - 教室工具函數
- `labs/utils.ts` - 實驗室工具函數

### 6. 權限控制

在組件內部進行權限判斷，而不是通過目錄結構:
```tsx
// 例如在頁面組件中
interface PageProps {
    canManage?: boolean;
}

// 在組件內部判斷權限
if (!canManage) {
    showError('您沒有權限編輯教室');
    return;
}
```

### 7. 頁面結構更新

**之前**: `pages/manage/admin/classrooms/`  
**之後**: `pages/manage/classrooms/`

頁面組件直接從新的組件路徑引入:
```tsx
import { ClassroomTable, ClassroomForm, ClassroomFilterBar } from '@/components/manage/classrooms';
```

## 優勢

1. **更清晰的架構**: 移除了冗余的 admin 層級
2. **更好的組件化**: 將大組件拆分成多個小組件，提高可維護性
3. **更靈活的權限控制**: 在組件內部進行邏輯判斷而非目錄限制
4. **更好的重用性**: 組件可以在不同的權限上下文中使用
5. **更易於Code Review**: 每個組件職責單一，邏輯清晰

## 後續建議

1. 繼續將其他功能模組（如 posts, attachments 等）按照相同模式進行重構
2. 建立組件文檔和使用指南
3. 添加更多的單元測試覆蓋重構後的組件
4. 考慮建立組件庫的 Storybook 來展示各個組件

## 需要更新的文件

以下文件需要更新其引入路徑：
- 所有引用舊 admin 路徑的頁面文件
- 路由配置文件
- 可能的測試文件

這次重構大幅改善了代碼結構，使其更符合現代前端開發的最佳實踐。
