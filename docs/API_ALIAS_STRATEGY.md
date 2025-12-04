# API Response Alias Strategy

## Problem
- Database uses: `user_id`, `report_id`, `task_id`, etc. (descriptive names)
- Frontend expects: `id`, `id`, `id`, etc. (generic names)
- TypeScript types use: `id` (generic)

## Solution: SQL Aliases in API Responses

Add SQL aliases in SELECT statements to map database column names to expected frontend field names.

### Example Pattern

```sql
-- Instead of:
SELECT u.* FROM users u WHERE u.user_id = ?

-- Use:
SELECT 
  u.user_id as id,
  u.username,
  u.full_name,
  ...
FROM users u 
WHERE u.user_id = ?
```

## Benefits
1. ✅ Frontend code works without changes
2. ✅ TypeScript types remain simple
3. ✅ Quick fix with minimal code changes
4. ✅ Backward compatible

## Drawbacks
1. ❌ Hides actual database structure
2. ❌ Inconsistent with database schema
3. ❌ Need to remember to add aliases in new queries

## Implementation Status

### Already Using Aliases
Most API endpoints already return proper field names from the database without aliases.

### Needs Aliases
The following API endpoints should add aliases if frontend is breaking:

- `/api/reports/[id].ts` - Add `report_id as id`
- `/api/tasks/[id].ts` - Add `task_id as id`  
- `/api/users/index.ts` - Add `user_id as id`
- `/api/requests/[id].ts` - Add `request_id as id`
- `/api/prompts/[id].ts` - Add `prompt_id as id`
- `/api/files/[id].ts` - Add `file_id as id`
- `/api/issues/[id].ts` - Add `issue_id as id`
- `/api/solutions/[id].ts` - Add `solution_id as id`

## Alternative: Update Frontend

A better long-term solution is to update the frontend to use proper column names:

```tsx
// Change from:
<h1>Report #{report.id}</h1>

// To:
<h1>Report #{report.report_id}</h1>
```

This makes the code more explicit and matches the database schema.

## Recommendation

For now, **use SQL aliases** as a quick fix. Plan to migrate frontend code to use proper column names in a future update.

