# System Integration Audit & Rectification Plan
**Date:** December 3, 2025  
**Status:** Critical Schema Mismatches Identified  
**Priority:** HIGH - Blocking Report Edit Functionality

---

## Executive Summary

**CRITICAL ISSUE FOUND:** The application code uses `id` as primary key columns, but the remote database uses descriptive primary keys (`user_id`, `report_id`, `task_id`, etc.). This causes ALL edit/update/delete operations to fail.

### Impact
- ❌ **Reports**: Cannot edit/update/delete
- ❌ **Tasks**: Cannot edit/update/delete  
- ❌ **Users**: Cannot edit/update/delete
- ❌ **All Forms**: Edit functionality broken
- ✅ **Login**: Works (recently fixed)
- ✅ **Create Operations**: Partially working

---

## Database Schema Analysis

### Actual Database Structure (Remote)

```
PRIMARY KEYS:
├── users.user_id
├── daily_reports.report_id
├── tasks.task_id
├── requests.request_id
├── issues.issue_id
├── problems_solved.solution_id
├── ai_prompts.prompt_id
├── file_versions.file_id
├── sessions.session_id
├── data_uploads.upload_id
└── activity_log.log_id

FOREIGN KEYS:
├── user_id → users.user_id
├── report_id → daily_reports.report_id
├── task_id → tasks.task_id
├── request_id → requests.request_id
├── issue_id → issues.issue_id
├── prompt_id → ai_prompts.prompt_id
├── assigned_to → users.user_id
└── reviewed_by → users.user_id
```

### Code Expectations (Incorrect)

```
Code assumes:
├── users.id
├── daily_reports.id
├── tasks.id
├── requests.id
├── issues.id
└── etc.
```

---

## Affected Components Matrix

| Component | Location | Status | Primary Key Used | Correct Key | Impact |
|-----------|----------|--------|------------------|-------------|---------|
| **REPORTS API** | | | | | |
| GET /api/reports/:id | pages/api/reports/[id].ts | ❌ BROKEN | `id` | `report_id` | Cannot fetch single report |
| PUT /api/reports/:id | pages/api/reports/[id].ts | ❌ BROKEN | `id` | `report_id` | Cannot update report |
| DELETE /api/reports/:id | pages/api/reports/[id].ts | ❌ BROKEN | `id` | `report_id` | Cannot delete report |
| **TASKS API** | | | | | |
| GET /api/tasks/:id | pages/api/tasks/[id].ts | ❌ BROKEN | `id` | `task_id` | Cannot fetch task |
| PUT /api/tasks/:id | pages/api/tasks/[id].ts | ❌ BROKEN | `id` | `task_id` | Cannot update task |
| **USERS API** | | | | | |
| GET /api/users/:id | pages/api/users/[id].ts | ❌ BROKEN | `id` | `user_id` | Cannot fetch user |
| PUT /api/users/:id | pages/api/users/[id].ts | ❌ BROKEN | `id` | `user_id` | Cannot update user |
| **REQUESTS API** | | | | | |
| GET /api/requests/:id | pages/api/requests/[id].ts | ❌ BROKEN | `id` | `request_id` | Cannot fetch request |
| **ISSUES API** | | | | | |
| GET /api/issues/:id | pages/api/issues/[id].ts | ❌ BROKEN | `id` | `issue_id` | Cannot fetch issue |
| **PROMPTS API** | | | | | |
| GET /api/prompts/:id | pages/api/prompts/[id].ts | ❌ BROKEN | `id` | `prompt_id` | Cannot fetch prompt |
| **FILES API** | | | | | |
| GET /api/files/:id | pages/api/files/[id].ts | ❌ BROKEN | `id` | `file_id` | Cannot fetch file |
| **AUTH** | | | | | |
| Login | lib/auth.ts | ✅ FIXED | `user_id` | `user_id` | Works correctly |
| Session creation | lib/auth.ts | ✅ FIXED | `user_id` | `user_id` | Works correctly |

---

## Detailed Error Analysis

### 1. Reports API (`/api/reports/[id].ts`)

**Current Code (Lines 36, 89, 200):**
```typescript
// ❌ WRONG
const report = await queryOne<DailyReport>(
  'SELECT * FROM daily_reports WHERE id = ?',  // WRONG: id
  [reportId]
);

await execute(
  `UPDATE daily_reports SET ${updates.join(', ')} WHERE id = ?`,  // WRONG: id
  params
);

await execute('DELETE FROM daily_reports WHERE id = ?', [reportId]);  // WRONG: id
```

**Should Be:**
```typescript
// ✅ CORRECT
const report = await queryOne<DailyReport>(
  'SELECT * FROM daily_reports WHERE report_id = ?',  // CORRECT: report_id
  [reportId]
);

await execute(
  `UPDATE daily_reports SET ${updates.join(', ')} WHERE report_id = ?`,
  params
);

await execute('DELETE FROM daily_reports WHERE report_id = ?', [reportId]);
```

