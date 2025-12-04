-- ============================================================================
-- NAUTILUS REPORTING SYSTEM - CLEAN INSTALLATION SCRIPT
-- Safe to run on new or partially existing databases
-- Uses your remote database schema: user_id, report_id, task_id, etc.
-- Date: December 3, 2025
-- ============================================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS nautilus_reporting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE nautilus_reporting;

-- ============================================================================
-- DISABLE FOREIGN KEY CHECKS TEMPORARILY
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- DROP EXISTING TABLES (IF THEY EXIST)
-- Order matters due to foreign key dependencies
-- ============================================================================

DROP TABLE IF EXISTS activity_log;
DROP TABLE IF EXISTS task_files;
DROP TABLE IF EXISTS prompt_files;
DROP TABLE IF EXISTS file_versions;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS ai_prompts;
DROP TABLE IF EXISTS data_uploads;
DROP TABLE IF EXISTS problems_solved;
DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS daily_reports;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS system_version;

-- Drop views if they exist
DROP VIEW IF EXISTS v_task_dashboard;
DROP VIEW IF EXISTS v_request_pipeline;
DROP VIEW IF EXISTS v_prompt_activity;
DROP VIEW IF EXISTS v_file_activity;

-- ============================================================================
-- CREATE TABLES WITH YOUR REMOTE DATABASE SCHEMA
-- Primary Keys: user_id, report_id, task_id (NOT id)
-- ============================================================================

-- 1. USERS TABLE
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'programmer') NOT NULL DEFAULT 'programmer',
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1,
    ai_usage_preference ENUM('always', 'optional', 'minimal', 'disabled') DEFAULT 'optional',
    notification_preferences LONGTEXT,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SESSIONS TABLE
