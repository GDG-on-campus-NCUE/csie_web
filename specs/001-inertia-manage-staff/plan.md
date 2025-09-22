
# Implementation Plan: 師資與職員管理頁面

**Branch**: `001-inertia-manage-staff` | **Date**: 2025-09-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-inertia-manage-staff/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
建立師資與職員管理相關的 Inertia.js 頁面，解決管理側邊欄連結導向不存在組件的問題。主要需求包括：為職員管理提供完整的 CRUD 介面（列表、新增、編輯），為教師管理提供完整功能（列表、新增、編輯、詳細檢視），支援切換檢視標籤，整合多語言支援，保持白底卡片設計風格，並確保響應式設計。技術實現採用 Laravel 11 + React + TypeScript + Inertia.js 架構，使用 Tailwind CSS 和共用元件，遵循憲法規範的資料流和測試要求。

## Technical Context
**Language/Version**: PHP 8.2+, Laravel 11, TypeScript, React  
**Primary Dependencies**: Laravel Inertia.js, Tailwind CSS, Jest, PHPUnit  
**Storage**: MySQL database with Eloquent ORM  
**Testing**: PHPUnit (backend), Jest + React Testing Library (frontend)  
**Target Platform**: Web application (desktop + mobile responsive)
**Project Type**: Laravel + React web application  
**Performance Goals**: <200ms page response, smooth Tab switching for i18n  
**Constraints**: White background design, no custom CSS outside shared components  
**Scale/Scope**: University department website with multi-language content

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Laravel + React + TypeScript Architecture**:
- [x] Uses Laravel 11 backend with Inertia.js for page rendering
- [x] Frontend uses React with TypeScript (no traditional AJAX)
- [x] All styling uses Tailwind CSS and shared components from `resources/js/components/ui/`
- [x] No custom CSS files outside the shared component system

**Multilingual Requirements**:
- [x] Multi-language content stored as JSON in database with locale keys
- [x] Backend uses `resources/lang/{locale}/` for system messages only  
- [x] Frontend uses `/lang/{locale}/{component}.json` for UI text
- [x] Language switching provides Tab interface for editors/readers

**Testing & Quality**:
- [x] Every Controller method has PHPUnit Feature test
- [x] React components have Jest + React Testing Library tests
- [x] Multi-language JSON serialization is tested
- [x] No hardcoded strings (all text in locale files)

**Design Principles**:
- [x] White background (#FFFFFF) with clean, minimal design
- [x] Navigation follows ARCHITECTURE.md structure
- [x] Data flow: Database → Model → Resource → Inertia props → React
- [x] Components follow single responsibility principle

## Project Structure

### Documentation (this feature)
```
specs/001-inertia-manage-staff/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Laravel + React Web Application
app/
├── Http/
│   ├── Controllers/
│   ├── Requests/
│   ├── Resources/
│   └── Middleware/
├── Models/
├── Policies/
└── Services/

resources/
├── js/
│   ├── pages/          # Inertia.js pages
│   ├── components/
│   │   ├── ui/         # Shared components
│   │   └── page/       # Composite components
│   └── __tests__/      # Frontend tests
├── css/                # Tailwind CSS
└── lang/               # Laravel backend locales

lang/                   # Frontend locale files
├── zh-TW/
└── en/

tests/
├── Feature/            # Controller integration tests
├── Unit/               # Model/Policy unit tests
└── Performance/

database/
├── migrations/
├── seeders/
└── factories/

routes/
├── web.php             # Public routes
├── manage.php          # Role-based management
└── auth.php            # Authentication
```

**Structure Decision**: Laravel + React web application with Inertia.js

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` 作為基礎模板
- 從 Phase 1 設計文件生成任務 (contracts, data-model.md, quickstart.md)
- 每個 API endpoint → PHPUnit Feature test 任務 [P]
- 每個 Inertia 頁面 → React 組件建立任務 [P]
- 每個表單 → FormRequest 驗證類別任務 [P]
- 每個實體 → API Resource 建立任務 [P]
- 前端組件 → Jest + RTL 測試任務 [P]

**Ordering Strategy**:
- TDD 順序：測試先於實現
- 依賴順序：後端 Models/Policies → FormRequests → Controllers → Frontend Pages
- 標記 [P] 表示可平行執行（獨立檔案）
- Staff 和 Teacher 管理功能可平行開發

**估計輸出**: 35-40 個編號有序的任務於 tasks.md

**具體任務分類**:
1. **設置任務** (5-7 個): 建立目錄結構、配置 TypeScript 介面、多語言檔案
2. **測試任務** (12-15 個): PHPUnit Feature tests、Jest React tests
3. **後端任務** (8-10 個): FormRequests、API Resources、Controller 方法調整
4. **前端任務** (10-12 個): React 頁面組件、共用 UI 組件、表單組件
5. **整合任務** (3-5 個): 路由註冊、翻譯檔案更新、手動測試

**IMPORTANT**: 此階段由 /tasks 命令執行，非 /plan 命令範圍

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.0.0 - See `/memory/constitution.md`*
