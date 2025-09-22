# Tasks: 師資與職員管理頁面

**Input**: Design documents from `/specs/001-inertia-manage-staff/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Laravel Backend**: `app/Http/Controllers/`, `app/Models/`, `app/Policies/`, `tests/Feature/`, `tests/Unit/`
- **React Frontend**: `resources/js/pages/`, `resources/js/components/ui/`, `resources/js/__tests__/`
- **Internationalization**: `resources/lang/{locale}/` (backend), `/lang/{locale}/{component}.json` (frontend)
- **Database**: `database/migrations/`, `database/seeders/`, `database/factories/`

## Phase 3.1: Setup
- [x] T001 Create directory structure for staff management pages in resources/js/pages/manage/admin/staff/
- [x] T002 Create directory structure for teacher management pages in resources/js/pages/manage/admin/teachers/
- [x] T003 [P] Create shared component directory resources/js/components/manage/staff/
- [x] T004 [P] Create TypeScript interfaces file resources/js/types/staff.d.ts
- [x] T005 [P] Create frontend locale files /lang/zh-TW/manage.json and /lang/en/manage.json
- [x] T006 [P] Update backend locale files resources/lang/zh-TW/manage.php and resources/lang/en/manage.php

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T007 [P] Feature test for StaffController@index in tests/Feature/Manage/StaffManagementTest.php
- [x] T008 [P] Feature test for StaffController@create in tests/Feature/Manage/StaffManagementTest.php
- [x] T009 [P] Feature test for StaffController@store in tests/Feature/Manage/StaffManagementTest.php
- [x] T010 [P] Feature test for StaffController@edit in tests/Feature/Manage/StaffManagementTest.php
- [x] T011 [P] Feature test for StaffController@update in tests/Feature/Manage/StaffManagementTest.php
- [x] T012 [P] Feature test for StaffController@destroy in tests/Feature/Manage/StaffManagementTest.php
- [x] T013 [P] Feature test for StaffController@show in tests/Feature/Manage/StaffManagementTest.php
- [x] T014 [P] Feature test for TeacherController@index in tests/Feature/Manage/TeacherManagementTest.php
- [x] T015 [P] Feature test for TeacherController@create in tests/Feature/Manage/TeacherManagementTest.php
- [x] T016 [P] Feature test for TeacherController@store in tests/Feature/Manage/TeacherManagementTest.php
- [x] T017 [P] Feature test for TeacherController@edit in tests/Feature/Manage/TeacherManagementTest.php
- [x] T018 [P] Feature test for TeacherController@update in tests/Feature/Manage/TeacherManagementTest.php
- [x] T019 [P] Feature test for TeacherController@destroy in tests/Feature/Manage/TeacherManagementTest.php
- [x] T020 [P] Feature test for TeacherController@show in tests/Feature/Manage/TeacherManagementTest.php
- [x] T021 [P] React component tests for StaffForm, TeacherForm, StaffTable, TeacherTable in resources/js/__tests__/components/manage/

## Phase 3.3: Backend Implementation (ONLY after tests are failing)
- [x] T022 [P] Create StoreStaffRequest form validation in app/Http/Requests/Manage/Admin/StoreStaffRequest.php
- [x] T023 [P] Create UpdateStaffRequest form validation in app/Http/Requests/Manage/Admin/UpdateStaffRequest.php
- [x] T024 [P] Create StoreTeacherRequest form validation in app/Http/Requests/Manage/Admin/StoreTeacherRequest.php
- [x] T025 [P] Create UpdateTeacherRequest form validation in app/Http/Requests/Manage/Admin/UpdateTeacherRequest.php
- [x] T026 [P] Create StaffResource API resource in app/Http/Resources/StaffResource.php
- [x] T027 [P] Create TeacherResource API resource in app/Http/Resources/TeacherResource.php
- [x] T028 Extend existing StaffController with missing Inertia render methods in app/Http/Controllers/Manage/Admin/StaffController.php
- [x] T029 Extend existing TeacherController with missing Inertia render methods in app/Http/Controllers/Manage/Admin/TeacherController.php

## Phase 3.4: Frontend Core Components (ONLY after backend tests pass)
- [x] T030 [P] Create staff management index page in resources/js/pages/manage/admin/staff/Index.tsx
- [x] T031 [P] Create staff create page in resources/js/pages/manage/admin/staff/Create.tsx
- [x] T032 [P] Create staff edit page in resources/js/pages/manage/admin/staff/Edit.tsx
- [x] T033 [P] Create teacher create page in resources/js/pages/manage/admin/teachers/Create.tsx
- [x] T034 [P] Create teacher edit page in resources/js/pages/manage/admin/teachers/Edit.tsx
- [x] T035 [P] Create teacher show page in resources/js/pages/manage/admin/teachers/Show.tsx
- [x] T036 [P] Create shared StaffForm component in resources/js/components/manage/staff/StaffForm.tsx
- [x] T037 [P] Create shared TeacherForm component in resources/js/components/manage/staff/TeacherForm.tsx
- [x] T038 [P] Create shared MultiLanguageInput component in resources/js/components/manage/staff/MultiLanguageInput.tsx
- [x] T039 [P] Create shared StaffTable component in resources/js/components/manage/staff/StaffTable.tsx
- [x] T040 [P] Create shared TeacherTable component in resources/js/components/manage/staff/TeacherTable.tsx

## Phase 3.5: Integration & Routes
- [x] T041 Verify routes are correctly registered in routes/manage.php for staff and teacher management
- [x] T042 Update Inertia middleware to include staff management translations
- [x] T043 [P] Create staff database seeder in database/seeders/StaffSeeder.php
- [x] T044 [P] Create teacher database seeder in database/seeders/TeacherSeeder.php

## Phase 3.6: UI Polish & Testing
- [x] T045 [P] Add multi-language tab switching functionality to forms
- [x] T046 [P] Implement responsive design for mobile and tablet views
- [x] T047 [P] Add loading states and error handling to all forms
- [x] T048 [P] Add search and filter functionality to staff/teacher tables
- [x] T049 [P] Add pagination support to staff and teacher lists
- [x] T050 [P] Implement file upload for avatar images
- [x] T051 [P] Add confirmation dialogs for delete operations
- [x] T052 [P] Unit tests for Staff model in tests/Unit/StaffTest.php
- [x] T053 [P] Unit tests for Teacher model in tests/Unit/TeacherTest.php
- [x] T054 [P] Performance tests for staff management endpoints
- [x] T055 Manual testing verification following quickstart.md checklist

## Dependencies
- Setup (T001-T006) before everything else
- Tests (T007-T021) before implementation (T022-T040)
- Backend implementation (T022-T029) before frontend components (T030-T040)
- Core components (T030-T040) before integration (T041-T044)
- Integration (T041-T044) before polish (T045-T055)

## Parallel Execution Examples
```bash
# Phase 3.1 - Can run in parallel
Task: "Create shared component directory resources/js/components/manage/staff/"
Task: "Create TypeScript interfaces file resources/js/types/staff.d.ts"
Task: "Create frontend locale files /lang/zh-TW/manage.json and /lang/en/manage.json"

