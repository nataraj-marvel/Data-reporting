-- ============================================================================
-- CORRECT NAUTILUS REPORTING SYSTEM DATABASE SCHEMA
-- Compatible with existing remote database structure
-- Date: December 3, 2025
-- ============================================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS nautilus_reporting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE nautilus_reporting;

-- ============================================================================
-- CORE TABLES (Original Schema - Compatible with Remote DB)
-- ============================================================================

-- Users table
-- Primary Key: id
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'programmer') NOT NULL DEFAULT 'programmer',
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    INDEX idx_token (token(255)),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily reports table
-- Primary Key: id
CREATE TABLE IF NOT EXISTS daily_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    
    INDEX idx_user_id (user_id),
    INDEX idx_report_date (report_date),
    INDEX idx_status (status),
    INDEX idx_user_date (user_id, report_date),
    UNIQUE KEY unique_user_date (user_id, report_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    FOREIGN KEY (report_id) REFERENCES daily_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Problems solved table
CREATE TABLE IF NOT EXISTS problems_solved (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    FOREIGN KEY (report_id) REFERENCES daily_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data uploads table
CREATE TABLE IF NOT EXISTS data_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    FOREIGN KEY (report_id) REFERENCES daily_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ENHANCED TABLES (v2.0 Features - Optional)
-- Only create these if you want the advanced features
-- ============================================================================

-- AI Prompts Table
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

-- Tasks Table
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES daily_reports(id) ON DELETE SET NULL,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE SET NULL,
    FOREIGN KEY (prompt_id) REFERENCES ai_prompts(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- File Versions Table
CREATE TABLE IF NOT EXISTS file_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relationship tables
CREATE TABLE IF NOT EXISTS prompt_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prompt_id INT NOT NULL,
    file_version_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_prompt_file (prompt_id, file_version_id),
    FOREIGN KEY (prompt_id) REFERENCES ai_prompts(id) ON DELETE CASCADE,
    FOREIGN KEY (file_version_id) REFERENCES file_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS task_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    file_version_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_task_file (task_id, file_version_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (file_version_id) REFERENCES file_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERT DEFAULT DATA
-- ============================================================================

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION)
INSERT INTO users (username, password_hash, role, full_name, email) 
VALUES ('admin', '$2a$10$rOzJQjKVJk5V5h5hK5h5hOzJQjKVJk5V5h5hK5h5hOzJQjKVJk5V5', 'admin', 'System Administrator', 'admin@nautilus.local')
ON DUPLICATE KEY UPDATE username=username;

-- ============================================================================
-- COLUMN NAMING CONVENTIONS
-- ============================================================================
-- PRIMARY KEYS:
--   users.id
--   daily_reports.id
--   tasks.id
--   requests.id
--   issues.id
--   ai_prompts.id
--   file_versions.id
--
-- FOREIGN KEYS:
--   user_id (references users.id)
--   report_id (references daily_reports.id)
--   task_id (references tasks.id)
--   request_id (references requests.id)
--   issue_id (references issues.id)
--   prompt_id (references ai_prompts.id)
--
-- JOIN SYNTAX EXAMPLES:
--   LEFT JOIN users u ON dr.user_id = u.id
--   LEFT JOIN daily_reports dr ON t.report_id = dr.id
--   LEFT JOIN tasks t ON r.task_id = t.id
-- ============================================================================

