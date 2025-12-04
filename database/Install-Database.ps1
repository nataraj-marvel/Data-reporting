# Database Installation Script for Nautilus Reporting System
# Run this from the Data-reporting directory

param(
    [string]$MySQLPath = "mysql",
    [string]$User = "root",
    [string]$Database = "nautilus_reporting"
)

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Nautilus Reporting System - Database Installer" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is available
Write-Host "🔍 Checking MySQL installation..." -ForegroundColor Yellow
$mysqlCheck = Get-Command $MySQLPath -ErrorAction SilentlyContinue

if (-not $mysqlCheck) {
    Write-Host ""
    Write-Host "❌ MySQL not found in PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  1. Add MySQL to your PATH environment variable"
    Write-Host "  2. Provide full path: .\Install-Database.ps1 -MySQLPath 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe'"
    Write-Host "  3. Use MySQL Workbench to run database\CLEAN_INSTALL.sql manually"
    Write-Host ""
    exit 1
}

Write-Host "✅ MySQL found: $($mysqlCheck.Source)" -ForegroundColor Green
Write-Host ""

# Check if SQL file exists
$sqlFile = Join-Path $PSScriptRoot "CLEAN_INSTALL.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ SQL file not found: $sqlFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you're running this script from the correct directory." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Found SQL installation script" -ForegroundColor Green
Write-Host ""

# Get MySQL password
Write-Host "🔐 MySQL Connection Details:" -ForegroundColor Yellow
Write-Host "   User: $User" -ForegroundColor White
Write-Host "   Database: $Database" -ForegroundColor White
Write-Host ""

$SecurePassword = Read-Host "Enter MySQL password for '$User'" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
$Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Test connection
Write-Host "🔌 Testing database connection..." -ForegroundColor Yellow

$testQuery = "SELECT VERSION();"
$env:MYSQL_PWD = $Password

try {
    $version = & $MySQLPath -u $User -e $testQuery 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Connection failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error: $version" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "  • MySQL service is running"
        Write-Host "  • Username is correct"
        Write-Host "  • Password is correct"
        Write-Host ""
        $env:MYSQL_PWD = $null
        exit 1
    }
    
    Write-Host "✅ Connected successfully!" -ForegroundColor Green
    Write-Host "   MySQL Version: $($version[1])" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ Connection test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    $env:MYSQL_PWD = $null
    exit 1
}

# Confirm installation
Write-Host "⚠️  WARNING:" -ForegroundColor Yellow -BackgroundColor Black
Write-Host "   This will DROP and RECREATE all tables in '$Database'!" -ForegroundColor Yellow
Write-Host "   All existing data will be LOST!" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Do you want to continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host ""
    Write-Host "❌ Installation cancelled." -ForegroundColor Yellow
    Write-Host ""
    $env:MYSQL_PWD = $null
    exit 0
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Run installation
Write-Host "🚀 Installing database..." -ForegroundColor Yellow
Write-Host ""

try {
    $result = & $MySQLPath -u $User --verbose < $sqlFile 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Installation failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error output:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        Write-Host ""
        $env:MYSQL_PWD = $null
        exit 1
    }
    
    Write-Host "✅ Database installation completed successfully!" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    $env:MYSQL_PWD = $null
    exit 1
}

# Verify installation
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 Verifying installation..." -ForegroundColor Yellow
Write-Host ""

$verifyQuery = "USE $Database; SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = '$Database' AND table_type = 'BASE TABLE';"

try {
    $tableCount = & $MySQLPath -u $User -e $verifyQuery 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $count = $tableCount[1] -replace '\s+', ''
        Write-Host "✅ Tables created: $count" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not verify table count" -ForegroundColor Yellow
}

# Check admin user
$checkAdmin = "USE $Database; SELECT user_id, username, role FROM users WHERE username = 'admin';"

try {
    $adminCheck = & $MySQLPath -u $User -e $checkAdmin 2>&1
    
    if ($LASTEXITCODE -eq 0 -and $adminCheck.Count -gt 1) {
        Write-Host "✅ Admin user created successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not verify admin user" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║          ✅ INSTALLATION COMPLETED SUCCESSFULLY!         ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Installation Summary:" -ForegroundColor Cyan
Write-Host "   Database: $Database" -ForegroundColor White
Write-Host "   Tables: 13 core tables + relationship tables" -ForegroundColor White
Write-Host "   Views: 4 dashboard views" -ForegroundColor White
Write-Host "   Default User: admin" -ForegroundColor White
Write-Host "   Default Password: admin123" -ForegroundColor White
Write-Host ""

Write-Host "🔐 Default Login Credentials:" -ForegroundColor Yellow
Write-Host "   ═══════════════════════════════════════" -ForegroundColor Gray
Write-Host "   Username: admin" -ForegroundColor Cyan
Write-Host "   Password: admin123" -ForegroundColor Cyan
Write-Host "   ═══════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️  IMPORTANT:" -ForegroundColor Red
Write-Host "   Change the admin password after first login!" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Update .env file with database credentials" -ForegroundColor White
Write-Host "   2. Run: npm run dev" -ForegroundColor White
Write-Host "   3. Open: http://localhost:3000/login" -ForegroundColor White
Write-Host "   4. Login with admin/admin123" -ForegroundColor White
Write-Host "   5. Change admin password" -ForegroundColor White
Write-Host ""

# Clean up
$env:MYSQL_PWD = $null

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

