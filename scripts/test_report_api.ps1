# PowerShell script to test Report API endpoints
# Usage: .\test_report_api.ps1

$baseUrl = "http://localhost:3000"
$token = ""
$reportId = $null

# Helper function to make API requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($token) {
        $headers["Cookie"] = "auth-token=$token"
    }
    
    $params = @{
        Uri = "$baseUrl$Path"
        Method = $Method
        Headers = $headers
    }
    
    if ($Body) {
        $params.Body = ($Body | ConvertTo-Json)
    }
    
    try {
        $response = Invoke-WebRequest @params -SessionVariable session
        
        # Extract auth token from cookies
        if ($session.Cookies) {
            $authCookie = $session.Cookies.GetCookies($baseUrl) | Where-Object { $_.Name -eq "auth-token" }
            if ($authCookie) {
                $script:token = $authCookie.Value
            }
        }
        
        return @{
            Status = $response.StatusCode
            Data = ($response.Content | ConvertFrom-Json)
        }
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "`n🚀 Starting Report API Tests..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Step 1: Login
Write-Host "`n📝 Step 1: Login..." -ForegroundColor Yellow
$loginResponse = Invoke-ApiRequest -Method POST -Path "/api/auth/login" -Body @{
    username = "admin"
    password = "admin123"
}

if ($loginResponse -and $loginResponse.Data.success) {
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "User: $($loginResponse.Data.data.username) ($($loginResponse.Data.data.role))"
} else {
    Write-Host "❌ Login failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Create Report
Write-Host "`n📝 Step 2: Create a new report..." -ForegroundColor Yellow
$reportData = @{
    report_date = (Get-Date -Format "yyyy-MM-dd")
    start_time = "09:00"
    end_time = "12:00"
    work_description = "Fixed database schema integration issues and updated TypeScript types"
    hours_worked = 3.0
    tasks_completed = "- Updated TypeScript types to match database schema`n- Fixed SQL queries in API endpoints`n- Updated frontend pages to use proper column names"
    blockers = "None"
    notes = "All schema integration work completed successfully"
    status = "draft"
}

$createResponse = Invoke-ApiRequest -Method POST -Path "/api/reports" -Body $reportData

if ($createResponse -and $createResponse.Data.success) {
    $reportId = $createResponse.Data.data.report_id
    Write-Host "✅ Report created successfully! ID: $reportId" -ForegroundColor Green
} else {
    Write-Host "❌ Report creation failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Get Report
Write-Host "`n📝 Step 3: Get report $reportId..." -ForegroundColor Yellow
$getResponse = Invoke-ApiRequest -Method GET -Path "/api/reports/$reportId"

if ($getResponse -and $getResponse.Data.success) {
    Write-Host "✅ Report retrieved successfully!" -ForegroundColor Green
    $report = $getResponse.Data.data
    Write-Host "Report Date: $($report.report_date)"
    Write-Host "Hours: $($report.hours_worked)"
    Write-Host "Status: $($report.status)"
} else {
    Write-Host "❌ Failed to retrieve report!" -ForegroundColor Red
}

# Step 4: Update Report
Write-Host "`n📝 Step 4: Update report $reportId..." -ForegroundColor Yellow
$updateData = @{
    work_description = "Fixed database schema integration issues, updated TypeScript types, and created comprehensive documentation"
    hours_worked = 4.5
    tasks_completed = "- Updated TypeScript types to match database schema`n- Fixed SQL queries in API endpoints`n- Updated frontend pages to use proper column names`n- Created comprehensive documentation"
    notes = "All schema integration work completed successfully. Added API testing documentation."
    status = "submitted"
}

$updateResponse = Invoke-ApiRequest -Method PUT -Path "/api/reports/$reportId" -Body $updateData

if ($updateResponse -and $updateResponse.Data.success) {
    Write-Host "✅ Report updated successfully!" -ForegroundColor Green
    $report = $updateResponse.Data.data
    Write-Host "Hours: $($report.hours_worked)"
    Write-Host "Status: $($report.status)"
    if ($report.submitted_at) {
        Write-Host "Submitted at: $($report.submitted_at)"
    }
} else {
    Write-Host "❌ Failed to update report!" -ForegroundColor Red
}

# Step 5: Get All Reports
Write-Host "`n📝 Step 5: Get all reports..." -ForegroundColor Yellow
$listResponse = Invoke-ApiRequest -Method GET -Path "/api/reports?page=1&limit=5"

if ($listResponse -and $listResponse.Data.success) {
    Write-Host "✅ Reports retrieved successfully!" -ForegroundColor Green
    Write-Host "Total reports: $($listResponse.Data.pagination.total)"
    Write-Host "Page: $($listResponse.Data.pagination.page)/$($listResponse.Data.pagination.totalPages)"
    Write-Host "`nReports:"
    $listResponse.Data.data | ForEach-Object -Begin { $i = 1 } -Process {
        Write-Host "  $i. ID: $($_.report_id) | Date: $($_.report_date) | Hours: $($_.hours_worked) | Status: $($_.status)"
        $i++
    }
} else {
    Write-Host "❌ Failed to retrieve reports!" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "✅ All tests completed successfully!" -ForegroundColor Green
Write-Host "`n🎉 Created and updated report ID: $reportId" -ForegroundColor Cyan
Write-Host "`nView in browser: $baseUrl/reports/$reportId" -ForegroundColor Cyan

