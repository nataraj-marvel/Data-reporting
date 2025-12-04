# API Report Submission Guide

**Purpose:** Submit daily reports to MySQL database through API after completing work/prompts

**Last Updated:** December 3, 2025

---

## 📋 Overview

This guide explains how to create and update daily reports in the Nautilus Reporting System using API endpoints. Use this after completing any prompt, task, or work session to log your activities.

---

## 🔑 Authentication

All API requests require authentication. You must login first to get a session token.

### Configuration

Set your API URL in `.env` file:
```bash
API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**For production, change to your server URL:**
```bash
API_BASE_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Step 1: Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```javascript
POST {API_BASE_URL}/api/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "your_username",
    "role": "programmer",
    "full_name": "Your Name"
  }
}
```

**Important:** Save the `Set-Cookie` header from the response - you'll need it for subsequent requests.

---

## 📝 Creating a Report

### Step 2: Create Daily Report

**Endpoint:** `POST /api/reports`

**Request:**
```javascript
POST {API_BASE_URL}/api/reports
Content-Type: application/json
Cookie: auth_token=<your-token>

{
  "report_date": "2025-12-03",
  "work_description": "# Work Completed\n\n## Prompt/Task Title\nDetailed description of what was done...",
  "hours_worked": 2.5,
  "tasks_completed": "1. Task one\n2. Task two\n3. Task three",
  "issues_found": "Issue 1, Issue 2",
  "issues_solved": "Solution 1, Solution 2",
  "blockers": "No blockers",
  "notes": "Additional notes",
  "status": "submitted"
}
```

**Required Fields:**
- `report_date` - Date of work (YYYY-MM-DD)
- `work_description` - Detailed description (supports Markdown)
- `hours_worked` - Number of hours (decimal, e.g., 2.5)

**Optional Fields:**
- `tasks_completed` - List of completed tasks
- `issues_found` - Issues discovered
- `issues_solved` - Issues resolved  
- `blockers` - Current blockers
- `notes` - Additional notes
- `status` - "draft" or "submitted" (default: "draft")
- `start_time` - Work start time (HH:MM:SS)
- `end_time` - Work end time (HH:MM:SS)
- `task_id` - Related task ID

**Response:**
```json
{
  "success": true,
  "data": {
    "report_id": 8,
    "user_id": 2,
    "report_date": "2025-12-03T00:00:00.000Z",
    "work_description": "# Work Completed...",
    "hours_worked": "2.50",
    "status": "submitted",
    "created_at": "2025-12-03T14:30:00.000Z"
  },
  "message": "Report created successfully"
}
```

---

## ✏️ Updating a Report

### Step 3: Update Existing Report

**Endpoint:** `PUT /api/reports/{report_id}`

**Request:**
```javascript
PUT {API_BASE_URL}/api/reports/8
Content-Type: application/json
Cookie: auth_token=<your-token>

{
  "work_description": "# Updated Work Description\n\nAdded more details...",
  "hours_worked": 3.0,
  "tasks_completed": "1. Task one\n2. Task two\n3. Task three\n4. Task four",
  "notes": "Updated with additional information",
  "status": "submitted"
}
```

**Note:** You can update any fields. Only include fields you want to change.

**Response:**
```json
{
  "success": true,
  "data": {
    "report_id": 8,
    "work_description": "# Updated Work Description...",
    "hours_worked": "3.00",
    "updated_at": "2025-12-03T15:00:00.000Z"
  },
  "message": "Report updated successfully"
}
```

---

## 🔍 Viewing Reports

### Get Single Report

**Endpoint:** `GET /api/reports/{report_id}`

**Request:**
```javascript
GET {API_BASE_URL}/api/reports/8
Cookie: auth_token=<your-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report_id": 8,
    "user_id": 2,
    "report_date": "2025-12-03T00:00:00.000Z",
    "work_description": "# Work Completed...",
    "hours_worked": "3.00",
    "tasks_completed": "1. Task one\n2. Task two...",
    "status": "submitted",
    "created_at": "2025-12-03T14:30:00.000Z",
    "updated_at": "2025-12-03T15:00:00.000Z"
  }
}
```

### Get All Reports

**Endpoint:** `GET /api/reports`

**Request:**
```javascript
GET {API_BASE_URL}/api/reports?status=submitted&limit=10
Cookie: auth_token=<your-token>
```

**Query Parameters:**
- `status` - Filter by status (draft/submitted/reviewed)
- `limit` - Number of results (default: 20)
- `page` - Page number (default: 1)

---

## 💻 Complete Examples

### Example 1: Node.js Script

**File:** `submit_report.js`

