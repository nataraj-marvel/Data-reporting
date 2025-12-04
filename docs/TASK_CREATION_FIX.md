# Task Creation Fix - Quick Reference

**Date**: December 3, 2025  
**Status**: ✅ Fixed & Tested  
**Issue**: Internal server error when creating tasks

---

## 🐛 Problem Description

Users encountered an "Internal server error" when attempting to create tasks through the API or web interface.

### Root Cause
The tasks API was using the old database schema with fields like:
- `assigned_to` (user who receives the task)
- `assigned_by` (user who created the task)

However, the v2.0 migration created a new schema with:
- `user_id` (task owner)
- `report_id`, `request_id`, `issue_id`, `prompt_id` (relationships)
- `task_type`, `completion_percentage` (new fields)
- `parent_task_id` (for subtasks)

This mismatch caused SQL errors when inserting new tasks.

---

## ✅ Solution Implemented

### 1. API Endpoints Updated

#### `/api/tasks/index.ts` (Complete Rewrite)
**Changes**:
- ✅ Updated INSERT query to use new schema fields
- ✅ Added support for `user_id` instead of `assigned_to`/`assigned_by`
- ✅ Added support for linking to requests, issues, and prompts
- ✅ Implemented task_type field
- ✅ Added comprehensive filtering options
- ✅ Added pagination support

**New Features**:
```javascript
// Now supports all these fields when creating a task
{
  user_id,           // Auto-set from authenticated user
  report_id,         // Optional: Link to daily report
  request_id,        // Optional: Link to feature request
  issue_id,          // Optional: Link to issue
  prompt_id,         // Optional: Link to AI prompt
  parent_task_id,    // Optional: For subtasks
  title,             // Required
  description,       // Optional
  status,            // pending, in_progress, blocked, review, completed, cancelled
  priority,          // low, medium, high, critical
  task_type,         // development, bugfix, testing, documentation, etc.
  estimated_hours,   // Optional
  due_date           // Optional
}
```

#### `/api/tasks/[id].ts` (Updated)
**Changes**:
- ✅ Fixed GET query to use new schema
- ✅ Updated PUT to support all new fields
- ✅ Added auto-timestamp updates (started_at, completed_at)
- ✅ Added retrieval of subtasks
- ✅ Added file associations

### 2. Task Creation Form Created

**File**: `/pages/tasks/new.tsx`

**Features**:
- ✅ User-friendly web form
- ✅ All required and optional fields
- ✅ Priority color indicators
- ✅ Task type dropdown
- ✅ Links to requests and issues
- ✅ Date picker for due dates
- ✅ Real-time validation
- ✅ Success/error messaging

### 3. Authentication Fix

**File**: `lib/auth.ts`

**Change**:
```typescript
// Added alias for consistency
export const verifyAuth = authenticateRequest;
```

This ensures all v2.0 API endpoints can use `verifyAuth` consistently.

---

## 🧪 Testing Steps

### Test 1: Create Task via Web Form

1. **Navigate to task creation page**:
   ```
   http://localhost:3000/tasks/new
   ```

2. **Fill in the form**:
   - Title: "Implement dark mode toggle"
   - Description: "Add dark mode switch to user settings"
   - Task Type: Development
   - Priority: High
   - Estimated Hours: 6
   - Due Date: Pick a date

3. **Click "Create Task"**

4. **Expected Result**: 
   - ✅ Success message appears
   - ✅ Redirects to tasks list
   - ✅ New task appears in database

### Test 2: Create Task via API

```bash
# Using curl
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN_HERE" \
  -d '{
    "title": "Fix login validation",
    "description": "Add proper email validation to login form",
    "priority": "high",
    "task_type": "bugfix",
    "estimated_hours": 3,
    "due_date": "2025-12-10"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "Fix login validation",
    "description": "Add proper email validation to login form",
    "status": "pending",
    "priority": "high",
    "task_type": "bugfix",
    "estimated_hours": 3,
    "due_date": "2025-12-10",
    "created_at": "2025-12-03T...",
    "assigned_user": "admin",
    "assigned_user_name": "System Administrator"
  },
  "message": "Task created successfully"
}
```

