# System Integration Plan - Nautilus Reporting System
## Comprehensive Database & API Integration Document

**Date:** December 3, 2025  
**Status:** Implementation Required  
**Priority:** High

---

## Executive Summary

This document outlines the complete integration architecture for the Nautilus Reporting System, identifies current issues, and provides implementation steps to achieve full system integration.

### Current Status
- ✅ 15 Tables Created
- ✅ 35 Foreign Key Relationships
- ✅ 81 Database Indexes
- ❌ 4 Broken Views
- ❌ 1 Table Schema Mismatch

---

## 1. CURRENT ISSUES IDENTIFIED

### Critical Issues

#### 1.1 Broken Database Views
All 4 views are broken and need to be recreated:
- `v_file_activity` - File modification tracking
- `v_prompt_activity` - AI usage statistics
- `v_request_pipeline` - Request status tracking
- `v_task_dashboard` - Task overview dashboard

**Impact:** Dashboard analytics not working  
**Priority:** HIGH

#### 1.2 file_versions Table Schema Mismatch
- **Current PK:** `file_version_id`
- **Expected PK:** `file_id`
- **Missing Column:** `file_name`

**Impact:** File API may fail  
**Priority:** HIGH

---

## 2. COMPLETE DATABASE SCHEMA

### 2.1 Primary Keys Convention

All tables use descriptive primary keys:

| Table | Primary Key | API Expects | Status |
|-------|-------------|-------------|--------|
| users | user_id | user_id | ✅ CORRECT |
| daily_reports | report_id | report_id | ✅ CORRECT |
| tasks | task_id | task_id | ✅ CORRECT |
| issues | issue_id | issue_id | ✅ CORRECT |
| problems_solved | solution_id | solution_id | ✅ CORRECT |
| requests | request_id | request_id | ✅ CORRECT |
| ai_prompts | prompt_id | prompt_id | ✅ CORRECT |
| file_versions | file_version_id | file_id | ❌ MISMATCH |
| sessions | session_id | session_id | ✅ CORRECT |
| data_uploads | upload_id | upload_id | ✅ CORRECT |
| activity_log | id | id | ✅ CORRECT |

### 2.2 Foreign Key Relationships

```
users (user_id)
  ├─→ sessions (user_id)
  ├─→ daily_reports (user_id)
  ├─→ daily_reports (reviewed_by)
  ├─→ tasks (user_id)
  ├─→ tasks (assigned_to)
  ├─→ issues (user_id)
  ├─→ problems_solved (user_id)
  ├─→ requests (user_id)
  ├─→ requests (assigned_to)
  ├─→ ai_prompts (user_id)
  ├─→ file_versions (user_id)
  └─→ activity_log (user_id)

daily_reports (report_id)
  ├─→ ai_prompts (report_id)
  ├─→ requests (report_id)
  ├─→ tasks (report_id)
  ├─→ file_versions (report_id)
  ├─→ issues (report_id) [via old schema]
  └─→ problems_solved (report_id) [via old schema]

tasks (task_id)
  ├─→ tasks (parent_task_id) [self-reference]
  ├─→ task_files (task_id)
  └─→ daily_reports (task_id)

issues (issue_id)
  ├─→ problems_solved (issue_id)
  └─→ tasks (issue_id)

requests (request_id)
  └─→ tasks (request_id)

ai_prompts (prompt_id)
  ├─→ prompt_files (prompt_id)
  ├─→ tasks (prompt_id)
  └─→ issues (prompt_id)

file_versions (file_version_id)
  ├─→ prompt_files (file_version_id)
  ├─→ task_files (file_version_id)
  └─→ file_versions (previous_version_id)
```

---

## 3. API ENDPOINTS MAPPING

### 3.1 Authentication APIs
```
POST   /api/auth/login        → users (user_id)
POST   /api/auth/logout       → sessions (session_id)
GET    /api/auth/me           → users (user_id)
```

### 3.2 Reports APIs
```
GET    /api/reports           → daily_reports (report_id)
POST   /api/reports           → daily_reports (report_id)
GET    /api/reports/[id]      → daily_reports (report_id)
PUT    /api/reports/[id]      → daily_reports (report_id)
DELETE /api/reports/[id]      → daily_reports (report_id)
```

### 3.3 Tasks APIs
```
GET    /api/tasks             → tasks (task_id)
POST   /api/tasks             → tasks (task_id)
GET    /api/tasks/[id]        → tasks (task_id)
PUT    /api/tasks/[id]        → tasks (task_id)
DELETE /api/tasks/[id]        → tasks (task_id)
```

