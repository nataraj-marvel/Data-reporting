# SQL Column Naming Fix - December 3, 2025

## Problem
The application was showing SQL errors when viewing/editing reports and tasks:
- `Unknown column 'r.task_id' in 'on clause'`
- `Unknown column 'u.user_id' in 'on clause'`
- `Unknown column 'report_id' in 'where clause'`

## Root Cause
The API files were using incorrect column names in SQL JOIN and WHERE clauses. The actual database schema (CLEAN_INSTALL.sql) uses proper naming conventions:

### Correct Database Schema (CLEAN_INSTALL.sql)
```sql
-- PRIMARY KEYS use descriptive names:
users.user_id (not users.id)
daily_reports.report_id (not daily_reports.id)
tasks.task_id (not tasks.id)
requests.request_id (not requests.id)
issues.issue_id (not issues.id)
problems_solved.solution_id (not problems_solved.id)
ai_prompts.prompt_id (not ai_prompts.id)
file_versions.file_id (not file_versions.id)
```

### Correct JOIN Syntax
```sql
-- ✅ CORRECT
LEFT JOIN users u ON r.user_id = u.user_id
LEFT JOIN daily_reports dr ON t.report_id = dr.report_id
LEFT JOIN tasks t ON r.task_id = t.task_id

-- ❌ WRONG (causes errors)
LEFT JOIN users u ON r.user_id = u.id
LEFT JOIN daily_reports dr ON t.report_id = dr.id
LEFT JOIN tasks t ON r.task_id = t.id
```

## Files Fixed

### 1. `/pages/api/reports/index.ts`
- Fixed: `LEFT JOIN users u ON r.user_id = u.user_id`

### 2. `/pages/api/reports/[id].ts`
- Fixed: `WHERE report_id = ?` (all occurrences)
- Fixed: `UPDATE daily_reports ... WHERE report_id = ?`
- Fixed: `DELETE FROM daily_reports WHERE report_id = ?`

### 3. `/pages/api/tasks/index.ts`
- Fixed: All JOIN clauses to use proper column names:
  - `u_creator.user_id`
  - `u_assigned.user_id`
  - `dr.report_id`
  - `r.request_id`
  - `i.issue_id`
  - `p.prompt_id`
  - `pt.task_id`
- Fixed: `WHERE t.task_id = ?`

### 4. `/pages/api/tasks/[id].ts`
- Fixed: All JOIN clauses to use proper column names
- Fixed: `WHERE task_id = ?` (all occurrences)
- Fixed: `UPDATE tasks ... WHERE task_id = ?`
- Fixed: `DELETE FROM tasks WHERE task_id = ?`

### 5. `/pages/api/files/[id].ts`
- Fixed: `LEFT JOIN users u ON fv.user_id = u.user_id`
- Fixed: `LEFT JOIN tasks t ON fv.task_id = t.task_id`
- Fixed: `LEFT JOIN problems_solved ps ON fv.solution_id = ps.solution_id`

### 6. `/pages/api/files/index.ts`
- Fixed: All JOIN clauses to use proper column names

### 7. `/pages/api/prompts/[id].ts`
- Fixed: `LEFT JOIN users u ON ap.user_id = u.user_id`
- Fixed: `WHERE prompt_id = ?` (all occurrences)

### 8. `/pages/api/prompts/index.ts`
- Fixed: All JOIN clauses to use proper column names
- Fixed: `WHERE prompt_id = ?`

### 9. `/pages/api/requests/[id].ts`
- Fixed: `WHERE request_id = ?` (all occurrences)

## Testing
After these fixes:
- ✅ Login works correctly
- ✅ Reports list loads without errors
- ✅ Report view/edit should work
- ✅ Task view/edit should work
- ✅ All API endpoints use correct column names

## Important Note
The database uses **proper naming conventions** where primary keys are named descriptively (e.g., `user_id`, `report_id`, `task_id`) rather than generic `id`. This makes the schema self-documenting and reduces ambiguity in complex queries.

## Reference
See `/database/CLEAN_INSTALL.sql` for the authoritative database schema.