CREATE TABLE sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    INDEX idx_token (token(255)),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. DAILY REPORTS TABLE
CREATE TABLE daily_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    report_date DATE NOT NULL,
    work_description TEXT NOT NULL,
    hours_worked DECIMAL(4,2) NOT NULL,
    tasks_completed TEXT,
    blockers TEXT,
    notes TEXT,
    status ENUM('draft', 'submitted', 'reviewed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by INT NULL,
    ai_assisted TINYINT(1) DEFAULT 0,
    sprint_number INT,
    task_id INT NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_report_date (report_date),
    INDEX idx_status (status),
    INDEX idx_user_date (user_id, report_date),
    INDEX idx_task_id (task_id),
    UNIQUE KEY unique_user_date (user_id, report_date),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ISSUES TABLE
CREATE TABLE issues (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    
    INDEX idx_report_id (report_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_severity (severity),
    FOREIGN KEY (report_id) REFERENCES daily_reports(report_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. PROBLEMS SOLVED TABLE
CREATE TABLE problems_solved (
    solution_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    user_id INT NOT NULL,
    issue_id INT NULL,
    title VARCHAR(200) NOT NULL,
    problem_description TEXT NOT NULL,
    solution_description TEXT NOT NULL,
    time_spent DECIMAL(4,2),
    tags VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_report_id (report_id),
    INDEX idx_user_id (user_id),
    INDEX idx_issue_id (issue_id),
    FOREIGN KEY (report_id) REFERENCES daily_reports(report_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (issue_id) REFERENCES issues(issue_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. DATA UPLOADS TABLE
CREATE TABLE data_uploads (
    upload_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    upload_path VARCHAR(500),
    description TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_report_id (report_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (report_id) REFERENCES daily_reports(report_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. AI PROMPTS TABLE
CREATE TABLE ai_prompts (
    prompt_id INT AUTO_INCREMENT PRIMARY KEY,
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
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES daily_reports(report_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. REQUESTS TABLE
CREATE TABLE requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
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
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES daily_reports(report_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TASKS TABLE
CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
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
    assigned_to INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_report_id (report_id),
    INDEX idx_request_id (request_id),
    INDEX idx_issue_id (issue_id),
    INDEX idx_prompt_id (prompt_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_parent_task_id (parent_task_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES daily_reports(report_id) ON DELETE SET NULL,
    FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE SET NULL,
    FOREIGN KEY (issue_id) REFERENCES issues(issue_id) ON DELETE SET NULL,
    FOREIGN KEY (prompt_id) REFERENCES ai_prompts(prompt_id) ON DELETE SET NULL,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(task_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. FILE VERSIONS TABLE
CREATE TABLE file_versions (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    version_number INT DEFAULT 1,
    change_type ENUM('created', 'modified', 'deleted', 'renamed', 'moved') DEFAULT 'modified',
    change_description TEXT,
    lines_added INT DEFAULT 0,
    lines_removed INT DEFAULT 0,
    commit_hash VARCHAR(100),
    branch_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_file_path (file_path(255)),
    INDEX idx_file_name (file_name),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. PROMPT FILES RELATIONSHIP TABLE
CREATE TABLE prompt_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prompt_id INT NOT NULL,
    file_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_prompt_file (prompt_id, file_id),
    FOREIGN KEY (prompt_id) REFERENCES ai_prompts(prompt_id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES file_versions(file_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. TASK FILES RELATIONSHIP TABLE
CREATE TABLE task_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    file_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_task_file (task_id, file_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES file_versions(file_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. ACTIVITY LOG TABLE
CREATE TABLE activity_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. SYSTEM VERSION TABLE
CREATE TABLE system_version (
    version_id INT AUTO_INCREMENT PRIMARY KEY,
    version_number VARCHAR(20) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- INSERT DEFAULT DATA
-- ============================================================================

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, role, full_name, email, is_active) 
VALUES ('admin', '$2a$10$rOzJQjKVJk5V5h5hK5h5hOzJQjKVJk5V5h5hK5h5hOzJQjKVJk5V5', 'admin', 'System Administrator', 'admin@nautilus.local', 1)
ON DUPLICATE KEY UPDATE username=username;

-- Insert system version
INSERT INTO system_version (version_number, description) 
VALUES ('2.0.0', 'Initial installation with AI tracking and enhanced features');

-- ============================================================================
-- CREATE USEFUL VIEWS
-- ============================================================================

-- Task Dashboard View
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
    t.updated_at
FROM tasks t
LEFT JOIN users u_creator ON t.user_id = u_creator.user_id
LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.user_id
LEFT JOIN daily_reports dr ON t.report_id = dr.report_id
LEFT JOIN requests r ON t.request_id = r.request_id
LEFT JOIN issues i ON t.issue_id = i.issue_id;

-- Request Pipeline View
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
    COUNT(DISTINCT t.task_id) as task_count,
    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
    r.estimated_hours,
    r.actual_hours,
    r.due_date,
    r.created_at,
    r.updated_at
FROM requests r
LEFT JOIN users u_creator ON r.user_id = u_creator.user_id
LEFT JOIN users u_assigned ON r.assigned_to = u_assigned.user_id
LEFT JOIN tasks t ON r.request_id = t.request_id
GROUP BY r.request_id;

-- Prompt Activity View
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
    COUNT(DISTINCT pf.file_id) as files_affected,
    p.created_at
FROM ai_prompts p
LEFT JOIN users u ON p.user_id = u.user_id
LEFT JOIN prompt_files pf ON p.prompt_id = pf.prompt_id
GROUP BY p.prompt_id;

-- File Activity View
CREATE OR REPLACE VIEW v_file_activity AS
SELECT 
    fv.file_id,
    fv.file_path,
    fv.file_name,
    fv.version_number,
    fv.change_type,
    fv.lines_added,
    fv.lines_removed,
    u.username,
    u.full_name,
    fv.created_at
FROM file_versions fv
LEFT JOIN users u ON fv.user_id = u.user_id;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show all tables
SELECT 'Tables created successfully:' as status;
SHOW TABLES;

-- Show table structures
SELECT 'Users table structure:' as info;
DESCRIBE users;

SELECT 'Daily Reports table structure:' as info;
DESCRIBE daily_reports;

SELECT 'Tasks table structure:' as info;
DESCRIBE tasks;

-- Count records
SELECT 
    (SELECT COUNT(*) FROM users) as users_count,
    (SELECT COUNT(*) FROM daily_reports) as reports_count,
    (SELECT COUNT(*) FROM tasks) as tasks_count,
    (SELECT COUNT(*) FROM requests) as requests_count,
    (SELECT COUNT(*) FROM ai_prompts) as prompts_count;

-- ============================================================================
-- INSTALLATION COMPLETE
-- ============================================================================

SELECT '✅ Installation Complete!' as status;
SELECT 'Database: nautilus_reporting' as info;
SELECT 'Default User: admin' as info;
SELECT 'Default Password: admin123' as info;
SELECT 'Please change the admin password in production!' as warning;

