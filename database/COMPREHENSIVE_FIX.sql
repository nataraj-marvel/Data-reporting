-- COMPREHENSIVE SCHEMA FIX
-- Generated: 2025-12-04T07:07:24.822Z
-- Database: nautilus_reporting
-- Host: 103.108.220.47

-- This script fixes all schema mismatches between API expectations and database reality

USE nautilus_reporting;


-- Fix file_versions
-- Issues: Wrong PK: has "file_id", needs "file_version_id"
ALTER TABLE file_versions CHANGE file_id file_version_id INT(11) AUTO_INCREMENT;

-- Verify fixes
DESCRIBE file_versions;

-- End of fixes
