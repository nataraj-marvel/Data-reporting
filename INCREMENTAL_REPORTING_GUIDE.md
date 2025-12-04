# Incremental Reporting Guide

**Purpose:** Create reports with only new work since last report - avoid duplication

**Last Updated:** December 3, 2025

---

## 🎯 Problem Statement

When working continuously, you don't want to repeat the same information in multiple reports. You need to:
- ✅ Report only NEW work completed
- ✅ Avoid duplicating previous reports
- ✅ Maintain accurate time tracking
- ✅ Keep clean, non-redundant records

---

## 💡 Solution: Incremental Reporting

### How It Works

```
1. Fetch user's last report
2. Check if report exists for today
3. If YES → Update existing report (append new work)
4. If NO → Create new report with only new work
```

---

## 🚀 Quick Start

### Step 1: Prepare Your New Work Data

```javascript
const newWork = {
    work_description: `# What I just completed
    
## Task Name
Details of NEW work only...`,
    
    hours_worked: 2.0,  // Only new hours
    
    tasks_completed: `1. New task 1
2. New task 2`,
    
    status: 'submitted'
};
```

### Step 2: Submit Incremental Report

```bash
node scripts/submit_incremental_report.cjs
```

---

## 📋 Script Behavior

### Scenario 1: No Report Today
**Action:** Creates NEW report with your work

```
Last Report: December 2, 2025
Today: December 3, 2025
→ Creates new report for Dec 3
```

### Scenario 2: Report Already Exists Today
**Action:** UPDATES existing report (appends new work)

```
Last Report: December 3, 2025 (same day)
Today: December 3, 2025
→ Updates existing report with:
  - Appended description
  - Added hours (cumulative)
  - Appended tasks
  - Timestamp of update
```

---

## 🔧 Complete Script

**File:** `scripts/submit_incremental_report.cjs`

### Key Functions

#### 1. Fetch Last Report
```javascript
const reports = await request('GET', '/api/reports?limit=1&page=1');
const lastReport = reports.data.data[0];
```

#### 2. Check Date
```javascript
const today = new Date().toISOString().split('T')[0];
const lastReportDate = new Date(lastReport.report_date).toISOString().split('T')[0];

if (lastReportDate === today) {
    // Update existing
} else {
    // Create new
}
```

#### 3. Create New Report
```javascript
async function createReport(workData) {
    const response = await request('POST', '/api/reports', {
        report_date: new Date().toISOString().split('T')[0],
        work_description: workData.work_description,
        hours_worked: workData.hours_worked,
        tasks_completed: workData.tasks_completed,
        status: 'submitted'
    });
    return response.data.data;
}
```

#### 4. Update Existing Report
```javascript
async function updateReport(lastReport, newWork) {
    const updated = await request('PUT', `/api/reports/${lastReport.report_id}`, {
        work_description: `${lastReport.work_description}

---

## Update - ${new Date().toLocaleTimeString()}

${newWork.work_description}`,
        
        hours_worked: parseFloat(lastReport.hours_worked) + parseFloat(newWork.hours_worked),
        
        tasks_completed: `${lastReport.tasks_completed}
${newWork.tasks_completed}`
    });
    return updated.data.data;
}
```

---

## 📝 Usage Examples

### Example 1: First Work of the Day
```javascript
const morningWork = {
    work_description: `# Morning Session

Fixed bug in authentication system`,
    hours_worked: 2.5,
    tasks_completed: '1. Fixed auth bug\n2. Added tests',
    status: 'submitted'
};

// Result: Creates new report for today
```

### Example 2: Additional Work Same Day
```javascript
const afternoonWork = {
    work_description: `# Afternoon Session

Implemented new feature`,
    hours_worked: 3.0,
    tasks_completed: '1. Created feature\n2. Updated docs',
    status: 'submitted'
};

// Result: Updates morning report with:
// - Appended afternoon description
// - Total hours: 2.5 + 3.0 = 5.5
// - Combined tasks list
```

### Example 3: Next Day
```javascript
const nextDayWork = {
    work_description: `# Bug Fix Session

Resolved production issue`,
    hours_worked: 1.5,
    tasks_completed: '1. Fixed bug\n2. Deployed fix',
    status: 'submitted'
};

// Result: Creates NEW report (different day)
```

---

## 🎨 Report Structure After Updates

### Initial Report (Morning)
```markdown
# Morning Session

Fixed authentication bug

Tasks:
1. Fixed auth bug
2. Added tests

Hours: 2.5
```

### After First Update (Afternoon)
```markdown
# Morning Session

Fixed authentication bug

Tasks:
1. Fixed auth bug
2. Added tests

---

## Update - 14:30:15

# Afternoon Session

Implemented new feature

Tasks:
1. Created feature
2. Updated docs

Total Hours: 5.5 (was 2.5, added 3.0)
```

---

## ⚙️ Configuration

### Environment Variables (.env)
```bash
API_BASE_URL=http://localhost:3000
API_USERNAME=testuser
API_PASSWORD=Test@123
```

### Customize Behavior

Edit `submit_incremental_report.cjs`:

```javascript
// Change update strategy
if (lastReportDate === today) {
    // Option 1: Update existing (default)
    return await updateReport(lastReport, newWork);
    
    // Option 2: Always create new
    // return await createReport(newWork);
}
```

---

## 🔍 What Gets Checked

### Before Creating Report:
1. ✅ User authenticated
2. ✅ Last report fetched
3. ✅ Date comparison performed
4. ✅ Duplication avoided

