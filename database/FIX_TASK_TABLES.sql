-- FIX TASK-RELATED TABLES SCHEMA
-- Generated: 2025-12-04T07:53:25.401Z
-- Database: nautilus_reporting
-- Host: 103.108.220.47

USE nautilus_reporting;


-- Fix task_files (1 column)
ALTER TABLE task_files ADD COLUMN file_version_id int(11) NOT NULL;

-- Verify fixes
DESCRIBE task_files;
