# AI Agent Quick Guide - Report Creation & Update

**Purpose:** Simple guide for AI agents to create and update reports via API

**Last Updated:** December 4, 2025

---

## 🤖 Quick Start for Agents

### Prerequisites
- API URL: Check `.env` file for `API_BASE_URL` (default: http://localhost:3000)
- Credentials: Username and password
- Node.js environment with `http` module

---

## 🎯 Two Reporting Methods

### Method 1: Incremental Reporting (Recommended)
**Avoids duplication** - Automatically checks last report and updates if same day

```bash
node scripts/submit_incremental_report.cjs
```

### Method 2: Manual Reporting
**Full control** - Always creates new report

```bash
node scripts/submit_report_env.cjs
```

---

## 📝 3-Step Process

### Step 1: Login
```javascript
POST {API_BASE_URL}/api/auth/login
Body: { "username": "your_username", "password": "your_password" }
```

---

## 🖥️ Localhost Walkthrough (Create + Update)

Follow these exact commands when you are working inside `D:\Github\reporting\Data-reporting` on your local machine.

1. **Start the app (in a new terminal):**
   ```bash
   npm run dev
   ```
2. **Create a report (uses the logged-in session cookie automatically):**
   ```bash
   node scripts/submit_report_env.cjs
   ```
3. **Update the most recent report (edit description or hours on localhost):**
   ```bash
   node scripts/submit_incremental_report.cjs --update
   ```

If you prefer raw HTTP calls against `http://localhost:3000`, use:

```bash
# Create
curl -X POST http://localhost:3000/api/reports ^
  -H "Content-Type: application/json" ^
  -H "Cookie: auth_token=<paste-from-login>" ^
  -d "{\"report_date\":\"2025-12-04\",\"work_description\":\"Initial summary\",\"hours_worked\":2.0,\"status\":\"submitted\"}"

# Update
curl -X PUT http://localhost:3000/api/reports/<report_id> ^
  -H "Content-Type: application/json" ^
  -H "Cookie: auth_token=<same-cookie>" ^
  -d "{\"work_description\":\"Updated summary with fixes\",\"hours_worked\":3.5}"
```

> ✅ Reminder: You must run `node scripts/test_connection.cjs` first if you have not confirmed database connectivity on this machine.
**Save the cookie from response!**

### Step 2: Create Report
```javascript
POST {API_BASE_URL}/api/reports
Cookie: auth_token=<from-step-1>
Body: {
  "report_date": "YYYY-MM-DD",
  "work_description": "markdown text",
  "hours_worked": number,
  "tasks_completed": "text",
  "status": "submitted"
}
```

### Step 3: Update Report (if needed)
```javascript
PUT {API_BASE_URL}/api/reports/{report_id}
Cookie: auth_token=<from-step-1>
Body: {
  "work_description": "updated text",
  "hours_worked": updated_number
}
```

---

## 🚀 Complete Working Script

**File:** `submit_agent_report.cjs`

```javascript
const http = require('http');
require('dotenv').config();

const API_URL = new URL(process.env.API_BASE_URL || 'http://localhost:3000');
let cookie = '';

function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_URL.hostname,
            port: API_URL.port || 3000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (cookie) options.headers['Cookie'] = cookie;

        const req = http.request(options, (res) => {
            let body = '';
            if (res.headers['set-cookie']) {
                cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
            }
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function submitReport() {
    // 1. Login
    const login = await request('POST', '/api/auth/login', {
        username: 'testuser',
        password: 'Test@123'
    });
    
    if (!login.data.success) {
        console.error('Login failed:', login.data.error);
        return;
    }

    // 2. Create Report
    const report = await request('POST', '/api/reports', {
        report_date: new Date().toISOString().split('T')[0],
        work_description: `# Your Work Report Here`,
        hours_worked: 2.5,
        tasks_completed: '1. Task one\n2. Task two',
        status: 'submitted'
    });
    
    if (report.data.success) {
        console.log('✅ Report created:', report.data.data.report_id);
        return report.data.data.report_id;
    }
}