```javascript
const http = require('http');
require('dotenv').config();

// Get API URL from environment
const API_URL = new URL(process.env.API_BASE_URL || 'http://localhost:3000');

let sessionCookie = '';

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_URL.hostname,
            port: API_URL.port || 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (sessionCookie) {
            options.headers['Cookie'] = sessionCookie;
        }

        const req = http.request(options, (res) => {
            let body = '';

            if (res.headers['set-cookie']) {
                sessionCookie = res.headers['set-cookie'][0].split(';')[0];
            }

            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(body)
                    });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function submitReport() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await makeRequest('POST', '/api/auth/login', {
            username: 'testuser',
            password: 'Test@123'
        });
        
        if (!loginRes.data.success) {
            console.error('Login failed:', loginRes.data.error);
            return;
        }
        console.log('✅ Login successful');

        // 2. Create Report
        console.log('\nCreating report...');
        const reportData = {
            report_date: new Date().toISOString().split('T')[0],
            work_description: `# Prompt Completion Report

## Prompt/Task
Database Schema Integration and API Fixes

## Work Completed
- Fixed SQL JOIN errors in tasks API
- Updated TypeScript interfaces
- Fixed frontend pages
- Tested all endpoints

## Technical Details
- Modified 5 files
- Fixed 3 SQL queries
- Updated 2 TypeScript types
- Created test scripts

## Results
✅ All tasks view/edit/create working
✅ API endpoints returning correct data
✅ Frontend displaying properly`,
            
            hours_worked: 2.5,
            
            tasks_completed: `1. Fixed tasks API (pages/api/tasks/index.ts)
2. Updated tasks detail API (pages/api/tasks/[id].ts)
3. Fixed file_versions JOIN query
4. Created test scripts
5. Verified all functionality`,
            
            issues_found: 'SQL column name mismatch, file_id vs file_version_id',
            issues_solved: 'Updated JOIN clause to use correct column name',
            blockers: 'None',
            notes: 'All endpoints tested and working correctly',
            status: 'submitted'
        };

        const createRes = await makeRequest('POST', '/api/reports', reportData);
        
        if (createRes.data.success) {
            console.log('✅ Report created successfully!');
            console.log(`   Report ID: ${createRes.data.data.report_id}`);
            console.log(`   Status: ${createRes.data.data.status}`);
            
            // 3. Update Report (if needed)
            console.log('\nUpdating report with additional info...');
            const updateRes = await makeRequest('PUT', `/api/reports/${createRes.data.data.report_id}`, {
                notes: 'Updated: All functionality verified and documented'
            });
            
            if (updateRes.data.success) {
                console.log('✅ Report updated successfully!');
            }
        } else {
            console.error('❌ Failed:', createRes.data.error);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

submitReport();
```

**Run:**
```bash
node submit_report.js
```

---

### Example 2: PowerShell Script

**File:** `submit_report.ps1`

```powershell
# Load configuration from .env
$envFile = Get-Content .env
$apiUrl = ($envFile | Select-String "API_BASE_URL=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
if (-not $apiUrl) { $apiUrl = "http://localhost:3000" }

# Configuration
$baseUrl = $apiUrl
$username = "testuser"
$password = "Test@123"

# Login
Write-Host "Logging in..." -ForegroundColor Cyan
$loginBody = @{
    username = $username
    password = $password
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody `
    -SessionVariable session

$loginData = $loginResponse.Content | ConvertFrom-Json

if ($loginData.success) {
    Write-Host "✅ Login successful" -ForegroundColor Green
    
    # Create Report
    Write-Host "`nCreating report..." -ForegroundColor Cyan
    
    $reportBody = @{
        report_date = (Get-Date -Format "yyyy-MM-dd")
        work_description = @"
# Prompt Completion Report

## Work Completed
Detailed description of work done...

## Technical Details
- Item 1
- Item 2
- Item 3
"@
        hours_worked = 2.5
        tasks_completed = "1. Task one`n2. Task two`n3. Task three"
        status = "submitted"
    } | ConvertTo-Json
    
    $reportResponse = Invoke-WebRequest -Uri "$baseUrl/api/reports" `
        -Method POST `
        -ContentType "application/json" `
        -Body $reportBody `
        -WebSession $session
    
    $reportData = $reportResponse.Content | ConvertFrom-Json
    
    if ($reportData.success) {
        Write-Host "✅ Report created successfully!" -ForegroundColor Green
        Write-Host "   Report ID: $($reportData.data.report_id)" -ForegroundColor White
    }
} else {
    Write-Host "❌ Login failed" -ForegroundColor Red
}
```

**Run:**
```powershell
.\submit_report.ps1
```

---

### Example 3: cURL Commands

**Load API URL from .env:**
```bash
# Linux/Mac
export API_URL=$(grep API_BASE_URL .env | cut -d '=' -f2)
# Or set manually
export API_URL="http://localhost:3000"

# Windows PowerShell
$env:API_URL = (Get-Content .env | Select-String "API_BASE_URL=(.+)").Matches.Groups[1].Value
```

**1. Login:**
```bash
curl -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test@123"}' \
  -c cookies.txt
```

**2. Create Report:**
```bash
curl -X POST $API_URL/api/reports \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "report_date": "2025-12-03",
    "work_description": "# Work Completed\n\nDetails...",
    "hours_worked": 2.5,
    "tasks_completed": "1. Task one\n2. Task two",
    "status": "submitted"
  }'
```

**3. Update Report:**
```bash
curl -X PUT $API_URL/api/reports/8 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "hours_worked": 3.0,
    "notes": "Updated information"
  }'
