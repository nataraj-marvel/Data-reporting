# Report API Testing Commands

## Prerequisites
- Server is running on `http://localhost:3000`
- You have valid credentials (admin/admin123 or your user credentials)

## Step 1: Login and Get Auth Token

```powershell
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"username":"admin","password":"admin123"}' `
    -SessionVariable session

$loginData = $loginResponse.Content | ConvertFrom-Json
Write-Host "Login successful! User: $($loginData.data.username)"

# Store session for subsequent requests
```

## Step 2: Create a New Report

```powershell
$reportData = @{
    report_date = (Get-Date -Format "yyyy-MM-dd")
    start_time = "09:00"
    end_time = "12:00"
    work_description = "Fixed database schema integration issues and updated TypeScript types"
    hours_worked = 3.0
    tasks_completed = "- Updated TypeScript types to match database schema\n- Fixed SQL queries in API endpoints\n- Updated frontend pages to use proper column names"
    blockers = "None"
    notes = "All schema integration work completed successfully"
    status = "draft"
}

$createResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/reports" `
    -Method POST `
    -ContentType "application/json" `
    -Body ($reportData | ConvertTo-Json) `
    -WebSession $session

$reportResult = $createResponse.Content | ConvertFrom-Json
$reportId = $reportResult.data.report_id
Write-Host "Report created! ID: $reportId"
```

## Step 3: Get the Report

```powershell
$getResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/reports/$reportId" `
    -Method GET `
    -WebSession $session

$report = ($getResponse.Content | ConvertFrom-Json).data
Write-Host "Report retrieved:"
Write-Host "  Date: $($report.report_date)"
Write-Host "  Hours: $($report.hours_worked)"
Write-Host "  Status: $($report.status)"
```

## Step 4: Update the Report

```powershell
$updateData = @{
    work_description = "Fixed database schema integration issues, updated TypeScript types, and created comprehensive documentation"
    hours_worked = 4.5
    tasks_completed = "- Updated TypeScript types to match database schema\n- Fixed SQL queries in API endpoints\n- Updated frontend pages to use proper column names\n- Created comprehensive documentation"
    notes = "All schema integration work completed successfully. Added API testing documentation."
    status = "submitted"
}

$updateResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/reports/$reportId" `
    -Method PUT `
    -ContentType "application/json" `
    -Body ($updateData | ConvertTo-Json) `
    -WebSession $session

$updatedReport = ($updateResponse.Content | ConvertFrom-Json).data
Write-Host "Report updated:"
Write-Host "  Hours: $($updatedReport.hours_worked)"
Write-Host "  Status: $($updatedReport.status)"
```

## Step 5: Get All Reports

```powershell
$listResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/reports?page=1&limit=5" `
    -Method GET `
    -WebSession $session

$listResult = $listResponse.Content | ConvertFrom-Json
Write-Host "Total reports: $($listResult.pagination.total)"
$listResult.data | ForEach-Object {
    Write-Host "  - ID: $($_.report_id) | Date: $($_.report_date) | Hours: $($_.hours_worked) | Status: $($_.status)"
}
```

## All-in-One Script

Run all commands together:

```powershell
# Login
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}' -SessionVariable session
$loginData = $loginResponse.Content | ConvertFrom-Json
Write-Host "`n✅ Login successful! User: $($loginData.data.username)" -ForegroundColor Green

# Create Report
$reportData = @{
    report_date = (Get-Date -Format "yyyy-MM-dd")
    start_time = "09:00"
    end_time = "12:00"
    work_description = "Fixed database schema integration issues and updated TypeScript types"
    hours_worked = 3.0
    tasks_completed = "- Updated TypeScript types\n- Fixed SQL queries\n- Updated frontend pages"
    blockers = "None"
    notes = "Schema integration completed"
    status = "draft"
}
$createResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/reports" -Method POST -ContentType "application/json" -Body ($reportData | ConvertTo-Json) -WebSession $session
$reportResult = $createResponse.Content | ConvertFrom-Json
$reportId = $reportResult.data.report_id
Write-Host "`n✅ Report created! ID: $reportId" -ForegroundColor Green

# Get Report
$getResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/reports/$reportId" -Method GET -WebSession $session
$report = ($getResponse.Content | ConvertFrom-Json).data
Write-Host "`n📊 Report Details:" -ForegroundColor Cyan
Write-Host "  Date: $($report.report_date)"
Write-Host "  Hours: $($report.hours_worked)"
Write-Host "  Status: $($report.status)"

# Update Report
$updateData = @{
    work_description = "Fixed database schema integration issues, updated TypeScript types, and created documentation"
    hours_worked = 4.5
    status = "submitted"
}
$updateResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/reports/$reportId" -Method PUT -ContentType "application/json" -Body ($updateData | ConvertTo-Json) -WebSession $session
$updatedReport = ($updateResponse.Content | ConvertFrom-Json).data
Write-Host "`n✅ Report updated!" -ForegroundColor Green
Write-Host "  Hours: $($updatedReport.hours_worked)"
Write-Host "  Status: $($updatedReport.status)"

# List Reports
$listResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/reports?page=1&limit=5" -Method GET -WebSession $session
$listResult = $listResponse.Content | ConvertFrom-Json
Write-Host "`n📋 All Reports (Total: $($listResult.pagination.total)):" -ForegroundColor Cyan
$listResult.data | ForEach-Object {
    Write-Host "  - ID: $($_.report_id) | Date: $($_.report_date) | Hours: $($_.hours_worked) | Status: $($_.status)"
}

Write-Host "`n🎉 All tests completed! View in browser: http://localhost:3000/reports/$reportId" -ForegroundColor Green
```

## Using Browser Console

You can also test directly in the browser console (press F12):

```javascript
// Login
const login = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
});
const loginData = await login.json();
console.log('Login:', loginData);

// Create Report
const create = await fetch('/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    report_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '12:00',
    work_description: 'Testing API from browser console',
    hours_worked: 3.0,
    tasks_completed: 'Created test report',
    status: 'draft'
  })
});
const createData = await create.json();
console.log('Created:', createData);
const reportId = createData.data.report_id;

// Get Report
const get = await fetch(`/api/reports/${reportId}`);
const getData = await get.json();
console.log('Report:', getData);

// Update Report
const update = await fetch(`/api/reports/${reportId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    hours_worked: 4.5,
    status: 'submitted'
  })
});
const updateData = await update.json();
console.log('Updated:', updateData);
```

## Expected Response Formats

### Login Response
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "admin",
    "role": "admin",
    "full_name": "System Administrator",
    "email": "admin@nautilus.local"
  }
}
```

### Create Report Response
```json
{
  "success": true,
  "data": {
    "report_id": 123,
    "user_id": 1,
    "report_date": "2025-12-03",
    "start_time": "09:00:00",
    "end_time": "12:00:00",
    "work_description": "...",
    "hours_worked": "3.00",
    "tasks_completed": "...",
    "blockers": "None",
    "notes": "...",
    "status": "draft",
    "created_at": "2025-12-03T...",
    "updated_at": "2025-12-03T...",
    "submitted_at": null,
    "reviewed_at": null,
    "reviewed_by": null
  },
  "message": "Report created successfully"
}
```

### Update Report Response
```json
{
  "success": true,
  "data": {
    "report_id": 123,
    "user_id": 1,
    "report_date": "2025-12-03",
    "hours_worked": "4.50",
    "status": "submitted",
    "submitted_at": "2025-12-03T...",
    ...
  },
  "message": "Report updated successfully"
}
```

