# Quick Database Fix Reference

## The Problem
```
Error: Unknown column 'u.user_id' in 'on clause'
```

## The Solution

### ❌ WRONG
```sql
LEFT JOIN users u ON r.user_id = u.user_id
```

### ✅ CORRECT
```sql
LEFT JOIN users u ON r.user_id = u.id
```

## Why?
- Primary keys are named `id` (not `user_id`, `report_id`, etc.)
- Foreign keys are named `user_id`, `report_id`, etc.
- JOIN connects: `foreign_key` → `primary_key`

## Column Names Cheat Sheet

```
TABLE NAME         | PRIMARY KEY  | COMMON FOREIGN KEYS
-------------------|--------------|--------------------
users              | id           | -
daily_reports      | id           | user_id, reviewed_by
tasks              | id           | user_id, report_id, assigned_to, parent_task_id
requests           | id           | user_id, report_id, assigned_to
issues             | id           | report_id, user_id
problems_solved    | id           | report_id, user_id, issue_id
ai_prompts         | id           | user_id, report_id
file_versions      | id           | user_id
sessions           | id           | user_id
```

## Common JOIN Patterns

```sql
-- Users
FROM table t
LEFT JOIN users u ON t.user_id = u.id

-- Daily Reports
FROM table t
LEFT JOIN daily_reports dr ON t.report_id = dr.id

-- Multiple Users (creator + assignee)
FROM table t
LEFT JOIN users u_creator ON t.user_id = u_creator.id
LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id

-- Tasks with everything
SELECT t.*,
       u.full_name as creator_name,
       dr.report_date,
       r.title as request_title
FROM tasks t
LEFT JOIN users u ON t.user_id = u.id
LEFT JOIN daily_reports dr ON t.report_id = dr.id
LEFT JOIN requests r ON t.request_id = r.id
```

## What Was Fixed

### `pages/api/reports/index.ts`
```typescript
// Line 39
- LEFT JOIN users u ON r.user_id = u.user_id
+ LEFT JOIN users u ON r.user_id = u.id
```

### `pages/api/tasks/index.ts`
```typescript
// Line 156-162
- LEFT JOIN users u_creator ON t.user_id = u_creator.user_id
- LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.user_id
- LEFT JOIN daily_reports dr ON t.report_id = dr.report_id
- LEFT JOIN requests r ON t.request_id = r.request_id
- LEFT JOIN issues i ON t.issue_id = i.issue_id

+ LEFT JOIN users u_creator ON t.user_id = u_creator.id
+ LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
+ LEFT JOIN daily_reports dr ON t.report_id = dr.id
+ LEFT JOIN requests r ON t.request_id = r.id
+ LEFT JOIN issues i ON t.issue_id = i.id

// Line 253-258 (Same fixes in POST handler)
```

## Status
✅ **FIXED** - Server will auto-reload, just refresh your browser!

---
Quick Reference | Dec 3, 2025