### 3.4 Issues APIs
```
GET    /api/issues            → issues (issue_id)
POST   /api/issues            → issues (issue_id)
GET    /api/issues/[id]       → issues (issue_id)
PUT    /api/issues/[id]       → issues (issue_id)
DELETE /api/issues/[id]       → issues (issue_id)
```

### 3.5 Solutions APIs
```
GET    /api/solutions         → problems_solved (solution_id)
POST   /api/solutions         → problems_solved (solution_id)
GET    /api/solutions/[id]    → problems_solved (solution_id)
PUT    /api/solutions/[id]    → problems_solved (solution_id)
DELETE /api/solutions/[id]    → problems_solved (solution_id)
```

### 3.6 Requests APIs
```
GET    /api/requests          → requests (request_id)
POST   /api/requests          → requests (request_id)
GET    /api/requests/[id]     → requests (request_id)
PUT    /api/requests/[id]     → requests (request_id)
DELETE /api/requests/[id]     → requests (request_id)
```

### 3.7 AI Prompts APIs
```
GET    /api/prompts           → ai_prompts (prompt_id)
POST   /api/prompts           → ai_prompts (prompt_id)
GET    /api/prompts/[id]      → ai_prompts (prompt_id)
PUT    /api/prompts/[id]      → ai_prompts (prompt_id)
DELETE /api/prompts/[id]      → ai_prompts (prompt_id)
```

### 3.8 File Versions APIs
```
GET    /api/files             → file_versions (file_version_id)
POST   /api/files             → file_versions (file_version_id)
GET    /api/files/[id]        → file_versions (file_version_id)
PUT    /api/files/[id]        → file_versions (file_version_id)
DELETE /api/files/[id]        → file_versions (file_version_id)
```

### 3.9 Users APIs
```
GET    /api/users             → users (user_id)
POST   /api/users             → users (user_id)
GET    /api/users/[id]        → users (user_id)
PUT    /api/users/[id]        → users (user_id)
DELETE /api/users/[id]        → users (user_id)
```

---

## 4. FRONTEND PAGES MAPPING

### 4.1 Reports Pages
```
/reports                       → GET /api/reports
/reports/new                   → POST /api/reports
/reports/[id]                  → GET /api/reports/[id]
/reports/edit/[id]             → PUT /api/reports/[id]
```

### 4.2 Tasks Pages
```
/tasks                         → GET /api/tasks
/tasks/new                     → POST /api/tasks
/tasks/[id]                    → GET /api/tasks/[id]
                                 PUT /api/tasks/[id]
```

### 4.3 Requests Pages
```
/requests                      → GET /api/requests
/requests/[id]                 → GET /api/requests/[id]
                                 PUT /api/requests/[id]
```

### 4.4 AI Prompts Pages
```
/prompts                       → GET /api/prompts
/prompts/[id]                  → GET /api/prompts/[id]
                                 PUT /api/prompts/[id]
```

### 4.5 Files Pages
```
/files                         → GET /api/files
/files/[id]                    → GET /api/files/[id]
                                 PUT /api/files/[id]
```

---

## 5. DATA FLOW INTEGRATION

### 5.1 Report Creation Flow
```
User Action → Frontend Form
  ↓
POST /api/reports
  ↓
Validate Data
  ↓
INSERT INTO daily_reports
  ↓
Generate report_id
  ↓
Return report_id to frontend
  ↓
Redirect to /reports/[id]
```

### 5.2 Task Creation with Report Link
```
User Action → Task Form
  ↓
POST /api/tasks
  ↓
{
  title,
  description,
  report_id ← Link to daily_reports
  user_id,
  status
}
  ↓
INSERT INTO tasks
  ↓
Foreign Key validates report_id exists
  ↓
Return task_id
  ↓
Redirect to /tasks/[id]
```

### 5.3 Issue Resolution Flow
```
Create Issue → issues (issue_id)
  ↓
Work on solution
  ↓
Create Solution → problems_solved
  ↓
Link via issue_id (FK)
  ↓
Update issue.status = 'resolved'
  ↓
Track in activity_log
```

---

## 6. IMPLEMENTATION REQUIREMENTS

### 6.1 Immediate Fixes Required

#### Fix 1: Recreate All Views
**Priority:** HIGH

```sql
-- Will be created in FIX_VIEWS.sql
DROP VIEW IF EXISTS v_file_activity;
DROP VIEW IF EXISTS v_prompt_activity;
DROP VIEW IF EXISTS v_request_pipeline;
DROP VIEW IF EXISTS v_task_dashboard;

CREATE VIEW v_file_activity AS ...
CREATE VIEW v_prompt_activity AS ...
CREATE VIEW v_request_pipeline AS ...
CREATE VIEW v_task_dashboard AS ...
```