# Phase 3.2 - All tests can run in parallel
Task: "Feature test for StaffController@index in tests/Feature/Manage/Admin/StaffControllerTest.php"
Task: "Feature test for StaffController@create in tests/Feature/Manage/Admin/StaffControllerTest.php"
Task: "React component test for staff index page in resources/js/__tests__/pages/manage/admin/staff/Index.test.tsx"

# Phase 3.3 - Backend components can run in parallel
Task: "Create StoreStaffRequest form validation in app/Http/Requests/Manage/Admin/StoreStaffRequest.php"
Task: "Create StaffResource API resource in app/Http/Resources/StaffResource.php"
Task: "Create TeacherResource API resource in app/Http/Resources/TeacherResource.php"

# Phase 3.4 - Frontend components can run in parallel
Task: "Create staff management index page in resources/js/pages/manage/admin/staff/Index.tsx"
Task: "Create shared StaffForm component in resources/js/components/manage/staff/StaffForm.tsx"
Task: "Create shared MultiLanguageInput component in resources/js/components/manage/staff/MultiLanguageInput.tsx"
```

## Notes
- All [P] tasks target different files and have no dependencies
- Staff and Teacher functionality can be developed in parallel after setup
- Follow quickstart.md for manual testing after each major phase
- Ensure all components use existing shared UI components from resources/js/components/ui/
- All multi-language content must use Tab switching interface as per constitution
- White background (#FFFFFF) design must be maintained throughout

## Validation Checklist
*GATE: Checked before marking tasks complete*

- [x] All API endpoints from contracts/ have corresponding Feature tests
- [x] All React pages have corresponding component tests
- [x] All forms include multi-language support with Tab switching
- [x] All components use Tailwind CSS and shared UI components only
- [x] All text content is externalized to locale files
- [x] Responsive design works on desktop, tablet, and mobile
- [x] Data flow follows: Database → Model → Resource → Inertia props → React
- [x] Manual testing scenarios from quickstart.md all pass
