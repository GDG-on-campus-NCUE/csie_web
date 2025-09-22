<!--
Sync Impact Report

- Version change: 1.0.1 -> 2.0.0
- Modified principles:
  - 堅守多語 JSON 儲存與 Tab 切換設計 (expanded with Laravel locale integration)
  - 保持 Tailwind 與共用元件架構，不額外寫散落 CSS (refined for React + TypeScript)
  - NEW: Laravel 11 + React + TypeScript + Inertia.js 架構原則
  - NEW: 白底簡約設計與 UI/UX 原則
  - NEW: 測試規範與資料流原則
- Added sections:
  - Technology Stack Requirements
  - Data Flow & Architecture Constraints
  - Testing & Quality Assurance
  - UI/UX Design Principles
- Removed sections:
  - Generic principles 3-5 (replaced with specific CSIE requirements)
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated with Laravel/React context
  - .specify/templates/spec-template.md ✅ reviewed - no changes needed  
  - .specify/templates/tasks-template.md ✅ updated with PHPUnit/Jest testing requirements
  - .github/copilot-instructions.md ✅ fully rewritten for CSIE context
- Follow-up TODOs:
  - CI pipeline validation for technology stack compliance (pending)
  - Documentation updates for development workflow (pending)

-->

# 彰化師範大學資工系系網 Constitution

## Core Principles

### 堅守多語 JSON 儲存與 Laravel locale 整合
所有使用者可見的文字內容（公告標題、內文、附件描述等）MUST 以多語 JSON 結構儲存於資料庫，並以 locale 為 key（例如 `zh-TW`, `en`）。後端使用 Laravel 的 `resources/lang/{locale}` 進行系統錯誤訊息處理，前端多語內容透過 `/lang/{locale}/{component}.json` 載入。使用者介面 MUST 提供清晰的 Tab 切換，讓編輯者與閱讀者可直接在相同畫面切換語言檢視與編輯。

理由：此策略整合 Laravel 內建 i18n 機制與前端需求，保證資料結構一致性、便於匯出備份與搜尋，並降低因散落翻譯字串帶來的遺失風險。

### Laravel 11 + React + TypeScript + Inertia.js 架構原則
專案 MUST 使用 Laravel 11 作為後端框架，搭配 React + TypeScript 作為前端技術棧，並透過 Inertia.js 實現 SSR-like 的頁面渲染。後端 Controller MUST 使用 `Inertia::render()` 回傳頁面資料，前端 Page 組件 MUST 接收 props 作為唯一資料來源。禁止在前端使用傳統 AJAX 調用，除非明確標示為 client-only fetch 且有適當的 loading 狀態。

理由：Inertia.js 提供 SPA 體驗同時保持傳統 server-side routing 的簡潔性，TypeScript 確保型別安全，React 功能組件提供良好的開發體驗。

### 保持 Tailwind 與共用元件架構，不額外寫散落 CSS
前端樣式實作 MUST 使用 Tailwind CSS utility classes 與 `resources/js/components/ui/` 下的共用元件庫。禁止新增未經審核的全域或局部散置 CSS 檔案。任何需要新增樣式的情況，應優先擴充共用元件或在 design token / component 層級進行。元件設計 MUST 遵循單一職責原則，頁面組合由簡單元件構成。

理由：維持一致的視覺語言、降低樣式衝突與維運成本，並促進元件複用。React 組件化設計便於測試與維護。

### 白底簡約設計與 UI/UX 原則
整體介面風格 MUST 以白底（#FFFFFF）為主，文字與圖像留白充足，元件簡潔。導覽設計 MUST 符合 ARCHITECTURE.md 定義的主菜單結構。所有表單與內容編輯介面 MUST 提供清晰的操作回饋與錯誤提示。響應式設計 MUST 支援桌面與行動裝置瀏覽。

理由：簡潔設計提升使用者體驗，白底設計符合學術機構專業形象，良好的資訊架構便於訪客快速找到所需內容。

### 測試規範與資料流原則
後端每個 Controller method MUST 對應一個 Feature test（`tests/Feature`），測試須覆蓋正常流程、未授權存取、輸入驗證錯誤、空結果等情境。前端每個主要 Page 與 UI 元件 MUST 具備 Jest + React Testing Library 測試。所有多語 JSON 資料處理 MUST 包含序列化測試。資料流 MUST 遵循：資料庫 → Eloquent Model → API Resource/DTO → Inertia props → React 組件。

