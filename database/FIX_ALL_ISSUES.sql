-- ============================================================================
-- FIX ALL SYSTEM ISSUES
-- Fixes broken views and schema mismatches
-- Date: December 3, 2025
-- ============================================================================

USE nautilus_reporting;

-- ============================================================================
-- STEP 1: Drop existing broken views
-- ============================================================================

DROP VIEW IF EXISTS v_file_activity;
DROP VIEW IF EXISTS v_prompt_activity;
DROP VIEW IF EXISTS v_request_pipeline;
DROP VIEW IF EXISTS v_task_dashboard;

-- ============================================================================
-- STEP 2: Fix file_versions table (add file_name as computed column)
-- ============================================================================

-- Add file_name column if it doesn't exist (extracted from file_path)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'nautilus_reporting' 
    AND TABLE_NAME = 'file_versions' 
    AND COLUMN_NAME = 'file_name');

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE file_versions ADD COLUMN file_name VARCHAR(255) AS (
        CASE 
            WHEN file_path LIKE "%/%" THEN SUBSTRING_INDEX(file_path, "/", -1)
            WHEN file_path LIKE "%\\\\%" THEN SUBSTRING_INDEX(file_path, "\\\\", -1)
            ELSE file_path
        END
    ) STORED',
    'SELECT "Column file_name already exists" AS status');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- STEP 3: Recreate v_task_dashboard view
-- ============================================================================

CREATE OR REPLACE VIEW v_task_dashboard AS
SELECT 
    t.task_id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.task_type,
    t.completion_percentage,
    t.estimated_hours,
    t.actual_hours,
    t.due_date,
    u_creator.username as created_by,
    u_creator.full_name as creator_name,
    u_assigned.username as assigned_to_username,
    u_assigned.full_name as assigned_to_name,
    dr.report_date,
    r.title as request_title,
    i.title as issue_title,
    t.created_at,
    t.updated_at,
    COALESCE((SELECT COUNT(*) FROM task_files tf WHERE tf.task_id = t.task_id), 0) as files_count
FROM tasks t
LEFT JOIN users u_creator ON t.user_id = u_creator.user_id
LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.user_id
LEFT JOIN daily_reports dr ON t.report_id = dr.report_id
LEFT JOIN requests r ON t.request_id = r.request_id
LEFT JOIN issues i ON t.issue_id = i.issue_id;

-- ============================================================================
-- STEP 4: Recreate v_request_pipeline view
-- ============================================================================

CREATE OR REPLACE VIEW v_request_pipeline AS
SELECT 
    r.request_id,
    r.title,
    r.description,
    r.request_type,
    r.status,
    r.priority,
    u_creator.username as created_by,
    u_creator.full_name as creator_name,
    u_assigned.username as assigned_to_username,
    u_assigned.full_name as assigned_to_name,
    COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.request_id = r.request_id), 0) as task_count,
    COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.request_id = r.request_id AND t.status = 'completed'), 0) as completed_tasks,
    r.estimated_hours,
    r.actual_hours,
    r.due_date,
    r.created_at,
    r.updated_at
FROM requests r
LEFT JOIN users u_creator ON r.user_id = u_creator.user_id
LEFT JOIN users u_assigned ON r.assigned_to = u_assigned.user_id;

-- ============================================================================
-- STEP 5: Recreate v_prompt_activity view
-- ============================================================================

CREATE OR REPLACE VIEW v_prompt_activity AS
SELECT 
    p.prompt_id,
    p.prompt_text,
    p.ai_model,
    p.category,
    p.effectiveness_rating,
    p.tokens_used,
    u.username,
    u.full_name,
    COALESCE((SELECT COUNT(*) FROM prompt_files pf WHERE pf.prompt_id = p.prompt_id), 0) as files_affected,
    p.created_at
FROM ai_prompts p
LEFT JOIN users u ON p.user_id = u.user_id;

-- ============================================================================
-- STEP 6: Recreate v_file_activity view
-- ============================================================================

CREATE OR REPLACE VIEW v_file_activity AS
SELECT 
    fv.file_version_id,
    fv.file_path,
    CASE 
        WHEN fv.file_path LIKE '%/%' THEN SUBSTRING_INDEX(fv.file_path, '/', -1)
        WHEN fv.file_path LIKE '%\\%' THEN SUBSTRING_INDEX(fv.file_path, '\\', -1)
        ELSE fv.file_path
    END as file_name,
    fv.version_number,
    fv.change_type,
    fv.lines_added,
    fv.lines_deleted,
    u.username,
    u.full_name,
    fv.created_at
FROM file_versions fv
LEFT JOIN users u ON fv.user_id = u.user_id;

-- ============================================================================
-- STEP 7: Verify all views work
-- ============================================================================

SELECT 'Testing v_task_dashboard...' as status;
SELECT COUNT(*) as row_count FROM v_task_dashboard;

SELECT 'Testing v_request_pipeline...' as status;
SELECT COUNT(*) as row_count FROM v_request_pipeline;

SELECT 'Testing v_prompt_activity...' as status;
SELECT COUNT(*) as row_count FROM v_prompt_activity;

SELECT 'Testing v_file_activity...' as status;
SELECT COUNT(*) as row_count FROM v_file_activity;

-- ============================================================================
-- STEP 8: Show final status
-- ============================================================================

SELECT '✅ All views recreated successfully!' as status;

SELECT 
    TABLE_NAME as view_name,
    'VALID' as status
FROM INFORMATION_SCHEMA.VIEWS
WHERE TABLE_SCHEMA = 'nautilus_reporting'
ORDER BY TABLE_NAME;

-- ============================================================================
-- STEP 9: Verify file_versions has file_name
-- ============================================================================

SELECT 'Checking file_versions structure...' as status;

SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'nautilus_reporting'
    AND TABLE_NAME = 'file_versions'
    AND COLUMN_NAME IN ('file_version_id', 'file_path', 'file_name')
ORDER BY ORDINAL_POSITION;

-- ============================================================================
-- END OF FIX SCRIPT
-- ============================================================================

SELECT '✅ ALL FIXES APPLIED SUCCESSFULLY!' as final_status;

