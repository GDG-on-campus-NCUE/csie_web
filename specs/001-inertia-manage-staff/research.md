# Research: 師資與職員管理頁面

**Feature**: 001-inertia-manage-staff  
**Date**: 2025-09-22

## Research Overview

本階段研究師資與職員管理頁面的技術實現方案，重點關注 Laravel + React + Inertia.js 架構下的最佳實踐。

## Technology Decisions

### Laravel Backend Architecture
**Decision**: 使用現有的 StaffController 和 TeacherController，擴充必要的 API Resources 和 Form Requests  
**Rationale**: 
- 後端控制器已存在且功能完整，包含適當的篩選和分頁邏輯
- StaffController 支援 initialTab 切換（staff/teachers）
- TeacherController 提供完整的 CRUD 操作和關聯資料
- 符合 Laravel 11 的最佳實踐和憲法要求
**Alternatives considered**: 重新設計控制器架構，但現有實現已符合需求

### Frontend Component Structure
**Decision**: 採用階層式組件設計，共用元件置於 `resources/js/components/ui/`，頁面特定元件置於 `resources/js/components/manage/`  
**Rationale**:
- 符合憲法要求的單一職責原則
- 便於在不同管理頁面間重用表單和列表元件
- 維持設計系統的一致性
**Alternatives considered**: 全部組件放在各頁面目錄下，但這會造成重複代碼

### UI/UX Design Pattern
**Decision**: 使用 Tab 切換設計處理 Staff/Teacher 檢視，採用白底卡片佈局  
**Rationale**:
- StaffController 已提供 initialTab 邏輯支援
- 符合憲法的白底簡約設計原則
- Tab 切換提供良好的使用者體驗
- 與現有管理介面保持一致性
**Alternatives considered**: 分離為完全獨立的頁面，但會失去使用者體驗的連貫性

### Internationalization Strategy
**Decision**: 使用 `/lang/{locale}/manage.json` 存放管理介面翻譯，透過 Inertia props 注入  
**Rationale**:
- 符合憲法的多語言架構要求
- 減少前端 bundle 大小（只載入需要的翻譯）
- 與後端 Laravel locale 機制整合
**Alternatives considered**: 客戶端動態載入翻譯，但違反憲法的 no-AJAX 原則

### Testing Strategy  
**Decision**: PHPUnit Feature tests 覆蓋控制器方法，Jest + RTL 測試 React 組件互動  
**Rationale**:
- 符合憲法的完整測試覆蓋要求
- Feature tests 確保 Inertia 整合正常運作
- React 測試專注於使用者互動和狀態管理
**Alternatives considered**: 只測試後端邏輯，但前端互動同樣重要

## Integration Patterns

### Inertia.js Data Flow
**Decision**: Controller → API Resource → Inertia::render() → React Props  
**Rationale**: 符合憲法規定的資料流向，確保型別安全和一致性  

### Form Handling
**Decision**: 使用 Inertia form helpers 搭配 Laravel FormRequest 驗證  
**Rationale**: 提供良好的使用者體驗和伺服器端驗證

### State Management
**Decision**: 使用 React local state 和 Inertia page props，避免全域狀態管理  
**Rationale**: 符合憲法要求，簡化架構複雜度

## Performance Considerations

### Page Load Optimization
- 使用 API Resources 精確控制回傳資料
- 分頁和篩選功能減少資料傳輸量
- Inertia.js 提供 SPA 級別的頁面切換體驗

### Responsive Design
- Tailwind CSS responsive utilities 確保行動裝置相容性
- 卡片式佈局在小螢幕上良好展示
- Tab 切換在行動裝置上可改為 dropdown 選單

## Risk Mitigation

### Browser Compatibility
- React + TypeScript 提供穩定的跨瀏覽器支援
- Tailwind CSS 確保樣式一致性
- Inertia.js 內建瀏覽器歷史管理

### Data Consistency
- Laravel Form Requests 提供伺服器端驗證
- TypeScript 介面確保前後端資料格式一致
- API Resources 提供標準化資料轉換

## Conclusion

研究確認使用 Laravel 11 + React + TypeScript + Inertia.js 架構是正確的技術選擇，所有技術決策都符合專案憲法要求。現有的後端控制器提供良好的基礎，前端需要建立對應的 React 組件來完成功能實現。
