# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Laravel Backend**: `app/Http/Controllers/`, `app/Models/`, `app/Policies/`, `tests/Feature/`, `tests/Unit/`
- **React Frontend**: `resources/js/pages/`, `resources/js/components/ui/`, `resources/js/__tests__/`
- **Internationalization**: `resources/lang/{locale}/` (backend), `/lang/{locale}/{component}.json` (frontend)
- **Database**: `database/migrations/`, `database/seeders/`, `database/factories/`

## Phase 3.1: Setup
- [ ] T001 Create Laravel feature structure (migration, model, controller, policy)
- [ ] T002 Configure TypeScript and React dependencies in package.json
- [ ] T003 [P] Set up PHPUnit test configuration
- [ ] T004 [P] Set up Jest + React Testing Library configuration

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T005 [P] Feature test for Controller@index in tests/Feature/ExampleControllerTest.php
- [ ] T006 [P] Feature test for Controller@store in tests/Feature/ExampleControllerTest.php
- [ ] T007 [P] Feature test for Controller@show in tests/Feature/ExampleControllerTest.php
- [ ] T008 [P] Policy test for authorization in tests/Unit/ExamplePolicyTest.php
- [ ] T009 [P] React component test in resources/js/__tests__/components/ExampleComponent.test.tsx

## Laravel + React + TypeScript specific requirements

When tasks involve multilingual content or UI changes:
- Backend locale tasks MUST reference `resources/lang/{locale}/` files for validation messages
- Frontend locale tasks MUST reference `/lang/{locale}/{component}.json` files for UI text
- Inertia.js props MUST include required translations for the page
- React components MUST use shared UI components from `resources/js/components/ui/`

Example locale validation (CI job):
```yaml
name: validate-laravel-locales
run: |
   php artisan lang:validate --locale=zh-TW,en
   npm run test:i18n -- --validate-keys
```

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T010 [P] Eloquent Model in app/Models/Example.php
- [ ] T011 [P] Laravel Policy in app/Policies/ExamplePolicy.php  
- [ ] T012 [P] Form Request validation in app/Http/Requests/StoreExampleRequest.php
- [ ] T013 [P] API Resource in app/Http/Resources/ExampleResource.php
- [ ] T014 Controller methods in app/Http/Controllers/ExampleController.php
- [ ] T015 Database migration in database/migrations/create_examples_table.php
- [ ] T016 [P] React page component in resources/js/pages/Example/Index.tsx
- [ ] T017 [P] Shared UI components in resources/js/components/ui/

## Phase 3.4: Integration  
- [ ] T018 Inertia.js route registration in routes/web.php
- [ ] T019 Service Provider registration (if needed)
- [ ] T020 Database seeder in database/seeders/ExampleSeeder.php
- [ ] T021 [P] Frontend locale files in /lang/{locale}/example.json
- [ ] T022 [P] Backend locale files in resources/lang/{locale}/example.php

## Phase 3.5: Polish
- [ ] T023 [P] Unit tests for Model in tests/Unit/ExampleTest.php
- [ ] T024 [P] Performance tests for Controller endpoints
- [ ] T025 [P] React component interaction tests
- [ ] T026 [P] Update API documentation
- [ ] T027 Manual testing verification

## Dependencies
- Tests (T005-T009) before implementation (T010-T017)
- T015 (migration) before T010 (model)
- T010-T013 (backend) before T016-T017 (frontend)
- T018-T022 (integration) before T023-T027 (polish)

## Parallel Example
```
# Launch T004-T007 together:
Task: "Contract test POST /api/users in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.py"
Task: "Integration test registration in tests/integration/test_registration.py"
Task: "Integration test auth in tests/integration/test_auth.py"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
   
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
   
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