理由：完整的測試覆蓋確保系統穩定性，明確的資料流向簡化除錯與維護，提升開發效率。

## Technology Stack Requirements

### Mandatory Technologies
- **Backend**: Laravel 11 with PHP 8.2+, MySQL database
- **Frontend**: React with TypeScript, Inertia.js for SSR-like rendering
- **Styling**: Tailwind CSS (exclusive styling solution)
- **Testing**: PHPUnit for backend, Jest + React Testing Library for frontend
- **Architecture**: Eloquent Models, Policies, FormRequests, API Resources

### Forbidden Technologies
- Traditional AJAX calls (use Inertia.js page props instead)
- Custom CSS files outside shared component system
- Large i18n libraries (use minimal helpers with project `/lang` directory)
- Direct database queries bypassing Eloquent models

## Data Flow & Architecture Constraints

### Backend Requirements
- Controllers MUST use `Inertia::render()` for page responses
- Data transformation MUST use API Resources or DTOs
- Authorization MUST use Laravel Policies
- Route organization: `web.php` (public), `manage.php` (role-based), `auth.php` (authentication)
- Every Controller method MUST have corresponding PHPUnit Feature test

### Frontend Requirements
- Pages MUST receive data only through Inertia props
- Components MUST follow single responsibility principle
- State management MUST be local to components (no global state libraries)
- Language switching MUST use Tab interface for multi-language content
- Directory structure: `pages/` (Inertia pages), `components/ui/` (shared), `components/page/` (composite)

### Internationalization Rules
- Backend: Use Laravel's `resources/lang/{locale}` for system messages only
- Frontend: Use `/lang/{locale}/{component}.json` for UI text
- Content: Store multi-language data as JSON in database with locale keys
- Loading: Inject only required translations per page via Inertia props

## Testing & Quality Assurance

### Backend Testing Requirements
- Every Controller method MUST have a Feature test in `tests/Feature/`
- Test coverage MUST include: normal flow, unauthorized access, validation errors, empty results
- Multi-language JSON serialization MUST be tested
- Database relationships and Model methods MUST have Unit tests
- Example: `tests/Feature/AnnouncementControllerTest.php`

### Frontend Testing Requirements
- Every major Page component MUST have Jest + React Testing Library tests
- Shared UI components MUST be tested for props validation and rendering
- Multi-language Tab switching functionality MUST be tested
- Form submission and validation states MUST be tested
- Test location: `resources/js/__tests__/`

### CI/CD Requirements
- PRs changing UI MUST include locale file updates
- Style changes MUST reference existing shared components
- Automated tests MUST pass before merge
- Locale key validation for new strings MUST be enforced

## UI/UX Design Principles

### Visual Design
- Primary background: White (#FFFFFF)
- Typography: Sufficient whitespace for readability
- Component design: Clean and minimal
- Responsive design: Desktop and mobile support

### Navigation Structure
Navigation MUST follow ARCHITECTURE.md specification:
- 簡介 (Introduction)
- 系所成員 (Department Members) 
- 學術研究 (Academic Research)
- 課程修業 (Curriculum)
- 招生專區 (Admissions)
- 公告 (Announcements)
- 聯絡我們 (Contact Us)

### User Experience
- Language switching: Clear Tab interface
- Forms: Immediate validation feedback
- Loading states: Clear indicators for async operations
- Error handling: User-friendly error messages
- Content editing: Prevent data loss during language switching

## Governance

Amendments

- Proposals to amend this constitution MUST be submitted as a documented PR against `.specify/memory/constitution.md` that includes:
	1. The exact text to add/change.
 2. A rationale explaining the need and any compatibility impact.
 3. A migration or compliance plan if the change affects runtime behavior or developer workflows.
- Approval: Amendments MUST be approved by the repository maintainers (code owners) and at least one additional senior contributor. For material changes (adding/removing core principles) a MAJOR version bump is required and a short announcement should accompany the merge.
- Emergency fixes: Minor editorial clarifications that do not change intent MAY be applied as PATCH with a brief changelog entry.

Compliance & enforcement

- CI and reviewers MUST verify non-negotiable items (localization updates, no scattered CSS, use of shared components) before merging UI/content PRs.
- Violations MUST be documented in the PR and accompanied by a remediation plan.

**Version**: 2.0.0 | **Ratified**: 2025-09-22 | **Last Amended**: 2025-09-22
