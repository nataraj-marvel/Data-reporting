# Database Installation Guide

## Overview
This guide helps you install or reinstall the Nautilus Reporting System database safely, even if tables already exist.

## What's Special About This Installation

✅ **Safe to Run Multiple Times** - Won't fail if tables exist  
✅ **Handles Partial Installations** - Drops and recreates tables cleanly  
✅ **Matches Your Schema** - Uses `user_id`, `report_id`, `task_id` (not `id`)  
✅ **Complete Setup** - Creates all tables, views, and default data  
✅ **No Manual Edits Needed** - Just run and go!

## Files

### `CLEAN_INSTALL.sql` (Main Installation Script)
- Drops existing tables safely
- Creates all tables with correct schema
- Sets up foreign keys and indexes
- Creates useful views
- Inserts default admin user
- Includes verification queries

**Size:** 600+ lines  
**Runtime:** ~2-5 seconds

## Installation Methods

### Method 1: MySQL Workbench (Recommended for Windows)

1. **Open MySQL Workbench**
2. **Connect to your database server**
3. **Open the SQL script:**
   - File → Open SQL Script
   - Select: `database/CLEAN_INSTALL.sql`
4. **Execute the script:**
   - Click the lightning bolt icon (⚡) or press `Ctrl+Shift+Enter`
5. **Check the output panel:**
   - Should see "✅ Installation Complete!"
   - Should see table counts

### Method 2: MySQL Command Line

```bash
# Windows PowerShell
$env:MYSQL_PWD="your_password"
mysql -u root < database\CLEAN_INSTALL.sql

# Linux/Mac
export MYSQL_PWD="your_password"
mysql -u root < database/CLEAN_INSTALL.sql
```

### Method 3: phpMyAdmin

1. Log into phpMyAdmin
2. Select your database (or create new one)
3. Click "Import" tab
4. Choose file: `database/CLEAN_INSTALL.sql`
5. Click "Go"

### Method 4: PowerShell Script (Windows - Easy!)

```powershell
# Run from Data-reporting directory
.\database\Install-Database.ps1
```

The script will:
- Prompt for MySQL password
- Run the installation
- Show results
- Verify installation

## What Gets Installed

### Core Tables (6)
1. **users** - User accounts and authentication
2. **sessions** - Login sessions and tokens
3. **daily_reports** - Daily work reports
4. **issues** - Problems and bugs
5. **problems_solved** - Solutions and fixes
6. **data_uploads** - File uploads

### Enhanced Tables (7)
7. **ai_prompts** - AI agent interactions
8. **requests** - Feature requests
9. **tasks** - Task management
10. **file_versions** - File change tracking
11. **prompt_files** - Prompt-file relationships
12. **task_files** - Task-file relationships
13. **activity_log** - System activity audit

### Views (4)
- **v_task_dashboard** - Task overview with joins
- **v_request_pipeline** - Request status tracking
- **v_prompt_activity** - AI usage statistics
- **v_file_activity** - File modification history

### Default Data
- Admin user (username: `admin`, password: `admin123`)
- System version record

## Schema Details

### Primary Key Convention
All tables use descriptive primary keys:
```
users.user_id
daily_reports.report_id
tasks.task_id
requests.request_id
issues.issue_id
ai_prompts.prompt_id
file_versions.file_id
sessions.session_id
```

### Foreign Key Convention
Foreign keys reference the full primary key name:
```sql
-- Example: daily_reports table
user_id          → users.user_id
reviewed_by      → users.user_id
task_id          → tasks.task_id

-- Example: tasks table
user_id          → users.user_id
assigned_to      → users.user_id
report_id        → daily_reports.report_id
request_id       → requests.request_id
```

## Post-Installation

### 1. Verify Installation

```sql
-- Check tables
SHOW TABLES;

-- Check admin user
SELECT user_id, username, role, email FROM users WHERE username = 'admin';

-- Check views
SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW';
```

### 2. Update .env File

Make sure your `.env` file has correct database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nautilus_reporting
```

### 3. Test Login

1. Start your application: `npm run dev`
2. Go to: `http://localhost:3000/login`
3. Login with:
   - **Username:** `admin`
   - **Password:** `admin123`

### 4. Change Admin Password (IMPORTANT!)

After first login, change the default password:
```sql
-- Or use the web interface
UPDATE users 
SET password_hash = '$2a$10$YOUR_NEW_HASH' 
WHERE username = 'admin';
```

Better yet, use the application's user management interface.

## Troubleshooting

### Error: Access Denied
```
Solution: Check DB_USER and DB_PASSWORD in .env file
```

### Error: Database already exists
```
Solution: This is fine! The script handles existing databases.
Just run it - it will drop and recreate tables.
```

### Error: Table 'X' doesn't exist
```
Solution: Run CLEAN_INSTALL.sql again
The script creates all tables from scratch.
```

### Error: Foreign key constraint fails
```
Solution: The script handles this by:
1. SET FOREIGN_KEY_CHECKS = 0 at start
2. DROP IF EXISTS in correct order
3. CREATE tables with proper constraints
4. SET FOREIGN_KEY_CHECKS = 1 at end
```

### Warning: Can't drop table 'X' - doesn't exist
```
Solution: This is normal if table doesn't exist yet.
The script continues without errors.
```

## Backup Existing Data

If you have existing data you want to keep:

```bash
# Backup before running CLEAN_INSTALL.sql
mysqldump -u root -p nautilus_reporting > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore if needed
mysql -u root -p nautilus_reporting < backup_20251203_120000.sql
```

## Migration from Old Schema

If you have an old database with `id` instead of `user_id`:

1. **Backup your data first!**
2. Run `CLEAN_INSTALL.sql` (drops and recreates)
3. Import your data with column mapping

## Technical Notes

### Why DROP IF EXISTS?
- Ensures clean state
- No conflicts with existing structures
- Safe to run multiple times
- Handles partial installations

### Foreign Key Order
Tables are dropped in reverse dependency order:
1. Child tables first (activity_log, task_files, etc.)
2. Parent tables last (users)

Tables are created in dependency order:
1. Parent tables first (users)
2. Child tables last (activity_log, task_files, etc.)

### Why Use Views?
- Simplify complex queries
- Pre-join commonly needed data
- Better performance for dashboards
- Easier API development

## Performance Considerations

### Indexes Created
- All foreign keys
- Common search columns (username, email, date, status)
- Composite indexes for common query patterns

### Estimated Size
- Empty database: ~1 MB
- With 1000 reports: ~10-20 MB
- With full year data: ~50-100 MB

## Security Notes

### ⚠️ Default Password
The default admin password is `admin123`.  
**Change this immediately in production!**

### ⚠️ Database User
Use a dedicated database user with limited privileges:

```sql
CREATE USER 'nautilus_app'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON nautilus_reporting.* TO 'nautilus_app'@'localhost';
FLUSH PRIVILEGES;
```

Update `.env`:
```env
DB_USER=nautilus_app
DB_PASSWORD=secure_password
```

## Next Steps

After successful installation:

1. ✅ Test login with admin/admin123
2. ✅ Change admin password
3. ✅ Create additional users
4. ✅ Start using the application
5. ✅ Setup regular backups

## Support

If you encounter issues:

1. Check terminal/console output for specific errors
2. Verify MySQL service is running
3. Confirm database credentials
4. Review this guide's troubleshooting section
5. Check application logs

---

**Installation Script:** `CLEAN_INSTALL.sql`  
**Schema Version:** 2.0.0  
**Last Updated:** December 3, 2025  
**Compatible With:** MySQL 5.7+, MariaDB 10.3+

