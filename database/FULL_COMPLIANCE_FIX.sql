-- FULL COMPLIANCE FIX
-- Generated: 2025-12-04T07:34:03.088Z
-- Database: nautilus_reporting
-- Host: 103.108.220.47

USE nautilus_reporting;

-- Fix: daily_reports.issues_found
ALTER TABLE daily_reports ADD COLUMN issues_found TEXT NULL;

-- Fix: daily_reports.issues_solved
ALTER TABLE daily_reports ADD COLUMN issues_solved TEXT NULL;

-- Fix: issues.resolution
ALTER TABLE issues ADD COLUMN resolution TEXT NULL;

-- Fix: problems_solved.solution_type
ALTER TABLE problems_solved ADD COLUMN solution_type ENUM('fix','workaround','documentation','other') NULL;

-- Fix: problems_solved.effectiveness
ALTER TABLE problems_solved ADD COLUMN effectiveness ENUM('low','medium','high') NULL;

-- Verify fixes
DESCRIBE daily_reports;
DESCRIBE issues;
DESCRIBE problems_solved;