### Information Tracked:
- Last report ID
- Last report date
- Last report hours
- Last report tasks count

### Decision Made:
```
IF last_report_date == today:
    UPDATE existing report (append)
ELSE:
    CREATE new report
```

---

## 💡 Best Practices

### DO:
✅ Report only NEW work in each submission
✅ Use descriptive section headers (e.g., "Morning Session", "Bug Fix")
✅ Keep hours accurate for each session
✅ List only new tasks completed
✅ Let the script handle date checking
✅ Submit after each significant work session

### DON'T:
❌ Repeat work from previous reports
❌ Manually calculate cumulative hours (script does it)
❌ Include old tasks in new work data
❌ Submit empty reports
❌ Override date checks unless necessary

---

## 🧪 Testing

### Test 1: First Report of Day
```bash
# Should create new report
node scripts/submit_incremental_report.cjs
```

**Expected Output:**
```
✅ NEW REPORT CREATED!
   Report ID: #X
   Hours: 1.5
```

### Test 2: Second Report Same Day
```bash
# Should update existing report
node scripts/submit_incremental_report.cjs
```

**Expected Output:**
```
✅ EXISTING REPORT UPDATED!
   Report ID: #X (same as before)
   Total Hours: 3.0
   Added: +1.5 hours
```

### Test 3: Verify in Database
```bash
# Check report
curl http://localhost:3000/api/reports/X \
  -H "Cookie: auth_token=..." \
  | jq .
```

---

## 🔄 Workflow Diagram

```
START
  ↓
Login
  ↓
Fetch Last Report
  ↓
Check Date
  ↓
┌─────────────┐
│ Same Day?   │
└─────────────┘
  ↓        ↓
YES       NO
  ↓        ↓
UPDATE   CREATE
Report   Report
  ↓        ↓
Append   New
Work     Report
  ↓        ↓
Add      Fresh
Hours    Data
  ↓        ↓
DONE     DONE
```

---

## 📊 Comparison: Normal vs Incremental

### Normal Reporting
```javascript
// Always creates new report
POST /api/reports
{
  "report_date": "2025-12-03",
  "work_description": "All work for the day...",
  "hours_worked": 8.0,
  "status": "submitted"
}
```

### Incremental Reporting
```javascript
// Smart: checks last report
// Morning: Creates new
POST /api/reports { hours: 2.5 }

// Afternoon: Updates existing
PUT /api/reports/X { 
  hours: 5.5,  // 2.5 + 3.0
  description: "Morning work\n---\nAfternoon work"
}
```

---

## 🎯 Use Cases

### Use Case 1: Continuous Work
**Scenario:** Working 9 AM - 5 PM with breaks

```
9 AM:  Submit incremental report (2h)
       → Creates report #1

12 PM: Submit incremental report (3h)
       → Updates report #1 (total: 5h)

3 PM:  Submit incremental report (2h)
       → Updates report #1 (total: 7h)

5 PM:  Submit incremental report (1h)
       → Updates report #1 (total: 8h)
```

**Result:** One report with complete day's work

### Use Case 2: Multi-Day Project
**Scenario:** Working on project across multiple days

```
Day 1: Submit work
       → Creates report for Day 1

Day 2: Submit work
       → Creates NEW report for Day 2

Day 3: Submit work
       → Creates NEW report for Day 3
```

**Result:** Separate reports per day

### Use Case 3: AI Agent Continuous Reporting
**Scenario:** Agent working on tasks continuously

```
Agent submits after each task completion
Script automatically:
- Detects if report exists for today
- Updates if exists, creates if not
- Maintains accurate hours
- Avoids duplication
```

---

## 🔗 Integration with Other Scripts

### Can Be Called From:
- Other automation scripts
- CI/CD pipelines
- Scheduled tasks (cron)
- Webhook handlers
- Custom workflows

### Example Integration:
```javascript
const { submitIncrementalReport } = require('./submit_incremental_report.cjs');

// After completing task
const result = await submitIncrementalReport({
    work_description: 'Task completed',
    hours_worked: 1.0,
    tasks_completed: '1. Task name',
    status: 'submitted'
});

if (result) {
    console.log('Report updated:', result.report_id);
}
```

---

## 📞 Troubleshooting

### Issue: Always Creating New Reports
**Problem:** Script creates new report even on same day

**Solution:** Check date formatting
```javascript
// Ensure both use same format
const today = new Date().toISOString().split('T')[0];
const lastDate = new Date(lastReport.report_date).toISOString().split('T')[0];
```

### Issue: Hours Not Adding Up
**Problem:** Cumulative hours incorrect

**Solution:** Use parseFloat
```javascript
const total = parseFloat(lastReport.hours_worked) + parseFloat(newWork.hours_worked);
```

### Issue: Duplicate Content
**Problem:** Same work appearing twice

**Solution:** Only include NEW work in newWork object

---

## ✅ Summary

### For Agents:
1. ✅ Fetch last report
2. ✅ Check if today
3. ✅ Update if same day, create if different
4. ✅ Only report NEW work
5. ✅ No duplication!

### Benefits:
- 🎯 Clean, non-redundant reports
- 📊 Accurate time tracking
- 🔄 Automatic date handling
- 💾 Efficient database usage
- 📝 Professional reporting

**Perfect for continuous work tracking without duplication! 🚀**

---

**Last Updated:** December 3, 2025  
**Version:** 1.0.0  
**Status:** Production Ready