submitReport();
```

---

## 📋 Required Fields

### Minimum Required
```json
{
  "report_date": "2025-12-03",
  "work_description": "Text description",
  "hours_worked": 2.5
}
```

### Recommended Fields
```json
{
  "report_date": "2025-12-03",
  "work_description": "# Title\n\nDetailed description...",
  "hours_worked": 2.5,
  "tasks_completed": "1. Task one\n2. Task two",
  "status": "submitted"
}
```

### All Available Fields
```json
{
  "report_date": "2025-12-03",
  "work_description": "markdown text",
  "hours_worked": 2.5,
  "tasks_completed": "list of tasks",
  "issues_found": "issues discovered",
  "issues_solved": "solutions implemented",
  "blockers": "current blockers",
  "notes": "additional notes",
  "status": "draft|submitted|reviewed",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "task_id": 123
}
```

---

## 📝 Report Template for Agents

```markdown
# Work Report - [Date]

## Summary
Brief overview of work completed

## Tasks Completed
1. Task 1 - Description
2. Task 2 - Description
3. Task 3 - Description

## Technical Details
- Files modified: [list]
- APIs updated: [list]
- Issues fixed: [list]

## Time Breakdown
- Category 1: X hours
- Category 2: Y hours
- Total: Z hours

## Results
✅ Achievement 1
✅ Achievement 2
✅ Achievement 3
```

---

## 🔍 Common Scenarios

### Scenario 1: Simple Report
```javascript
{
  report_date: "2025-12-03",
  work_description: "Fixed bug in login system",
  hours_worked: 2.0,
  status: "submitted"
}
```

### Scenario 2: Detailed Report
```javascript
{
  report_date: "2025-12-03",
  work_description: `# Bug Fix - Login System

## Problem
Users couldn't login with special characters

## Solution
- Updated validation regex
- Added character encoding
- Tested with 100+ test cases

## Files Modified
- pages/api/auth/login.ts
- lib/validation.ts`,
  hours_worked: 3.5,
  tasks_completed: "1. Fixed regex\n2. Updated tests\n3. Deployed fix",
  issues_found: "Special characters not encoded",
  issues_solved: "Added proper encoding",
  status: "submitted"
}
```

### Scenario 3: Update Existing Report
```javascript
// First create
const createRes = await request('POST', '/api/reports', reportData);
const reportId = createRes.data.data.report_id;

// Then update
await request('PUT', `/api/reports/${reportId}`, {
  work_description: "Updated description with more details",
  hours_worked: 4.0,
  notes: "Added more information after review"
});
```

---

## ⚠️ Important Notes

### Authentication
- Cookie expires after 7 days
- Re-login if you get 401 Unauthorized
- Cookie format: `auth_token=<jwt-token>`

### Data Types
- `hours_worked`: Number (e.g., 2.5)
- `report_date`: String "YYYY-MM-DD"
- `status`: String "draft"|"submitted"|"reviewed"
- `work_description`: String (supports Markdown)

### Error Handling
```javascript
if (!response.data.success) {
  console.error('Error:', response.data.error);
  // Handle error
}
```

---

## 🧪 Testing

### Test Your Setup
```bash
# Test connection
node scripts/test_connection.cjs