### Test 3: Create Task with Relationships

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN_HERE" \
  -d '{
    "title": "Complete feature request #5",
    "request_id": 5,
    "issue_id": 12,
    "priority": "critical",
    "task_type": "development",
    "estimated_hours": 16
  }'
```

**Expected Result**: Task created and linked to request #5 and issue #12

### Test 4: Verify Database Record

```sql
-- Check the newly created task
SELECT * FROM tasks WHERE id = 1;

-- Verify relationships
SELECT 
  t.title,
  r.title as request_title,
  i.title as issue_title,
  u.full_name as owner
FROM tasks t
LEFT JOIN requests r ON t.request_id = r.id
LEFT JOIN issues i ON t.issue_id = i.id
LEFT JOIN users u ON t.user_id = u.id
WHERE t.id = 1;
```

---

## 📊 Database Schema Reference

### Old Schema (Causing Errors)
```sql
CREATE TABLE tasks (
  id INT PRIMARY KEY,
  assigned_to INT,      -- ❌ No longer exists
  assigned_by INT,      -- ❌ No longer exists
  title VARCHAR(255),
  description TEXT,
  status ENUM(...),
  priority ENUM(...),
  due_date DATE
);
```

### New Schema (v2.0)
```sql
CREATE TABLE tasks (
  id INT PRIMARY KEY,
  user_id INT NOT NULL,              -- ✅ Task owner
  report_id INT,                     -- ✅ Link to report
  request_id INT,                    -- ✅ Link to request
  issue_id INT,                      -- ✅ Link to issue
  prompt_id INT,                     -- ✅ Link to AI prompt
  parent_task_id INT,                -- ✅ For subtasks
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'in_progress', 'blocked', 'review', 'completed', 'cancelled'),
  priority ENUM('low', 'medium', 'high', 'critical'),
  task_type ENUM('development', 'bugfix', 'testing', 'documentation', 'review', 'research', 'deployment', 'other'),
  estimated_hours DECIMAL(6,2),
  actual_hours DECIMAL(6,2),
  completion_percentage INT,         -- ✅ 0-100
  due_date DATE,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  blocked_reason TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🎯 What Works Now

### ✅ Task Creation
- Create tasks via API endpoint
- Create tasks via web form
- Set all task properties
- Link to requests, issues, prompts
- Create subtasks

### ✅ Task Retrieval
- Get all tasks with pagination
- Filter by status, priority, type
- Search by title/description
- Get task with all relationships
- Get subtasks

### ✅ Task Updates
- Update any field
- Auto-set timestamps on status change
- Update completion percentage
- Add blocked reason

### ✅ Task Deletion
- Delete tasks (cascade to junction tables)
- Permission checks (owner or admin)

---

## 🔍 Troubleshooting

### Issue: Still getting "Internal server error"

**Check**:
1. Migration was run successfully
   ```bash
   mysql -u root -p nautilus_reporting < database/schema_v2_migration.sql
   ```

2. Server was restarted after code changes
   ```bash
   npm run dev
   ```

3. Authentication token is valid
   ```bash
   # Test authentication
   curl http://localhost:3000/api/auth/me \
     -H "Cookie: auth_token=YOUR_TOKEN"
   ```

### Issue: "Title is required" error

**Solution**: Make sure you include the `title` field in your request:
```json
{
  "title": "Your task title here",
  ...
}
```

### Issue: Cannot link to request/issue

**Check**:
1. The request/issue exists:
   ```bash
   curl http://localhost:3000/api/requests/5
   curl http://localhost:3000/api/issues/12
   ```

2. You have permission to access them

---

## 📚 Related Documentation

- **Full Project Document**: `docs/AI_AGENT_UPGRADE_PROJECT.md`
- **Implementation Summary**: `docs/IMPLEMENTATION_SUMMARY.md`
- **Forms Usage Guide**: `docs/FORMS_USAGE_GUIDE.md`
- **Database Schema**: `database/schema_v2_migration.sql`

---

## 📞 Support

If you encounter any issues:
1. Check server logs for detailed error messages
2. Verify database schema matches v2.0
3. Ensure authentication is working
4. Review API request format

---

**Status**: ✅ RESOLVED  
**Version**: v2.0.1  
**Last Updated**: December 3, 2025


