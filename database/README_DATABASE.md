# Database Schema Documentation

## Overview
This document explains the correct database schema for the Nautilus Reporting System and how to fix common errors.

## Common Error Fixed
**ERROR**: `Unknown column 'u.user_id' in 'on clause'`

**CAUSE**: Incorrect JOIN syntax using `u.user_id` when the column name is `u.id`

## Correct Table Structure

### Primary Keys
All tables use `id` as the primary key column name:
- `users.id`
- `daily_reports.id`
- `tasks.id`
- `requests.id`
- `issues.id`
- `problems_solved.id`
- `ai_prompts.id`
- `file_versions.id`

### Foreign Keys
Foreign key columns are named with `_id` suffix:
- `user_id` → references `users.id`
- `report_id` → references `daily_reports.id`
- `task_id` → references `tasks.id`
- `request_id` → references `requests.id`
- `issue_id` → references `issues.id`
- `prompt_id` → references `ai_prompts.id`
- `assigned_to` → references `users.id`
- `reviewed_by` → references `users.id`

## Correct JOIN Syntax

### ✅ CORRECT
```sql
-- Join users table
SELECT r.*, u.full_name 
FROM daily_reports r
LEFT JOIN users u ON r.user_id = u.id;

-- Join daily_reports from tasks
SELECT t.*, dr.report_date
FROM tasks t
LEFT JOIN daily_reports dr ON t.report_id = dr.id;

-- Multiple user joins (creator and assignee)
SELECT t.*,
       u_creator.full_name as creator_name,
       u_assigned.full_name as assignee_name
FROM tasks t
LEFT JOIN users u_creator ON t.user_id = u_creator.id
LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id;
```

### ❌ WRONG (Causes Errors)
```sql
-- WRONG: Using u.user_id (column doesn't exist)
SELECT r.*, u.full_name 
FROM daily_reports r
LEFT JOIN users u ON r.user_id = u.user_id;  -- ERROR!

-- WRONG: Using dr.report_id (column doesn't exist)
SELECT t.*, dr.report_date
FROM tasks t
LEFT JOIN daily_reports dr ON t.report_id = dr.report_id;  -- ERROR!

-- WRONG: Using t.task_id instead of t.id
SELECT * FROM tasks t WHERE t.task_id = ?;  -- ERROR!
```

## Database Files

### Core Schema Files
1. **CORRECT_SCHEMA.sql** - Complete, correct schema for all tables
   - Use this for new installations
   - Contains both core and enhanced v2.0 tables

2. **FIX_REMOTE_DB.sql** - Diagnostic and verification script
   - Run on existing remote database
   - Checks structure and tests JOINs
   - Adds missing indexes

3. **schema.sql** - Original core schema
   - Core tables only (users, daily_reports, issues, problems_solved, data_uploads)
   - No enhanced v2.0 features

4. **schema_v2_migration.sql** - Enhanced features migration
   - Adds AI prompts, requests, tasks, file versions
   - Only run if you want advanced features

### Migration Scripts
- **add_assigned_to_tasks.sql** - Adds assigned_to column to tasks
- **remote_db_migration.sql** - Basic compatibility fixes

## Running SQL Scripts

### Option 1: MySQL Workbench (Recommended for Windows)
1. Open MySQL Workbench
2. Connect to your database
3. File → Open SQL Script
4. Select the script (start with `FIX_REMOTE_DB.sql`)
5. Click Execute (⚡ lightning bolt icon)
6. Review output

### Option 2: Command Line
```bash
# Windows PowerShell
$env:MYSQL_PWD="your_password"
mysql -u your_username nautilus_reporting < FIX_REMOTE_DB.sql

# Linux/Mac
export MYSQL_PWD="your_password"
mysql -u your_username nautilus_reporting < FIX_REMOTE_DB.sql
```

### Option 3: phpMyAdmin
1. Log into phpMyAdmin
2. Select `nautilus_reporting` database
3. Click "SQL" tab
4. Paste script contents
5. Click "Go"

## Verification Steps

After fixing the database, verify with these queries:

```sql
-- 1. Check table structures
DESCRIBE users;
DESCRIBE daily_reports;

-- 2. Test reports query
SELECT r.id, r.report_date, r.hours_worked, u.full_name
FROM daily_reports r
LEFT JOIN users u ON r.user_id = u.id
LIMIT 5;

-- 3. Check for orphaned records
SELECT COUNT(*) as orphaned_reports
FROM daily_reports r
LEFT JOIN users u ON r.user_id = u.id
WHERE u.id IS NULL;
```

## API Code Fixes Applied

### Files Fixed
1. ✅ `pages/api/reports/index.ts` - Fixed user JOIN
2. ✅ `pages/api/tasks/index.ts` - Fixed all JOINs (2 locations)
3. ✅ `lib/db.ts` - Optimized connection pool

### Remaining Files (Already Correct)
- `pages/api/prompts/*.ts` - Uses correct `u.id` syntax
- `pages/api/requests/*.ts` - Uses correct `u.id` syntax
- `pages/api/files/*.ts` - Uses correct `u.id` syntax
- `pages/api/auth/*.ts` - Uses correct syntax

## Connection Pool Optimization

Reduced connection limit from 10 to 5 and added idle timeout to prevent "Too many connections" errors:

```typescript
connectionLimit: 5,
maxIdle: 5,
idleTimeout: 60000, // 60 seconds
```

## Summary of Changes

### Database Schema
- ✅ Created `CORRECT_SCHEMA.sql` with proper naming conventions
- ✅ Created `FIX_REMOTE_DB.sql` for verification
- ✅ Documented all table structures and relationships

### API Code Fixes
- ✅ Fixed `reports/index.ts`: Changed `u.user_id` → `u.id`
- ✅ Fixed `tasks/index.ts` (line ~156): Changed `u_creator.user_id` → `u_creator.id`
- ✅ Fixed `tasks/index.ts` (line ~156): Changed `u_assigned.user_id` → `u_assigned.id`
- ✅ Fixed `tasks/index.ts` (line ~253): Changed `u_creator.user_id` → `u_creator.id`
- ✅ Fixed `tasks/index.ts` (line ~253): Changed `u_assigned.user_id` → `u_assigned.id`
- ✅ Fixed all table references: Changed `*.task_id` → `*.id` where applicable

### Connection Management
- ✅ Reduced connection pool size
- ✅ Added idle connection timeout
- ✅ Added connection limits to prevent exhaustion

## Next Steps

1. **Immediate**: Application should now work with your remote database
2. **Optional**: Run `FIX_REMOTE_DB.sql` to verify structure and add indexes
3. **Future**: Run `CORRECT_SCHEMA.sql` enhanced sections if you want v2.0 features

## Support

If you still encounter errors:
1. Check the terminal logs for the exact error message
2. Run `FIX_REMOTE_DB.sql` and review the output
3. Verify your database credentials in `.env.local`
4. Ensure MySQL service is running

---
Last Updated: December 3, 2025