```

---

## 📋 Report Template

### Standard Report Format

```markdown
# Daily Work Report - [Date]

## Prompt/Task Completed
[Title of the prompt or task]

## Summary
Brief overview of what was accomplished

## Work Description

### Main Objectives
1. Objective 1
2. Objective 2
3. Objective 3

### Technical Implementation
- Technology/Framework used
- Key changes made
- Files modified

### Code Changes
- File 1: Description
- File 2: Description
- File 3: Description

## Tasks Completed
1. Task name - Description
2. Task name - Description
3. Task name - Description

## Issues Found
- Issue 1: Description
- Issue 2: Description

## Issues Solved
- Solution 1: How it was resolved
- Solution 2: How it was resolved

## Testing
- Test 1: Result
- Test 2: Result
- Test 3: Result

## Time Breakdown
- Research: X hours
- Development: X hours
- Testing: X hours
- Documentation: X hours
- **Total:** X hours

## Results
✅ Accomplishment 1
✅ Accomplishment 2
✅ Accomplishment 3

## Next Steps
- [ ] Follow-up task 1
- [ ] Follow-up task 2

## Notes
Additional observations or comments
```

---

## 🔄 Workflow

### After Completing Each Prompt:

1. **Gather Information:**
   - What was the prompt/task?
   - What did you accomplish?
   - How much time did it take?
   - What issues did you encounter?
   - What did you learn?

2. **Format the Report:**
   - Use the template above
   - Be specific and detailed
   - Include technical details
   - List all files modified

3. **Submit via API:**
   - Run your submission script
   - Verify report was created
   - Check report ID returned

4. **Update if Needed:**
   - Add more details later
   - Correct any errors
   - Update hours if needed

---

## ⚠️ Best Practices

### DO:
✅ Submit report immediately after completing work
✅ Be specific and detailed in descriptions
✅ Include actual hours worked
✅ List all tasks completed
✅ Document issues found and solved
✅ Use Markdown formatting for readability
✅ Set status to "submitted" when done

### DON'T:
❌ Wait too long to submit (details forgotten)
❌ Be vague or generic
❌ Estimate hours (be accurate)
❌ Skip documenting issues
❌ Leave status as "draft" indefinitely
❌ Submit without reviewing

---

## 🐛 Troubleshooting

### Login Failed (401)
**Problem:** Invalid credentials

**Solution:**
```bash
# Verify credentials
node scripts/test_connection.cjs

# Reset password if needed
node scripts/setup_admin.cjs
```

### Report Creation Failed (500)
**Problem:** Internal server error

**Solution:**
1. Check required fields are included
2. Verify hours_worked is a number
3. Check date format (YYYY-MM-DD)
4. Review server logs

### Cookie/Session Expired (401)
**Problem:** Session timed out

**Solution:**
Login again and get new session token

### Report Not Found (404)
**Problem:** Invalid report_id

**Solution:**
- Verify report_id exists
- Check you own the report
- Use GET /api/reports to list all reports

---

## 📊 Database Schema

Reports are stored in the `daily_reports` table:

```sql
CREATE TABLE daily_reports (
  report_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  report_date DATE NOT NULL,
  work_description TEXT,
  hours_worked DECIMAL(4,2),
  tasks_completed TEXT,
  blockers TEXT,
  notes TEXT,
  status ENUM('draft','submitted','reviewed'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP NULL,
  reviewed_at TIMESTAMP NULL,
  reviewed_by INT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  task_id INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);
```

---

## 🎯 Quick Reference

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/login | Authenticate |
| POST | /api/reports | Create report |
| GET | /api/reports | List reports |
| GET | /api/reports/{id} | Get one report |
| PUT | /api/reports/{id} | Update report |
| DELETE | /api/reports/{id} | Delete report |

### Required Fields

| Field | Type | Example |
|-------|------|---------|
| report_date | Date | "2025-12-03" |
| work_description | Text | "# Work done..." |
| hours_worked | Number | 2.5 |

### Status Values

- `draft` - Work in progress
- `submitted` - Ready for review
- `reviewed` - Reviewed by admin

---

## 📞 Support

### Test Your Setup
```bash
# Test database connection
node scripts/test_connection.cjs

# Test API endpoints
node scripts/test_reports_hours.cjs

# Test full workflow
node scripts/submit_report_testuser.cjs
```

### Documentation
- `COMPLETE_FIX_SUMMARY.md` - Technical documentation
- `QUICK_START_GUIDE.md` - Quick start
- `API_REPORT_SUBMISSION_GUIDE.md` - This file

---

## ✅ Summary

**After completing any prompt/task:**

1. ✅ Login via API
2. ✅ Format your report using template
3. ✅ Submit via POST /api/reports
4. ✅ Update if needed via PUT /api/reports/{id}
5. ✅ Verify submission via GET /api/reports/{id}

**Your work is now documented in MySQL and accessible via the web interface!** 🎉

---

**Last Updated:** December 3, 2025  
**Version:** 1.0.0  
**Status:** Production Ready

