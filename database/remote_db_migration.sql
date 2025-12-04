-- ============================================================================
-- Remote Database Migration Script
-- Purpose: Add essential columns to existing schema for compatibility
-- Date: December 3, 2025
-- ============================================================================

-- Check current database
SELECT DATABASE();

-- ============================================================================
-- 1. Add missing columns to users table (if needed)
-- ============================================================================

-- Add username if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE AFTER user_id;

-- Add role if not exists  
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role ENUM('admin', 'manager', 'programmer') DEFAULT 'programmer' AFTER email;

-- Add timestamps if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER role,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- ============================================================================
-- 2. Check existing daily_reports structure
-- ============================================================================

DESCRIBE daily_reports;

-- ============================================================================
-- 3. Add missing indexes for performance
-- ============================================================================

-- Add index on report_date for faster queries
CREATE INDEX IF NOT EXISTS idx_report_date ON daily_reports(report_date);

-- Add index on user_id for faster joins
CREATE INDEX IF NOT EXISTS idx_user_id ON daily_reports(user_id);

-- ============================================================================
-- 4. Verify the changes
-- ============================================================================

SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_KEY
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('users', 'daily_reports')
ORDER BY 
    TABLE_NAME, ORDINAL_POSITION;

-- ============================================================================
-- 5. Test a simple query
-- ============================================================================

SELECT 
    r.*, 
    u.full_name
FROM 
    daily_reports r
LEFT JOIN 
    users u ON r.user_id = u.user_id
LIMIT 5;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

