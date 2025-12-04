-- ============================================================================
-- REMOTE DATABASE COMPATIBILITY FIX
-- Run this on your remote MySQL database to ensure compatibility
-- Date: December 3, 2025
-- ============================================================================

-- Check current database
SELECT DATABASE() as current_database;

-- ============================================================================
-- STEP 1: Verify existing table structures
-- ============================================================================

SHOW TABLES;

-- Check users table structure
DESCRIBE users;

-- Check daily_reports table structure
DESCRIBE daily_reports;

-- ============================================================================
-- STEP 2: Add missing indexes for performance (safe operation)
-- ============================================================================

-- Add index on report_date if not exists
CREATE INDEX IF NOT EXISTS idx_report_date ON daily_reports(report_date);

-- Add index on user_id if not exists
CREATE INDEX IF NOT EXISTS idx_user_id_reports ON daily_reports(user_id);

-- Add index on status if not exists
CREATE INDEX IF NOT EXISTS idx_status_reports ON daily_reports(status);

-- ============================================================================
-- STEP 3: Verify data integrity
-- ============================================================================

-- Check if all reports have valid user references
SELECT 
    COUNT(*) as orphaned_reports
FROM daily_reports dr
LEFT JOIN users u ON dr.user_id = u.id
WHERE u.id IS NULL;

-- If orphaned reports found, investigate
SELECT 
    dr.id,
    dr.user_id,
    dr.report_date
FROM daily_reports dr
LEFT JOIN users u ON dr.user_id = u.id
WHERE u.id IS NULL
LIMIT 10;

-- ============================================================================
-- STEP 4: Test JOIN queries
-- ============================================================================

-- Test the correct JOIN syntax
SELECT 
    dr.id,
    dr.report_date,
    dr.hours_worked,
    dr.status,
    u.id as user_id,
    u.username,
    u.full_name
FROM daily_reports dr
LEFT JOIN users u ON dr.user_id = u.id
ORDER BY dr.created_at DESC
LIMIT 5;

-- ============================================================================
-- STEP 5: Show final structure
-- ============================================================================

SELECT 
    'users' as table_name,
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_KEY,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;

SELECT 
    'daily_reports' as table_name,
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_KEY,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'daily_reports'
ORDER BY ORDINAL_POSITION;

-- ============================================================================
-- IMPORTANT NOTES:
-- ============================================================================
-- Your database should have:
--   users.id (PRIMARY KEY) - NOT user_id
--   daily_reports.id (PRIMARY KEY) - NOT report_id
--   daily_reports.user_id (FOREIGN KEY) - references users.id
--
-- Correct JOIN syntax:
--   LEFT JOIN users u ON dr.user_id = u.id
--
-- WRONG (this causes the error):
--   LEFT JOIN users u ON dr.user_id = u.user_id
-- ============================================================================

