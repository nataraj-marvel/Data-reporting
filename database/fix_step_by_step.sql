-- ============================================================================
-- STEP-BY-STEP ID COLUMN FIXES
-- Execute this one statement at a time if needed
-- ============================================================================

USE nautilus_reporting;

-- ============================================================================
-- STEP 1: FIX AI_PROMPTS (no dependencies on other unfixed tables)
-- ============================================================================

-- Drop FK constraints referencing ai_prompts.id
ALTER TABLE tasks DROP FOREIGN KEY tasks_ibfk_5;
ALTER TABLE issues DROP FOREIGN KEY fk_issues_prompt;
ALTER TABLE problems_solved DROP FOREIGN KEY fk_solutions_prompt;
ALTER TABLE prompt_files DROP FOREIGN KEY prompt_files_ibfk_1;

-- Rename column
ALTER TABLE ai_prompts CHANGE COLUMN id prompt_id INT AUTO_INCREMENT;

-- Recreate FK constraints
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_prompt FOREIGN KEY (prompt_id) REFERENCES ai_prompts(prompt_id) ON DELETE SET NULL;
ALTER TABLE issues ADD CONSTRAINT fk_issues_prompt FOREIGN KEY (prompt_id) REFERENCES ai_prompts(prompt_id) ON DELETE SET NULL;
ALTER TABLE problems_solved ADD CONSTRAINT fk_solutions_prompt FOREIGN KEY (related_prompt_id) REFERENCES ai_prompts(prompt_id) ON DELETE SET NULL;
ALTER TABLE prompt_files ADD CONSTRAINT fk_prompt_files_prompt FOREIGN KEY (prompt_id) REFERENCES ai_prompts(prompt_id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 2: FIX REQUESTS (no dependencies on other unfixed tables)
-- ============================================================================

-- Drop FK constraints referencing requests.id
ALTER TABLE tasks DROP FOREIGN KEY tasks_ibfk_3;

-- Rename column
ALTER TABLE requests CHANGE COLUMN id request_id INT AUTO_INCREMENT;

-- Recreate FK constraints
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_request FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 3: FIX TASKS (depends on ai_prompts and requests being fixed first)
-- ============================================================================

-- Drop FK constraints referencing tasks.id
ALTER TABLE tasks DROP FOREIGN KEY tasks_ibfk_6;
-- Note: file_versions.task_id references tasks_old, not tasks, so we skip it

-- Rename column
ALTER TABLE tasks CHANGE COLUMN id task_id INT AUTO_INCREMENT;

-- Recreate FK constraints
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_parent FOREIGN KEY (parent_task_id) REFERENCES tasks(task_id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 4: FIX FILE_VERSIONS (do this last as it has complex dependencies)
-- ============================================================================

-- Drop FK constraints referencing file_versions.id
ALTER TABLE file_versions DROP FOREIGN KEY file_versions_ibfk_5;
ALTER TABLE prompt_files DROP FOREIGN KEY prompt_files_ibfk_2;
ALTER TABLE task_files DROP FOREIGN KEY task_files_ibfk_2;

-- Rename column
ALTER TABLE file_versions CHANGE COLUMN id file_version_id INT AUTO_INCREMENT;

-- Recreate FK constraints
ALTER TABLE file_versions ADD CONSTRAINT fk_file_versions_previous FOREIGN KEY (previous_version_id) REFERENCES file_versions(file_version_id) ON DELETE SET NULL;
ALTER TABLE prompt_files ADD CONSTRAINT fk_prompt_files_file FOREIGN KEY (file_version_id) REFERENCES file_versions(file_version_id) ON DELETE CASCADE;
ALTER TABLE task_files ADD CONSTRAINT fk_task_files_file FOREIGN KEY (file_version_id) REFERENCES file_versions(file_version_id) ON DELETE CASCADE;

-- ============================================================================
-- DONE!
-- ============================================================================

SELECT 'All ID columns fixed!' AS Result;

