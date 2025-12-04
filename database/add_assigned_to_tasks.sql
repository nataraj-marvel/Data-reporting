-- Add assigned_to field to tasks table
-- This allows tasks to be assigned to specific users
-- Date: December 3, 2025

USE nautilus_reporting;

-- Add assigned_to column to tasks table
ALTER TABLE tasks
ADD COLUMN assigned_to INT NULL AFTER user_id,
ADD INDEX idx_assigned_to (assigned_to),
ADD FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

-- Optional: Set assigned_to to user_id for existing tasks where it's null
-- This assigns existing tasks to their creators
UPDATE tasks SET assigned_to = user_id WHERE assigned_to IS NULL;

SELECT 'assigned_to field added to tasks table successfully!' AS Status;


