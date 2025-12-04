# Critical Schema Mismatch Audit - December 3, 2025

## 🚨 CRITICAL ISSUE FOUND

There is a **major mismatch** between the TypeScript type definitions and the actual database schema!

## Database Schema (CLEAN_INSTALL.sql)

The actual database uses **descriptive primary key names**:

```sql
users.user_id (PRIMARY KEY)
daily_reports.report_id (PRIMARY KEY)
tasks.task_id (PRIMARY KEY)
issues.issue_id (PRIMARY KEY)
problems_solved.solution_id (PRIMARY KEY)
requests.request_id (PRIMARY KEY)
ai_prompts.prompt_id (PRIMARY KEY)
file_versions.file_id (PRIMARY KEY)
sessions.session_id (PRIMARY KEY)
```

## TypeScript Types (types/index.ts)

The TypeScript interfaces use **generic `id`**:

```typescript
interface User { id: number; ... }
interface DailyReport { id: number; ... }
interface Task { id: number; ... }
interface Issue { id: number; ... }
// etc.
```

## Impact & Problems

### 1. API Responses
When API endpoints query the database, they return objects with PRIMARY KEY named:
- `user_id`, `report_id`, `task_id`, etc.

But frontend code expects:
- `id`, `id`, `id`, etc.

### 2. Frontend Display Issues
Frontend pages reference `report.id`, `task.id` but database returns `report_id`, `task_id`.

Examples found:
```tsx
// reports/[id].tsx
<h1>Report #{report.id}</h1>  // ❌ Should be report.report_id

// tasks/index.tsx
<td className="id-cell">#{task.id}</td>  // ❌ Should be task.task_id

// files/index.tsx  
onClick={() => router.push(`/files/${file.id}`)}  // ❌ Should be file.file_id
```

### 3. API Join Issues
Some API endpoints use `.id` in JOINs and WHERE clauses:
```typescript
// api/requests/[id].ts
LEFT JOIN tasks t ON r.id = t.request_id  // ❌ Should be r.request_id

// api/prompts/[id].ts
INNER JOIN prompt_files pf ON fv.id = pf.file_version_id  // ❌ Should be fv.file_id

// api/prompts/index.ts
WHERE pf.prompt_id = ap.id  // ❌ Should be ap.prompt_id
```

## Solutions

### Option 1: Update TypeScript Types (RECOMMENDED)
**Pros:**
- Matches actual database schema
- More explicit and self-documenting
- Reduces confusion
- Type-safe

**Cons:**
- Requires updating all frontend code
- More work initially

**Changes Required:**
```typescript
// Change from:
interface User { id: number; ... }
interface DailyReport { id: number; ... }

// To:
interface User { user_id: number; ... }
interface DailyReport { report_id: number; ... }
```

### Option 2: Add SQL Aliases in API (Quick Fix)
**Pros:**
- Less code changes needed
- Frontend code remains unchanged

**Cons:**
- Hides the actual database structure
- Inconsistent with database schema
- Harder to maintain

**Changes Required:**
```sql
-- Add aliases in SELECT:
SELECT 
  u.user_id as id,
  u.username,
  ...
FROM users u
```

### Option 3: Create Database Views
**Pros:**
- Clean separation between database and application
- Can handle both naming conventions

**Cons:**
- Additional layer of complexity
- Potential performance impact

## Recommendation

**Use Option 1** - Update TypeScript types to match the database schema. This is the most maintainable long-term solution.

## Files Requiring Updates

### TypeScript Types
- [ ] `/types/index.ts` - Update all interface primary keys

### API Endpoints
- [ ] `/pages/api/auth/login.ts` - Line 45: `user.user_id || user.id`
- [ ] `/pages/api/requests/[id].ts` - Line 53, 58, 60: Fix JOIN and GROUP BY
- [ ] `/pages/api/prompts/[id].ts` - Line 84: Fix JOIN
- [ ] `/pages/api/prompts/index.ts` - Line 125: Fix subquery

### Frontend Pages
- [ ] `/pages/reports/[id].tsx` - Line 158, 168: Use `report.report_id`
- [ ] `/pages/reports.tsx` - Line 126-169: Use `r.report_id`
- [ ] `/pages/tasks/index.tsx` - Line 181-233: Use `task.task_id`
- [ ] `/pages/tasks/[id].tsx` - Line 375-416: Use proper IDs
- [ ] `/pages/tasks/new.tsx` - Line 223-264: Use proper IDs
- [ ] `/pages/files/index.tsx` - Line 77-98: Use `file.file_id`
- [ ] `/pages/files/[id].tsx` - Line 73: Use proper ID
- [ ] `/pages/requests/index.tsx` - Line 74-98: Use `request.request_id`
- [ ] `/pages/requests/[id].tsx` - Line 87, 271: Use proper IDs
- [ ] `/pages/prompts/index.tsx` - Line 72-92: Use `prompt.prompt_id`
- [ ] `/pages/prompts/[id].tsx` - Line 70: Use proper ID
- [ ] `/pages/reports/new.tsx` - Line 112: Use `t.task_id`

## Current Status

✅ **Fixed:** SQL JOIN clauses in most API endpoints
❌ **Still Broken:** TypeScript types don't match database
❌ **Still Broken:** Frontend displays using wrong field names
❌ **Still Broken:** Some API JOINs still using `.id`

## Priority: CRITICAL

This mismatch affects the entire application and causes runtime errors when data is accessed.