### 2. Tasks API (`/api/tasks/[id].ts`)

**Lines with Errors:** 45-66, 133, 254, 279

**Pattern:**
```sql
-- ❌ WRONG
WHERE t.id = ?
WHERE tasks.id = ?

-- ✅ CORRECT  
WHERE t.task_id = ?
WHERE tasks.task_id = ?
```

### 3. Users API (`/api/users/[id].ts`)

**Lines with Errors:** 35, 57, 99, 120, 128

**Pattern:**
```sql
-- ❌ WRONG
WHERE id = ?

-- ✅ CORRECT
WHERE user_id = ?
```

### 4. All Other Detail APIs

Same pattern across:
- `/api/requests/[id].ts`
- `/api/issues/[id].ts`
- `/api/prompts/[id].ts`
- `/api/files/[id].ts`
- `/api/solutions/[id].ts`

---

## Frontend Forms Analysis

### Report Edit Form (`/reports/edit/[id].tsx`)

**Status:** ✅ Form structure is correct  
**Issue:** API backend is broken

**Form sends correct data:**
```typescript
{
  work_description,
  hours_worked,
  tasks_completed,
  blockers,
  notes,
  status
}
```

But API fails at database query level.

### Report View (`/reports/[id].tsx`)

**Status:** ✅ View structure is correct  
**Issue:** Cannot fetch report due to API error

---

## Type Definitions Analysis

### Current Types (`types/index.ts`)

**DailyReport interface:**
```typescript
export interface DailyReport {
  id: number;                    // ❌ Should be report_id
  user_id: number;               // ✅ Correct
  task_id?: number | null;       // ✅ Correct
  report_date: string;           // ✅ Correct
  ...
}
```

**Impact:** TypeScript types don't match database reality!

---

## Solution Strategy

### Phase 1: Database Column Mapping Layer (Recommended)
Create adapter layer that maps between database columns and code expectations.

**Pros:**
- Minimal code changes
- Backward compatible
- Easy to test

**Cons:**
- Adds complexity
- Performance overhead (minimal)

### Phase 2: Direct Code Fix (Implemented)
Change all SQL queries to use correct column names.

**Pros:**
- Direct fix
- No abstraction overhead
- Matches database reality

**Cons:**
- Many files to change
- Higher risk of missing something

---

## Rectification Plan

### Step 1: Fix All API Endpoints ✅

**Files to Modify:**
1. ✅ `lib/auth.ts` - Already fixed
2. ❌ `pages/api/reports/[id].ts` - 3 SQL queries
3. ❌ `pages/api/reports/index.ts` - Already has `user_id`, but check all
4. ❌ `pages/api/tasks/[id].ts` - 8+ SQL queries
5. ❌ `pages/api/tasks/index.ts` - Already has correct FKs
6. ❌ `pages/api/users/[id].ts` - 5 SQL queries
7. ❌ `pages/api/users/index.ts` - 2 SQL queries
8. ❌ `pages/api/requests/[id].ts` - 4 SQL queries
9. ❌ `pages/api/issues/[id].ts` - 4 SQL queries
10. ❌ `pages/api/solutions/[id].ts` - 4 SQL queries
11. ❌ `pages/api/prompts/[id].ts` - 4 SQL queries
12. ❌ `pages/api/files/[id].ts` - 4 SQL queries

**Total Files:** 12 files  
**Estimated Lines:** ~150 SQL queries

### Step 2: Update Type Definitions ✅

**File:** `types/index.ts`

Change all interfaces to match database:
```typescript
export interface DailyReport {
  report_id: number;              // Changed from id
  user_id: number;
  ...
}

export interface Task {
  task_id: number;                // Changed from id
  user_id: number;
  ...
}

// Etc. for all interfaces
```

### Step 3: Update Frontend Forms (if needed) ✅

Check if forms reference `.id` directly:
- `pages/reports/edit/[id].tsx`
- `pages/tasks/[id].tsx`
- `pages/users/[id].tsx`

Most likely using URL params, so should be OK.

### Step 4: Test All CRUD Operations ✅

Test matrix:
```
           Create  Read  Update  Delete
Reports     ✅     ❌    ❌      ❌
Tasks       ❌     ❌    ❌      ❌
Users       ❌     ❌    ❌      ❌
Requests    ❌     ❌    ❌      ❌
Issues      ❌     ❌    ❌      ❌
```

---

## Implementation Priority

### P0 - Critical (Fix Immediately)
1. ✅ Reports API (blocking user workflow)
2. Tasks API (high usage)
3. Users API (admin functionality)

