-- FIX REMOTE daily_reports TABLE
-- Generated: 2025-12-04T07:48:13.281Z
-- Database: nautilus_reporting
-- Host: 103.108.220.47

USE nautilus_reporting;

-- Add missing column: start_time
ALTER TABLE daily_reports ADD COLUMN start_time TIME NULL;

-- Add missing column: end_time
ALTER TABLE daily_reports ADD COLUMN end_time TIME NULL;

-- Verify
DESCRIBE daily_reports;
