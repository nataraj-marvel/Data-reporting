# Quick Start Guide - Nautilus Reporting System

**Last Updated:** December 3, 2025

---

## 🚀 Getting Started in 5 Minutes

### 1. Start the Server

```bash
cd D:\Github\reporting\Data-reporting
npm run dev
```

**Expected output:**
```
> MarvelQuant-reporting-system@1.0.0 dev
> next dev

ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 2. Open Browser

Navigate to: **http://localhost:3000**

### 3. Login

**Recommended Credentials:**
```
Username: testuser
Password: Test@123
```

**Or use admin:**
```
Username: admin
Password: admin123
```

### 4. Test Features

✅ **Reports:** Click "Reports" → Create/View/Edit reports  
✅ **Tasks:** Click "Tasks" → Create/View/Edit tasks  
✅ **Files:** Manage file versions  
✅ **Requests:** Track feature requests  
✅ **Prompts:** Manage AI prompts  

---

## 📊 Current System Status

### Database
- **Type:** MySQL (Local)
- **Host:** localhost:3306
- **Database:** nautilus_reporting
- **Status:** ✅ Connected

### API Endpoints
- **Reports API:** ✅ Working
- **Tasks API:** ✅ Working
- **Files API:** ✅ Working
- **Auth API:** ✅ Working

### Frontend Pages
- **All Pages:** ✅ Functional
- **Navigation:** ✅ Working
- **Forms:** ✅ Working

---

## 🔧 Common Tasks

### Create a Report

1. Click "Reports" in menu
2. Click "New Report" button
3. Fill in:
   - Report Date
   - Work Description
   - Hours Worked
   - Tasks Completed
4. Click "Create Report"

### Create a Task

1. Click "Tasks" in menu
2. Click "New Task" button
3. Fill in:
   - Task Title (required)
   - Description
   - Priority
   - Assigned To
4. Click "Create Task"

### View Reports

1. Go to Reports page
2. See summary stats:
   - Total Reports
   - Draft/Submitted/Reviewed counts
   - **Total Hours** (correctly calculated)
3. Click any report to view details
4. Click "Edit" to modify

---

## 💡 Tips

### Navigation
- Use the top menu to switch between sections
- Click logo to return to dashboard
- "New" buttons create new items

### Filtering
- Most list pages have filters
- Use status dropdowns to filter
- Click "Refresh" to reload data

### Editing
- Click any item in a list to view
- Click "Edit" button to modify
- Changes save immediately

---

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Kill existing process
taskkill /F /IM node.exe

# Restart
npm run dev
```

### Database Connection Error
```bash
# Check MySQL is running
services.msc
# Find "MySQL" and ensure it's started
```

### Login Issues
**Use these credentials:**
- Username: testuser
- Password: Test@123

---

## 📁 File Structure

```
Data-reporting/
├── pages/
│   ├── api/              # API endpoints
│   ├── reports/          # Reports pages
│   ├── tasks/            # Tasks pages
│   └── ...
├── types/                # TypeScript types
├── lib/                  # Utilities
├── scripts/              # Test scripts
└── docs/                 # Documentation
```

---

## 🔗 Important URLs

- **Application:** http://localhost:3000
- **Reports:** http://localhost:3000/reports
- **Tasks:** http://localhost:3000/tasks
- **Login:** http://localhost:3000

---

## ✅ What's Working

- ✅ User authentication
- ✅ Report creation and editing
- ✅ Task creation and editing
- ✅ Total hours calculation
- ✅ All CRUD operations
- ✅ File management
- ✅ Request tracking
- ✅ Prompt management

---

## 📞 Need Help?

### Check Documentation
- `COMPLETE_FIX_SUMMARY.md` - Full system documentation
- `LOGIN_CREDENTIALS.txt` - Login info
- `TASKS_FIXED.md` - Task-specific fixes

### Run Tests
```bash
# Test tasks
node scripts/test_tasks_api.cjs

# Test reports
node scripts/test_reports_hours.cjs

# Test database
node scripts/check_which_database.cjs
```

---

## 🎉 You're Ready!

The system is fully operational. Start by:
1. Creating a test report
2. Creating a test task
3. Exploring the different features

**Happy reporting! 🚀**

