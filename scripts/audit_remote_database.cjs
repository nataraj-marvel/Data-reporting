// Comprehensive Remote Database Audit - READ ONLY
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function auditRemoteDatabase() {
    console.log('\n🔍 REMOTE DATABASE AUDIT (READ ONLY)');
    console.log('='.repeat(70));
    console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log('='.repeat(70));
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // 1. Check all tables exist
        console.log('\n📋 1. TABLES CHECK');
        console.log('-'.repeat(70));
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`✅ Total tables: ${tables.length}`);
        tables.forEach(t => {
            console.log(`   - ${Object.values(t)[0]}`);
        });

        // 2. Check users table structure
        console.log('\n👥 2. USERS TABLE STRUCTURE');
        console.log('-'.repeat(70));
        const [userColumns] = await connection.execute('SHOW COLUMNS FROM users');
        console.log('Columns:');
        userColumns.forEach(col => {
            const key = col.Key ? ` [${col.Key}]` : '';
            const extra = col.Extra ? ` (${col.Extra})` : '';
            console.log(`   - ${col.Field}: ${col.Type}${key}${extra}`);
        });

        // 3. Check users data
        console.log('\n👤 3. USERS DATA');
        console.log('-'.repeat(70));
        const [users] = await connection.execute(
            'SELECT user_id, username, role, full_name, email, is_active, LEFT(password_hash, 30) as pw_start FROM users ORDER BY user_id'
        );
        console.log(`Total users: ${users.length}\n`);
        users.forEach(u => {
            console.log(`   ID: ${u.user_id} | ${u.username} | ${u.role} | ${u.email} | Active: ${u.is_active} | PW: ${u.pw_start}...`);
        });

        // Check for invalid user_id = 0
        const invalidUsers = users.filter(u => u.user_id === 0);
        if (invalidUsers.length > 0) {
            console.log('\n   ⚠️  WARNING: Found users with user_id = 0 (INVALID!)');
            invalidUsers.forEach(u => {
                console.log(`      - ${u.username} (${u.email})`);
            });
        }

        // 4. Check daily_reports table structure
        console.log('\n📊 4. DAILY_REPORTS TABLE STRUCTURE');
        console.log('-'.repeat(70));
        const [reportColumns] = await connection.execute('SHOW COLUMNS FROM daily_reports');
        console.log('Columns:');
        reportColumns.forEach(col => {
            const key = col.Key ? ` [${col.Key}]` : '';
            const extra = col.Extra ? ` (${col.Extra})` : '';
            console.log(`   - ${col.Field}: ${col.Type}${key}${extra}`);
        });

        // 5. Check reports data
        console.log('\n📝 5. REPORTS DATA');
        console.log('-'.repeat(70));
        const [reports] = await connection.execute(
            'SELECT report_id, user_id, report_date, hours_worked, status FROM daily_reports ORDER BY report_id DESC LIMIT 5'
        );
        console.log(`Total reports: ${reports.length} (showing last 5)\n`);
        reports.forEach(r => {
            console.log(`   ID: ${r.report_id} | User: ${r.user_id} | Date: ${r.report_date} | Hours: ${r.hours_worked} | Status: ${r.status}`);
        });

        // 6. Check tasks table structure
        console.log('\n✓ 6. TASKS TABLE STRUCTURE');
        console.log('-'.repeat(70));
        const [taskColumns] = await connection.execute('SHOW COLUMNS FROM tasks');
        console.log('Columns:');
        taskColumns.forEach(col => {
            const key = col.Key ? ` [${col.Key}]` : '';
            const extra = col.Extra ? ` (${col.Extra})` : '';
            console.log(`   - ${col.Field}: ${col.Type}${key}${extra}`);
        });

        // 7. Check foreign keys
        console.log('\n🔗 7. FOREIGN KEYS CHECK');
        console.log('-'.repeat(70));
        const tablesToCheck = ['daily_reports', 'tasks', 'issues', 'problems_solved', 'requests', 'ai_prompts'];
        
        for (const table of tablesToCheck) {
            try {
                const [fks] = await connection.execute(
                    `SELECT 
                        CONSTRAINT_NAME, 
                        COLUMN_NAME, 
                        REFERENCED_TABLE_NAME, 
                        REFERENCED_COLUMN_NAME
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
                    [process.env.DB_NAME, table]
                );
                
                if (fks.length > 0) {
                    console.log(`\n   ${table}:`);
                    fks.forEach(fk => {
                        console.log(`      ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
                    });
                }
            } catch (e) {
                // Table might not exist
            }
        }

        // 8. Schema Issues
        console.log('\n\n⚠️  8. SCHEMA ISSUES FOUND');
        console.log('-'.repeat(70));
        
        let issuesFound = false;
        
        // Check if primary keys are named correctly
        const expectedPrimaryKeys = {
            'users': 'user_id',
            'daily_reports': 'report_id',
            'tasks': 'task_id',
            'requests': 'request_id',
            'issues': 'issue_id',
            'problems_solved': 'solution_id',
            'ai_prompts': 'prompt_id',
            'file_versions': 'file_id',
            'sessions': 'session_id'
        };

        for (const [tableName, expectedPK] of Object.entries(expectedPrimaryKeys)) {
            try {
                const [cols] = await connection.execute(
                    `SHOW COLUMNS FROM ${tableName} WHERE \`Key\` = 'PRI'`
                );
                
                if (cols.length > 0) {
                    const actualPK = cols[0].Field;
                    if (actualPK !== expectedPK) {
                        issuesFound = true;
                        console.log(`   ❌ ${tableName}: Primary key is "${actualPK}" (expected "${expectedPK}")`);
                    } else {
                        console.log(`   ✅ ${tableName}: Primary key "${actualPK}" is correct`);
                    }
                }
            } catch (e) {
                console.log(`   ⚠️  ${tableName}: Table not found or not accessible`);
            }
        }

        if (!issuesFound) {
            console.log('\n   ✅ All primary keys are correctly named!');
        }

        // 9. Summary
        console.log('\n\n📊 AUDIT SUMMARY');
        console.log('='.repeat(70));
        console.log(`✅ Database connection: Working`);
        console.log(`✅ Total tables: ${tables.length}`);
        console.log(`✅ Total users: ${users.length}`);
        console.log(`✅ Total reports: ${reports.length}`);
        
        if (invalidUsers.length > 0) {
            console.log(`⚠️  Invalid users (ID=0): ${invalidUsers.length} - NEEDS FIX`);
        } else {
            console.log(`✅ No invalid users found`);
        }

    } finally {
        await connection.end();
        console.log('\n' + '='.repeat(70));
        console.log('✅ Audit complete (no changes made)\n');
    }
}

auditRemoteDatabase().catch(err => {
    console.error('\n❌ Audit error:', err.message);
    console.error('Stack:', err.stack);
});