#### Fix 2: Fix file_versions Table (Optional)
**Priority:** MEDIUM

Option A: Add alias column
```sql
ALTER TABLE file_versions 
ADD COLUMN file_name VARCHAR(255) GENERATED ALWAYS AS (
  SUBSTRING_INDEX(file_path, '/', -1)
) STORED;
```

Option B: Keep as-is and update API to use `file_version_id`

**Recommendation:** Option A (less code changes)

### 6.2 API Updates Required

#### reports/[id].ts
- ✅ Already uses `report_id`
- ✅ Correct schema

#### tasks/index.ts & tasks/[id].ts
- ❌ Need to verify all JOINs use correct column names
- ✅ Uses `task_id` correctly

#### files/index.ts & files/[id].ts
- ❌ May expect `file_id` but DB has `file_version_id`
- ⚠️  Needs verification

---

## 7. INTEGRATION TESTING CHECKLIST

### 7.1 Database Tests
- [ ] All views return data without errors
- [ ] All foreign keys maintain referential integrity
- [ ] Indexes are being used in queries
- [ ] No orphaned records

### 7.2 API Tests
- [ ] All GET endpoints return correct data structure
- [ ] All POST endpoints create records with correct IDs
- [ ] All PUT endpoints update records successfully
- [ ] All DELETE endpoints respect foreign key constraints

### 7.3 Frontend Tests
- [ ] Report creation and editing works
- [ ] Task creation with report linking works
- [ ] Issue creation and resolution flow works
- [ ] File upload and versioning works
- [ ] AI prompt logging works

---

## 8. PERFORMANCE OPTIMIZATION

### 8.1 Current Index Coverage
- ✅ 81 indexes across 15 tables
- ✅ All foreign keys indexed
- ✅ Common query columns indexed

### 8.2 Query Optimization
- Use views for complex queries
- Implement pagination for large datasets
- Cache frequently accessed data
- Use connection pooling (already implemented)

---

## 9. IMPLEMENTATION STEPS

### Step 1: Fix Broken Views
```bash
mysql -u root -p < database/FIX_VIEWS.sql
```

### Step 2: Fix file_versions Schema (if needed)
```bash
mysql -u root -p < database/FIX_FILE_VERSIONS.sql
```

### Step 3: Verify All APIs
```bash
npm run dev
# Test each endpoint
```

### Step 4: Test Frontend Pages
- Test report editing
- Test task creation
- Test all forms

### Step 5: Validate Integration
```bash
node scripts/comprehensive_audit.js
```

---

## 10. MAINTENANCE & MONITORING

### 10.1 Regular Checks
- Weekly: Run audit script
- Monthly: Review slow queries
- Quarterly: Optimize indexes

### 10.2 Backup Strategy
- Daily: Automated database backups
- Weekly: Full system backup
- Monthly: Archived backups

---

## 11. SUCCESS METRICS

### Database Health
- ✅ Zero broken views
- ✅ 100% foreign key integrity
- ✅ All required columns present
- ✅ Consistent naming convention

### API Performance
- ✅ < 200ms average response time
- ✅ Zero 500 errors
- ✅ Proper error handling

### User Experience
- ✅ All forms work correctly
- ✅ Data displays properly
- ✅ No broken links

---

## 12. DOCUMENTATION

### For Developers
- This document (SYSTEM_INTEGRATION_PLAN.md)
- Database schema (CORRECT_SCHEMA.sql)
- API documentation (docs/)

### For Users
- User guide (to be created)
- FAQ (to be created)

---

## APPENDIX A: Column Name Reference

### User ID References
- `users.user_id` (PK)
- Referenced by: `sessions.user_id`, `daily_reports.user_id`, `tasks.user_id`, etc.

### Report ID References
- `daily_reports.report_id` (PK)
- Referenced by: `ai_prompts.report_id`, `requests.report_id`, `tasks.report_id`

### Task ID References
- `tasks.task_id` (PK)
- Referenced by: `tasks.parent_task_id`, `task_files.task_id`, `daily_reports.task_id`

---

## APPENDIX B: API Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Data returned |
| 201 | Created | Resource created |
| 400 | Bad Request | Check input data |
| 401 | Unauthorized | Login required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Check logs |

---

**Document Version:** 1.0  
**Last Updated:** December 3, 2025  
**Next Review:** After fixes implementation

---

## IMPLEMENTATION STATUS

- [ ] Views fixed
- [ ] file_versions fixed
- [ ] APIs verified
- [ ] Frontend tested
- [ ] Integration validated
- [ ] Documentation complete

---

