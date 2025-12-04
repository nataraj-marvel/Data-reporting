# Fix All System Issues Script
# Applies FIX_ALL_ISSUES.sql to database

Write-Host "`n══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔧 FIXING ALL SYSTEM ISSUES" -ForegroundColor Green
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL Workbench is better option
Write-Host "⚠️  This script will fix:" -ForegroundColor Yellow
Write-Host "   • 4 broken views" -ForegroundColor White
Write-Host "   • file_versions table" -ForegroundColor White
Write-Host ""

Write-Host "📋 Choose installation method:" -ForegroundColor Cyan
Write-Host "   1. MySQL Workbench (Recommended)" -ForegroundColor Green
Write-Host "   2. Command line (requires mysql in PATH)" -ForegroundColor Yellow
Write-Host ""

$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "✅ Using MySQL Workbench:" -ForegroundColor Green
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor Cyan
    Write-Host "  1. Open MySQL Workbench" -ForegroundColor White
    Write-Host "  2. Connect to your database" -ForegroundColor White
    Write-Host "  3. File → Open SQL Script" -ForegroundColor White
    Write-Host "  4. Select: database\FIX_ALL_ISSUES.sql" -ForegroundColor Yellow
    Write-Host "  5. Click Execute (⚡ lightning bolt)" -ForegroundColor White
    Write-Host "  6. Check output for success messages" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to open file location..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Open file location
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    explorer $scriptPath
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "🔌 Attempting command line execution..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check if mysql is available
    $mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
    
    if (-not $mysqlPath) {
        Write-Host "❌ MySQL not found in PATH!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please use MySQL Workbench instead (option 1)" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
    
    # Get password
    $SecurePassword = Read-Host "Enter MySQL root password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    $env:MYSQL_PWD = $Password
    
    Write-Host ""
    Write-Host "🚀 Executing fix script..." -ForegroundColor Yellow
    Write-Host ""
    
    $scriptPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "FIX_ALL_ISSUES.sql"
    
    try {
        & mysql -u root < $scriptPath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Green
            Write-Host "  ✅ ALL FIXES APPLIED SUCCESSFULLY!" -ForegroundColor Green
            Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "❌ Fix script failed!" -ForegroundColor Red
            Write-Host ""
            Write-Host "Try using MySQL Workbench instead." -ForegroundColor Yellow
            Write-Host ""
        }
    } catch {
        Write-Host ""
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    } finally {
        $env:MYSQL_PWD = $null
    }
    
} else {
    Write-Host ""
    Write-Host "❌ Invalid choice. Exiting." -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

