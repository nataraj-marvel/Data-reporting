# PowerShell script to fix SQL queries across all API files

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   FIXING SQL QUERIES - v2.0 Column Names                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$files = @(
    "pages\api\tasks\[id].ts",
    "pages\api\prompts\index.ts",
    "pages\api\prompts\[id].ts",
    "pages\api\requests\index.ts",
    "pages\api\requests\[id].ts",
    "pages\api\files\index.ts",
    "pages\api\files\[id].ts"
)

$replacements = @(
    # users table aliases
    @{Pattern = '\bu\.id\b'; Replacement = 'u.user_id'; Description = 'users.id → users.user_id'},
    @{Pattern = '\bu_creator\.id\b'; Replacement = 'u_creator.user_id'; Description = 'u_creator.id → u_creator.user_id'},
    @{Pattern = '\bu_assigned\.id\b'; Replacement = 'u_assigned.user_id'; Description = 'u_assigned.id → u_assigned.user_id'},
    @{Pattern = '\bcreator\.id\b'; Replacement = 'creator.user_id'; Description = 'creator.id → creator.user_id'},
    @{Pattern = '\bassignee\.id\b'; Replacement = 'assignee.user_id'; Description = 'assignee.id → assignee.user_id'},
    
    # tasks table aliases  
    @{Pattern = '\bt\.id\b'; Replacement = 't.task_id'; Description = 'tasks.id → tasks.task_id'},
    @{Pattern = '\bpt\.id\b'; Replacement = 'pt.task_id'; Description = 'parent_task.id → parent_task.task_id'},
    
    # daily_reports table
    @{Pattern = '\bdr\.id\b'; Replacement = 'dr.report_id'; Description = 'daily_reports.id → daily_reports.report_id'},
    
    # requests table - be careful with JOIN clauses
    @{Pattern = 'ON r\.id = t\.request_id'; Replacement = 'ON r.request_id = t.request_id'; Description = 'requests.id → requests.request_id in JOIN'},
    @{Pattern = '\br\.id\b(?! =)'; Replacement = 'r.request_id'; Description = 'requests.id → requests.request_id'},
    
    # issues table
    @{Pattern = '\bi\.id\b'; Replacement = 'i.issue_id'; Description = 'issues.id → issues.issue_id'},
    
    # ai_prompts table
    @{Pattern = '\bp\.id\b'; Replacement = 'p.prompt_id'; Description = 'ai_prompts.id → ai_prompts.prompt_id'},
    @{Pattern = '\bap\.id\b'; Replacement = 'ap.prompt_id'; Description = 'ai_prompts.id → ai_prompts.prompt_id'},
    
    # problems_solved table
    @{Pattern = '\bps\.id\b'; Replacement = 'ps.solution_id'; Description = 'problems_solved.id → problems_solved.solution_id'},
    
    # file_versions table
    @{Pattern = '\bfv\.id\b'; Replacement = 'fv.file_version_id'; Description = 'file_versions.id → file_versions.file_version_id'},
    @{Pattern = '\bprev\.id\b'; Replacement = 'prev.file_version_id'; Description = 'previous_version.id → previous_version.file_version_id'}
)

$totalFixed = 0

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot "..\$file"
    
    if (Test-Path $fullPath) {
        Write-Host "📄 Processing $file..." -ForegroundColor Yellow
        
        $content = Get-Content $fullPath -Raw
        $originalContent = $content
        $fileChangeCount = 0
        
        foreach ($replacement in $replacements) {
            $before = $content
            $content = $content -replace $replacement.Pattern, $replacement.Replacement
            
            if ($before -ne $content) {
                $changeCount = ([regex]::Matches($before, $replacement.Pattern)).Count
                if ($changeCount -gt 0) {
                    Write-Host "   ✓ $($replacement.Description) ($changeCount replacements)" -ForegroundColor Green
                    $fileChangeCount += $changeCount
                }
            }
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $fullPath -Value $content -NoNewline
            Write-Host "   ✅ Saved $fileChangeCount changes to $file`n" -ForegroundColor Green
            $totalFixed += $fileChangeCount
        } else {
            Write-Host "   ℹ️  No changes needed`n" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  File not found: $file`n" -ForegroundColor Red
    }
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ✅ COMPLETED!                                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
Write-Host "📊 Total replacements: $totalFixed" -ForegroundColor Green
Write-Host "💡 Restart your Next.js server to apply changes`n" -ForegroundColor Yellow