# Test report submission
node scripts/submit_report_env.cjs
```

### Verify Report Created
```javascript
// Get report by ID
const report = await request('GET', `/api/reports/${reportId}`);
console.log(report.data.data);
```

---

## 📊 Response Formats

### Successful Login
```json
{
  "success": true,
  "data": {
    "username": "testuser",
    "role": "programmer"
  }
}
```

### Successful Report Creation
```json
{
  "success": true,
  "data": {
    "report_id": 123,
    "user_id": 9,
    "report_date": "2025-12-03T00:00:00.000Z",
    "hours_worked": "2.50",
    "status": "submitted"
  },
  "message": "Report created successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## 🔄 Typical Workflow

```
1. Load environment (.env file)
   ↓
2. Login (POST /api/auth/login)
   ↓
3. Save cookie from response
   ↓
4. Create report (POST /api/reports)
   ↓
5. Get report_id from response
   ↓
6. [Optional] Update report (PUT /api/reports/{id})
   ↓
7. Done! Report in database
```

---

## 💡 Pro Tips for Agents

### 1. Use Markdown in Descriptions
```javascript
work_description: `# Main Title

## Section 1
Content here...

### Subsection
- Bullet 1
- Bullet 2

## Section 2
More content...`
```

### 2. Calculate Hours Automatically
```javascript
const start = new Date('2025-12-03T09:00:00');
const end = new Date('2025-12-03T17:30:00');
const hours = (end - start) / (1000 * 60 * 60); // 8.5
```

### 3. Batch Multiple Tasks
```javascript
const tasks = [
  'Task 1 description',
  'Task 2 description',
  'Task 3 description'
];
const tasks_completed = tasks.map((t, i) => `${i + 1}. ${t}`).join('\n');
```

### 4. Handle Errors Gracefully
```javascript
try {
  const res = await request('POST', '/api/reports', data);
  if (res.data.success) {
    return res.data.data.report_id;
  } else {
    console.error('Failed:', res.data.error);
    return null;
  }
} catch (error) {
  console.error('Network error:', error.message);
  return null;
}
```

---

## 🎯 Quick Reference

| Action | Method | Endpoint | Body Required |
|--------|--------|----------|---------------|
| Login | POST | /api/auth/login | username, password |
| Create Report | POST | /api/reports | report_date, work_description, hours_worked |
| Get Report | GET | /api/reports/{id} | None |
| Update Report | PUT | /api/reports/{id} | Any fields to update |
| List Reports | GET | /api/reports | None (optional: status, limit) |

---

## 📦 Ready-to-Use Scripts

### Location
```
scripts/submit_report_env.cjs        - Environment-aware submission
scripts/submit_session_report.cjs    - Comprehensive report
scripts/test_reports_hours.cjs       - Test reports API
```

### Usage
```bash
# Submit report using .env configuration
node scripts/submit_report_env.cjs

# Submit comprehensive session report
node scripts/submit_session_report.cjs
```

---

## ✅ Checklist for Agents

Before submitting:
- [ ] `.env` file configured with API_BASE_URL
- [ ] Valid credentials available
- [ ] Report date in YYYY-MM-DD format
- [ ] Hours as number (not string)
- [ ] Work description is meaningful
- [ ] Status set to "submitted" (not "draft")

After submitting:
- [ ] Check response.data.success === true
- [ ] Save report_id for future updates
- [ ] Verify report in database/web interface

---

## 🔗 Related Documentation

- **Full Guide:** `API_REPORT_SUBMISSION_GUIDE.md`
- **Environment Setup:** `ENV_CONFIGURATION_GUIDE.md`
- **Quick Start:** `QUICK_START_GUIDE.md`

---

## 📞 Support

### Test Everything Works
```bash
node scripts/test_connection.cjs
node scripts/submit_report_env.cjs
```

### Check Report Created
- Web: http://localhost:3000/reports
- API: GET http://localhost:3000/api/reports

---

## 🎉 Summary for Agents

### Option A: Smart Incremental (Recommended)
**Avoids duplication automatically**

```bash
node scripts/submit_incremental_report.cjs
```

**Behavior:**
- Checks last report
- If today → Updates existing (append new work)
- If different day → Creates new report
- No duplication!

### Option B: Manual Reporting
**3 Simple Steps:**
1. **Login** → Get cookie
2. **Create Report** → POST with data
3. **Done!** → Report in MySQL

**Minimum Code:**
```javascript
// 1. Login
const login = await request('POST', '/api/auth/login', { username, password });

// 2. Create
const report = await request('POST', '/api/reports', {
  report_date: '2025-12-03',
  work_description: 'Work done...',
  hours_worked: 2.5,
  status: 'submitted'
});

// 3. Done!
console.log('Report ID:', report.data.data.report_id);
```

**That's it! Your report is now in the database! 🚀**

---

## 🔄 Incremental Reporting Workflow

### How It Works:
```
1. Fetch user's last report
2. Check if report exists for TODAY
3. IF today → UPDATE existing (append work)
4. IF different day → CREATE new report
5. Result: No duplicate information!
```

### Example:
```
Morning (9 AM):
  → Creates Report #5 (2.5 hours)

Afternoon (2 PM):  
  → Updates Report #5 (total: 5.5 hours)
  → Appends afternoon work

Next Day:
  → Creates NEW Report #6
```

**Perfect for continuous work without duplication! 🎯**

---

**Last Updated:** December 3, 2025  
**Version:** 1.0.0  
**Status:** Ready for Agent Use

