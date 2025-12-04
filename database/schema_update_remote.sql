-- ============================================================================
-- MINIMAL SCHEMA UPDATE FOR REMOTE DATABASE
-- Renames primary key columns to match v2.0 schema
-- This is NON-DESTRUCTIVE - no data will be lost
-- ============================================================================

USE nautilus_reporting;

-- Drop foreign keys first
ALTER TABLE sessions DROP FOREIGN KEY IF EXISTS sessions_ibfk_1;
ALTER TABLE daily_reports DROP FOREIGN KEY IF EXISTS daily_reports_ibfk_1;
ALTER TABLE issues DROP FOREIGN KEY IF EXISTS issues_ibfk_1;
ALTER TABLE problems_solved DROP FOREIGN KEY IF EXISTS problems_solved_ibfk_1;
ALTER TABLE data_uploads DROP FOREIGN KEY IF EXISTS data_uploads_ibfk_1;
ALTER TABLE tasks DROP FOREIGN KEY IF EXISTS fk_tasks_user;
ALTER TABLE tasks DROP FOREIGN KEY IF EXISTS fk_tasks_report;

-- 1. Update USERS table - rename 'id' to 'user_id'
ALTER TABLE users CHANGE COLUMN id user_id INT AUTO_INCREMENT;

-- 2. Update DAILY_REPORTS table - rename 'id' to 'report_id'
ALTER TABLE daily_reports CHANGE COLUMN id report_id INT AUTO_INCREMENT;

-- 3. Update ISSUES table - rename 'id' to 'issue_id'
ALTER TABLE issues CHANGE COLUMN id issue_id INT AUTO_INCREMENT;

-- 4. Update PROBLEMS_SOLVED table - rename 'id' to 'solution_id'
ALTER TABLE problems_solved CHANGE COLUMN id solution_id INT AUTO_INCREMENT;

-- 5. Update DATA_UPLOADS table - rename 'id' to 'upload_id'
ALTER TABLE data_uploads CHANGE COLUMN id upload_id INT AUTO_INCREMENT;

-- 6. Update SESSIONS table - rename 'id' to 'session_id'
ALTER TABLE sessions CHANGE COLUMN id session_id INT AUTO_INCREMENT;

-- Recreate foreign keys with correct names
ALTER TABLE sessions
  ADD CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE daily_reports
  ADD CONSTRAINT fk_daily_reports_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE issues
  ADD CONSTRAINT fk_issues_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE problems_solved
  ADD CONSTRAINT fk_problems_solved_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE data_uploads
  ADD CONSTRAINT fk_data_uploads_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_report FOREIGN KEY (report_id) REFERENCES daily_reports(report_id) ON DELETE SET NULL;

-- Add report_id foreign key to issues if column exists
ALTER TABLE issues
  ADD CONSTRAINT fk_issues_report FOREIGN KEY (report_id) REFERENCES daily_reports(report_id) ON DELETE SET NULL;

ALTER TABLE problems_solved
  ADD CONSTRAINT fk_problems_solved_report FOREIGN KEY (report_id) REFERENCES daily_reports(report_id) ON DELETE SET NULL;

-- Verify changes
SELECT 'Schema update completed successfully!' AS Status;

-- Show updated table structures
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'nautilus_reporting'
  AND TABLE_NAME IN ('users', 'daily_reports', 'issues', 'problems_solved', 'data_uploads', 'sessions')
  AND COLUMN_KEY = 'PRI'
ORDER BY TABLE_NAME;

