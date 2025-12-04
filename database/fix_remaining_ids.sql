-- ============================================================================
-- FIX REMAINING ID COLUMNS
-- This updates only the tables that still use 'id' instead of specific names
-- ============================================================================

USE nautilus_reporting;

-- ============================================================================
-- 1. FIX TASKS TABLE (id -> task_id)
-- ============================================================================

-- Drop foreign keys that reference tasks.id
ALTER TABLE tasks DROP FOREIGN KEY IF EXISTS tasks_ibfk_6;
ALTER TABLE file_versions DROP FOREIGN KEY IF EXISTS file_versions_ibfk_3;
ALTER TABLE task_files DROP FOREIGN KEY IF EXISTS task_files_ibfk_1;

-- Rename tasks.id to task_id
ALTER TABLE tasks CHANGE COLUMN id task_id INT AUTO_INCREMENT;

-- Recreate foreign keys
ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_parent FOREIGN KEY (parent_task_id) REFERENCES tasks(task_id) ON DELETE SET NULL;

ALTER TABLE file_versions
  ADD CONSTRAINT fk_file_versions_task FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE SET NULL;

ALTER TABLE task_files
  ADD CONSTRAINT fk_task_files_task FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE;

-- ============================================================================
-- 2. FIX AI_PROMPTS TABLE (id -> prompt_id)
-- ============================================================================

-- Drop foreign keys that reference ai_prompts.id
ALTER TABLE tasks DROP FOREIGN KEY IF EXISTS tasks_ibfk_5;
ALTER TABLE issues DROP FOREIGN KEY IF EXISTS fk_issues_prompt;
ALTER TABLE problems_solved DROP FOREIGN KEY IF EXISTS fk_solutions_prompt;
ALTER TABLE prompt_files DROP FOREIGN KEY IF EXISTS prompt_files_ibfk_1;

-- Rename ai_prompts.id to prompt_id
ALTER TABLE ai_prompts CHANGE COLUMN id prompt_id INT AUTO_INCREMENT;

-- Recreate foreign keys
ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_prompt FOREIGN KEY (prompt_id) REFERENCES ai_prompts(prompt_id) ON DELETE SET NULL;

ALTER TABLE issues
  ADD CONSTRAINT fk_issues_prompt FOREIGN KEY (prompt_id) REFERENCES ai_prompts(prompt_id) ON DELETE SET NULL;

ALTER TABLE problems_solved
  ADD CONSTRAINT fk_solutions_prompt FOREIGN KEY (related_prompt_id) REFERENCES ai_prompts(prompt_id) ON DELETE SET NULL;

ALTER TABLE prompt_files
  ADD CONSTRAINT fk_prompt_files_prompt FOREIGN KEY (prompt_id) REFERENCES ai_prompts(prompt_id) ON DELETE CASCADE;

-- ============================================================================
-- 3. FIX REQUESTS TABLE (id -> request_id)
-- ============================================================================

-- Drop foreign keys that reference requests.id
ALTER TABLE tasks DROP FOREIGN KEY IF EXISTS tasks_ibfk_3;

-- Rename requests.id to request_id
ALTER TABLE requests CHANGE COLUMN id request_id INT AUTO_INCREMENT;

-- Recreate foreign keys
ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_request FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE SET NULL;

-- ============================================================================
-- 4. FIX FILE_VERSIONS TABLE (id -> file_version_id)
-- ============================================================================

-- Drop foreign keys that reference file_versions.id
ALTER TABLE file_versions DROP FOREIGN KEY IF EXISTS file_versions_ibfk_5;
ALTER TABLE prompt_files DROP FOREIGN KEY IF EXISTS prompt_files_ibfk_2;
ALTER TABLE task_files DROP FOREIGN KEY IF EXISTS task_files_ibfk_2;

-- Rename file_versions.id to file_version_id
ALTER TABLE file_versions CHANGE COLUMN id file_version_id INT AUTO_INCREMENT;

-- Recreate foreign keys
ALTER TABLE file_versions
  ADD CONSTRAINT fk_file_versions_previous FOREIGN KEY (previous_version_id) REFERENCES file_versions(file_version_id) ON DELETE SET NULL;

ALTER TABLE prompt_files
  ADD CONSTRAINT fk_prompt_files_file FOREIGN KEY (file_version_id) REFERENCES file_versions(file_version_id) ON DELETE CASCADE;

ALTER TABLE task_files
  ADD CONSTRAINT fk_task_files_file FOREIGN KEY (file_version_id) REFERENCES file_versions(file_version_id) ON DELETE CASCADE;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Migration completed successfully!' AS Status;

-- Show all primary keys to verify
SELECT 
  TABLE_NAME, 
  COLUMN_NAME as PRIMARY_KEY_COLUMN
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'nautilus_reporting'
  AND COLUMN_KEY = 'PRI'
ORDER BY TABLE_NAME;