### P1 - High
4. Requests API
5. Issues API
6. Solutions API

### P2 - Medium
7. Prompts API
8. Files API

---

## SQL Query Patterns

### Pattern 1: SELECT by ID
```sql
-- ❌ WRONG
SELECT * FROM daily_reports WHERE id = ?
SELECT * FROM tasks WHERE id = ?
SELECT * FROM users WHERE id = ?

-- ✅ CORRECT
SELECT * FROM daily_reports WHERE report_id = ?
SELECT * FROM tasks WHERE task_id = ?
SELECT * FROM users WHERE user_id = ?
```

### Pattern 2: UPDATE by ID
```sql
-- ❌ WRONG
UPDATE daily_reports SET ... WHERE id = ?
UPDATE tasks SET ... WHERE id = ?

-- ✅ CORRECT
UPDATE daily_reports SET ... WHERE report_id = ?
UPDATE tasks SET ... WHERE task_id = ?
```

### Pattern 3: DELETE by ID
```sql
-- ❌ WRONG
DELETE FROM daily_reports WHERE id = ?
DELETE FROM tasks WHERE id = ?

-- ✅ CORRECT
DELETE FROM daily_reports WHERE report_id = ?
DELETE FROM tasks WHERE task_id = ?
```

### Pattern 4: Foreign Key Checks
```sql
-- ❌ WRONG
SELECT user_id FROM tasks WHERE id = ?

-- ✅ CORRECT
SELECT user_id FROM tasks WHERE task_id = ?
```

---

## Testing Checklist

After fixes, test each endpoint:

### Reports
- [ ] GET /api/reports/:id
- [ ] PUT /api/reports/:id (update)
- [ ] DELETE /api/reports/:id
- [ ] GET /reports/:id (view page)
- [ ] GET /reports/edit/:id (edit form)
- [ ] Edit form submission

### Tasks
- [ ] GET /api/tasks/:id
- [ ] PUT /api/tasks/:id
- [ ] DELETE /api/tasks/:id
- [ ] Task form edit

### Users
- [ ] GET /api/users/:id
- [ ] PUT /api/users/:id
- [ ] DELETE /api/users/:id

---

## Risk Assessment

**Risk Level:** HIGH  
**Complexity:** MEDIUM  
**Testing Required:** EXTENSIVE

**Risks:**
1. Missing a SQL query → functionality broken
2. Frontend expects different field names → display broken
3. Type mismatches → TypeScript errors
4. Integration tests may need updates

**Mitigation:**
1. Systematic search-replace per file
2. Add debug logging temporarily
3. Test each endpoint individually
4. Keep backup of working code

---

## Success Criteria

✅ **All CRUD operations work for:**
- Reports (create, read, update, delete)
- Tasks (create, read, update, delete)
- Users (create, read, update, delete)
- All other entities

✅ **No SQL errors in logs**

✅ **Forms submit successfully**

✅ **Data displays correctly**

---

## Next Steps

1. **Immediate:** Fix Reports API (highest priority)
2. **Today:** Fix Tasks API and Users API
3. **This Week:** Fix remaining APIs
4. **Testing:** Comprehensive integration testing
5. **Documentation:** Update API docs with correct schema

---

## Appendix A: Complete File List

### API Files Requiring Changes

```
pages/api/
├── reports/
│   └── [id].ts                 ❌ 3 queries to fix
├── tasks/
│   └── [id].ts                 ❌ 8+ queries to fix
├── users/
│   ├── [id].ts                 ❌ 5 queries to fix
│   └── index.ts                ❌ 2 queries to fix
├── requests/
│   └── [id].ts                 ❌ 4 queries to fix
├── issues/
│   └── [id].ts                 ❌ 4 queries to fix
├── solutions/
│   └── [id].ts                 ❌ 4 queries to fix
├── prompts/
│   └── [id].ts                 ❌ 4 queries to fix
└── files/
    └── [id].ts                 ❌ 4 queries to fix
```

---

## Appendix B: Database Schema Reference

```sql
-- ACTUAL SCHEMA (Remote Database)
CREATE TABLE users (
    user_id INT PRIMARY KEY,     -- NOT 'id'
    username VARCHAR(50),
    ...
);

CREATE TABLE daily_reports (
    report_id INT PRIMARY KEY,   -- NOT 'id'
    user_id INT,                 -- FK to users.user_id
    ...
);

CREATE TABLE tasks (
    task_id INT PRIMARY KEY,     -- NOT 'id'
    user_id INT,                 -- FK to users.user_id
    report_id INT,               -- FK to daily_reports.report_id
    ...
);
```

---

**Document Created:** December 3, 2025  
**Last Updated:** December 3, 2025  
**Status:** Ready for Implementation  
**Priority:** CRITICAL

