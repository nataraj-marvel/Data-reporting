-- ================================================================
-- Nautilus Trader Reporting System v2.0 Migration Script
-- AI Agent Tracking & Enhanced Features
-- Date: December 3, 2025
-- ================================================================

USE nautilus_reporting;

-- ================================================================
-- STEP 1: Create New Tables
-- ================================================================

-- AI Prompts Table
-- Stores all AI agent interactions with context
CREATE TABLE IF NOT EXISTS ai_prompts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    report_id INT NULL,
    prompt_text TEXT NOT NULL,
    response_text LONGTEXT,
    ai_model VARCHAR(100) DEFAULT 'unknown',
    context_data JSON,
    category ENUM('debug', 'refactor', 'feature', 'documentation', 'test', 'optimization', 'review', 'other') DEFAULT 'other',
    effectiveness_rating INT CHECK (effectiveness_rating BETWEEN 1 AND 5),
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_report_id (report_id),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    INDEX idx_ai_model (ai_model),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES daily_reports(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Requests Table
-- Feature requests and development requests
CREATE TABLE IF NOT EXISTS requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    report_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    request_type ENUM('feature', 'enhancement', 'refactor', 'documentation', 'infrastructure', 'other') DEFAULT 'feature',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('submitted', 'under_review', 'approved', 'in_progress', 'completed', 'rejected', 'on_hold') DEFAULT 'submitted',
    acceptance_criteria TEXT,
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2),
    assigned_to INT,
    due_date DATE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_report_id (report_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_due_date (due_date),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES daily_reports(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tasks Table (Comprehensive Task Management)
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    report_id INT NULL,
    request_id INT NULL,
    issue_id INT NULL,
    prompt_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'blocked', 'review', 'completed', 'cancelled') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    task_type ENUM('development', 'bugfix', 'testing', 'documentation', 'review', 'research', 'deployment', 'other') DEFAULT 'development',
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2),
    completion_percentage INT DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    due_date DATE,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    blocked_reason TEXT,
    parent_task_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_report_id (report_id),
    INDEX idx_request_id (request_id),
    INDEX idx_issue_id (issue_id),
    INDEX idx_prompt_id (prompt_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_parent_task_id (parent_task_id),
    INDEX idx_due_date (due_date),
    INDEX idx_task_type (task_type),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES daily_reports(id) ON DELETE SET NULL,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE SET NULL,
    FOREIGN KEY (prompt_id) REFERENCES ai_prompts(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- File Versions Table
-- Track file changes with version history
CREATE TABLE IF NOT EXISTS file_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_path VARCHAR(500) NOT NULL,
    version_number VARCHAR(50) NOT NULL,
    change_type ENUM('created', 'modified', 'deleted', 'renamed', 'moved') DEFAULT 'modified',
    user_id INT NOT NULL,
    report_id INT NULL,
    task_id INT NULL,
    solution_id INT NULL,
    lines_added INT DEFAULT 0,
    lines_deleted INT DEFAULT 0,
    file_size_bytes INT,
    commit_hash VARCHAR(100),
    branch_name VARCHAR(100),
    change_description TEXT,
    file_content_snapshot LONGTEXT,
    previous_version_id INT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_file_path (file_path(255)),
    INDEX idx_user_id (user_id),
    INDEX idx_report_id (report_id),
    INDEX idx_task_id (task_id),
    INDEX idx_solution_id (solution_id),
    INDEX idx_version_number (version_number),
    INDEX idx_created_at (created_at),
    INDEX idx_commit_hash (commit_hash),
    INDEX idx_change_type (change_type),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES daily_reports(id) ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (solution_id) REFERENCES problems_solved(id) ON DELETE SET NULL,
    FOREIGN KEY (previous_version_id) REFERENCES file_versions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Prompt Files Junction Table
-- Links AI prompts to files affected
CREATE TABLE IF NOT EXISTS prompt_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prompt_id INT NOT NULL,
    file_version_id INT NOT NULL,
    relevance_score DECIMAL(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_prompt_file (prompt_id, file_version_id),
    INDEX idx_prompt_id (prompt_id),
    INDEX idx_file_version_id (file_version_id),
    
    FOREIGN KEY (prompt_id) REFERENCES ai_prompts(id) ON DELETE CASCADE,
    FOREIGN KEY (file_version_id) REFERENCES file_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Task Files Junction Table
-- Links tasks to files affected
CREATE TABLE IF NOT EXISTS task_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    file_version_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_task_file (task_id, file_version_id),
    INDEX idx_task_id (task_id),
    INDEX idx_file_version_id (file_version_id),
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (file_version_id) REFERENCES file_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Log Table
-- Track all system activities for audit trail
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type ENUM('create', 'update', 'delete', 'view', 'export') NOT NULL,
    entity_type ENUM('report', 'issue', 'solution', 'task', 'request', 'prompt', 'file', 'user') NOT NULL,
    entity_id INT NOT NULL,
    changes JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at),
    INDEX idx_entity (entity_type, entity_id),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- STEP 2: Modify Existing Tables
-- ================================================================

-- Enhance Issues Table
ALTER TABLE issues
ADD COLUMN IF NOT EXISTS issue_source ENUM('manual', 'ai_agent', 'automated_test', 'code_review', 'user_report', 'monitoring') DEFAULT 'manual' AFTER status,
ADD COLUMN IF NOT EXISTS file_path VARCHAR(500) AFTER category,
ADD COLUMN IF NOT EXISTS line_number INT AFTER file_path,
ADD COLUMN IF NOT EXISTS code_snippet TEXT AFTER line_number,
ADD COLUMN IF NOT EXISTS prompt_id INT AFTER code_snippet,
ADD COLUMN IF NOT EXISTS related_commit VARCHAR(100) AFTER prompt_id,
ADD INDEX idx_issue_source (issue_source),
ADD INDEX idx_file_path (file_path(255)),
ADD INDEX idx_prompt_id (prompt_id);

-- Add foreign key for prompt_id if not exists
ALTER TABLE issues
ADD CONSTRAINT fk_issues_prompt 
FOREIGN KEY (prompt_id) REFERENCES ai_prompts(id) ON DELETE SET NULL;

-- Enhance Problems Solved Table
ALTER TABLE problems_solved
ADD COLUMN IF NOT EXISTS approach_description TEXT AFTER solution_description,
ADD COLUMN IF NOT EXISTS alternatives_considered TEXT AFTER approach_description,
ADD COLUMN IF NOT EXISTS lessons_learned TEXT AFTER alternatives_considered,
ADD COLUMN IF NOT EXISTS effectiveness_rating INT CHECK (effectiveness_rating BETWEEN 1 AND 5) AFTER lessons_learned,
ADD COLUMN IF NOT EXISTS related_prompt_id INT AFTER effectiveness_rating,
ADD INDEX idx_related_prompt_id (related_prompt_id);

-- Add foreign key for related_prompt_id if not exists
ALTER TABLE problems_solved
ADD CONSTRAINT fk_solutions_prompt 
FOREIGN KEY (related_prompt_id) REFERENCES ai_prompts(id) ON DELETE SET NULL;

-- Enhance Daily Reports Table
ALTER TABLE daily_reports
ADD COLUMN IF NOT EXISTS tags VARCHAR(500) AFTER notes,
ADD COLUMN IF NOT EXISTS ai_assisted BOOLEAN DEFAULT FALSE AFTER tags,
ADD COLUMN IF NOT EXISTS sprint_number INT AFTER ai_assisted,
ADD INDEX idx_sprint_number (sprint_number),
ADD INDEX idx_ai_assisted (ai_assisted);

-- Enhance Users Table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS ai_usage_preference ENUM('always', 'optional', 'minimal', 'disabled') DEFAULT 'optional' AFTER is_active,
ADD COLUMN IF NOT EXISTS notification_preferences JSON AFTER ai_usage_preference;

-- ================================================================
-- STEP 3: Create Views for Common Queries
-- ================================================================

-- View: Task Dashboard with all related information
CREATE OR REPLACE VIEW v_task_dashboard AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.task_type,
    t.completion_percentage,
    t.estimated_hours,
    t.actual_hours,
    t.due_date,
    t.created_at,
    u.username AS assigned_user,
    u.full_name AS assigned_user_name,
    r.report_date,
    req.title AS request_title,
    i.title AS issue_title,
    p.prompt_text AS related_prompt,
    COUNT(DISTINCT tf.file_version_id) AS files_affected_count
FROM tasks t
LEFT JOIN users u ON t.user_id = u.id
LEFT JOIN daily_reports r ON t.report_id = r.id
LEFT JOIN requests req ON t.request_id = req.id
LEFT JOIN issues i ON t.issue_id = i.id
LEFT JOIN ai_prompts p ON t.prompt_id = p.id
LEFT JOIN task_files tf ON t.id = tf.task_id
GROUP BY t.id;

-- View: AI Prompt Activity Summary
CREATE OR REPLACE VIEW v_prompt_activity AS
SELECT 
    ap.id,
    ap.prompt_text,
    ap.ai_model,
    ap.category,
    ap.effectiveness_rating,
    ap.created_at,
    u.username,
    u.full_name,
    dr.report_date,
    COUNT(DISTINCT pf.file_version_id) AS files_affected,
    COUNT(DISTINCT t.id) AS related_tasks,
    COUNT(DISTINCT i.id) AS issues_found
FROM ai_prompts ap
LEFT JOIN users u ON ap.user_id = u.id
LEFT JOIN daily_reports dr ON ap.report_id = dr.id
LEFT JOIN prompt_files pf ON ap.id = pf.prompt_id
LEFT JOIN tasks t ON ap.id = t.prompt_id
LEFT JOIN issues i ON ap.id = i.prompt_id
GROUP BY ap.id;

-- View: Request Pipeline Status
CREATE OR REPLACE VIEW v_request_pipeline AS
SELECT 
    r.id,
    r.title,
    r.request_type,
    r.priority,
    r.status,
    r.estimated_hours,
    r.actual_hours,
    r.due_date,
    r.created_at,
    creator.username AS created_by,
    assignee.full_name AS assigned_to_name,
    COUNT(DISTINCT t.id) AS task_count,
    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks
FROM requests r
LEFT JOIN users creator ON r.user_id = creator.id
LEFT JOIN users assignee ON r.assigned_to = assignee.id
LEFT JOIN tasks t ON r.id = t.request_id
GROUP BY r.id;

-- View: File Change Activity
CREATE OR REPLACE VIEW v_file_activity AS
SELECT 
    fv.id,
    fv.file_path,
    fv.version_number,
    fv.change_type,
    fv.lines_added,
    fv.lines_deleted,
    fv.commit_hash,
    fv.created_at,
    u.username,
    t.title AS task_title,
    ps.title AS solution_title
FROM file_versions fv
LEFT JOIN users u ON fv.user_id = u.id
LEFT JOIN tasks t ON fv.task_id = t.id
LEFT JOIN problems_solved ps ON fv.solution_id = ps.id
ORDER BY fv.created_at DESC;

-- ================================================================
-- STEP 4: Create Stored Procedures
-- ================================================================

DELIMITER //

-- Procedure: Get User Activity Summary
CREATE PROCEDURE IF NOT EXISTS sp_get_user_activity_summary(
    IN p_user_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        'Prompts' AS activity_type,
        COUNT(*) AS count,
        AVG(effectiveness_rating) AS avg_rating
    FROM ai_prompts
    WHERE user_id = p_user_id
        AND DATE(created_at) BETWEEN p_start_date AND p_end_date
    UNION ALL
    SELECT 
        'Tasks Completed' AS activity_type,
        COUNT(*) AS count,
        AVG(actual_hours) AS avg_hours
    FROM tasks
    WHERE user_id = p_user_id
        AND status = 'completed'
        AND DATE(completed_at) BETWEEN p_start_date AND p_end_date
    UNION ALL
    SELECT 
        'Issues Reported' AS activity_type,
        COUNT(*) AS count,
        NULL AS avg_metric
    FROM issues
    WHERE user_id = p_user_id
        AND DATE(created_at) BETWEEN p_start_date AND p_end_date
    UNION ALL
    SELECT 
        'Solutions Documented' AS activity_type,
        COUNT(*) AS count,
        AVG(effectiveness_rating) AS avg_rating
    FROM problems_solved
    WHERE user_id = p_user_id
        AND DATE(created_at) BETWEEN p_start_date AND p_end_date;
END //

-- Procedure: Update Task Status with Automation
CREATE PROCEDURE IF NOT EXISTS sp_update_task_status(
    IN p_task_id INT,
    IN p_new_status ENUM('pending', 'in_progress', 'blocked', 'review', 'completed', 'cancelled'),
    IN p_user_id INT,
    IN p_notes TEXT
)
BEGIN
    DECLARE v_old_status VARCHAR(50);
    
    -- Get current status
    SELECT status INTO v_old_status FROM tasks WHERE id = p_task_id;
    
    -- Update task
    UPDATE tasks 
    SET 
        status = p_new_status,
        started_at = CASE 
            WHEN p_new_status = 'in_progress' AND started_at IS NULL 
            THEN CURRENT_TIMESTAMP 
            ELSE started_at 
        END,
        completed_at = CASE 
            WHEN p_new_status = 'completed' 
            THEN CURRENT_TIMESTAMP 
            ELSE completed_at 
        END
    WHERE id = p_task_id;
    
    -- Log activity
    INSERT INTO activity_log (user_id, activity_type, entity_type, entity_id, changes)
    VALUES (
        p_user_id,
        'update',
        'task',
        p_task_id,
        JSON_OBJECT(
            'old_status', v_old_status,
            'new_status', p_new_status,
            'notes', p_notes
        )
    );
END //

-- Procedure: Link Prompt to Files
CREATE PROCEDURE IF NOT EXISTS sp_link_prompt_to_files(
    IN p_prompt_id INT,
    IN p_file_paths JSON
)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE file_count INT;
    DECLARE current_path VARCHAR(500);
    DECLARE file_version_id INT;
    
    SET file_count = JSON_LENGTH(p_file_paths);
    
    WHILE i < file_count DO
        SET current_path = JSON_UNQUOTE(JSON_EXTRACT(p_file_paths, CONCAT('$[', i, ']')));
        
        -- Get the latest file version for this path
        SELECT id INTO file_version_id
        FROM file_versions
        WHERE file_path = current_path
        ORDER BY created_at DESC
        LIMIT 1;
        
        -- Insert link if file version found
        IF file_version_id IS NOT NULL THEN
            INSERT IGNORE INTO prompt_files (prompt_id, file_version_id, relevance_score)
            VALUES (p_prompt_id, file_version_id, 1.0);
        END IF;
        
        SET i = i + 1;
    END WHILE;
END //

DELIMITER ;

-- ================================================================
-- STEP 5: Insert Sample Data (for testing)
-- ================================================================

-- Sample AI Prompt
INSERT INTO ai_prompts (user_id, prompt_text, response_text, ai_model, category, effectiveness_rating)
SELECT 
    id,
    'How can I optimize the database queries in the reporting system?',
    'Here are several approaches to optimize your queries...',
    'claude-sonnet-4.5',
    'optimization',
    5
FROM users
WHERE role = 'admin'
LIMIT 1;

-- Sample Request
INSERT INTO requests (user_id, title, description, request_type, priority, status)
SELECT 
    id,
    'Add Export to Excel Feature',
    'Users should be able to export reports to Excel format',
    'feature',
    'high',
    'submitted'
FROM users
WHERE role = 'admin'
LIMIT 1;

-- ================================================================
-- STEP 6: Update Version Information
-- ================================================================

-- Create version tracking table if not exists
CREATE TABLE IF NOT EXISTS system_version (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    description TEXT,
    migration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Record this migration
INSERT INTO system_version (version, description)
VALUES ('2.0.0', 'AI Agent Tracking & Enhanced Features Migration - Added ai_prompts, requests, tasks, file_versions tables and enhanced existing tables');

-- ================================================================
-- STEP 7: Grant Permissions (adjust as needed)
-- ================================================================

-- Grant permissions to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON nautilus_reporting.* TO 'reporting_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ================================================================
-- Migration Complete
-- ================================================================

SELECT 'Migration to v2.0.0 completed successfully!' AS Status;
SELECT COUNT(*) AS new_tables FROM information_schema.tables 
WHERE table_schema = 'nautilus_reporting' 
AND table_name IN ('ai_prompts', 'requests', 'tasks', 'file_versions', 'prompt_files', 'task_files', 'activity_log');

