// Comprehensive System Audit Script
// Checks all tables, APIs, views, and identifies integration issues

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const AUDIT_REPORT = [];

function log(message, type = 'info') {
  const prefix = {
    'info': '  ',
    'success': '✅',
    'warning': '⚠️ ',
    'error': '❌',
    'section': '\n📊'
  }[type] || '  ';
  
  const line = `${prefix} ${message}`;
  console.log(line);
  AUDIT_REPORT.push(line);
}

async function auditDatabase() {
  let connection;
  const issues = [];
  const tableStructures = {};
  
  try {
    log('COMPREHENSIVE SYSTEM AUDIT', 'section');
    log('════════════════════════════════════════════════════════════');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nautilus_reporting',
    });

    log('Connected to database', 'success');
    log('');

    // 1. Get all tables
    log('STEP 1: AUDITING ALL TABLES', 'section');
    log('════════════════════════════════════════════════════════════');
    const [tables] = await connection.execute('SHOW TABLES');
    const tableKey = Object.keys(tables[0])[0];
    const tableNames = tables.map(t => t[tableKey]).filter(t => !t.startsWith('v_'));
    
    log(`Found ${tableNames.length} tables`);
    log('');

    // 2. Get structure of each table
    for (const tableName of tableNames) {
      log(`Analyzing: ${tableName}`, 'info');
      
      const [columns] = await connection.execute(
        `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`,
        [process.env.DB_NAME, tableName]
      );

      tableStructures[tableName] = {
        columns: columns.map(c => ({
          name: c.COLUMN_NAME,
          type: c.COLUMN_TYPE,
          nullable: c.IS_NULLABLE,
          key: c.COLUMN_KEY,
          default: c.COLUMN_DEFAULT,
          extra: c.EXTRA
        })),
        primaryKey: columns.find(c => c.COLUMN_KEY === 'PRI')?.COLUMN_NAME,
        foreignKeys: columns.filter(c => c.COLUMN_KEY === 'MUL').map(c => c.COLUMN_NAME)
      };

      // Check for common issues
      const pk = tableStructures[tableName].primaryKey;
      if (!pk) {
        issues.push(`❌ ${tableName}: No primary key found!`);
      } else {
        log(`   Primary Key: ${pk}`, 'success');
      }

      // Check row count
      const [count] = await connection.execute(`SELECT COUNT(*) as total FROM ${tableName}`);
      log(`   Rows: ${count[0].total}`);
    }

    log('');

    // 3. Check foreign key relationships
    log('STEP 2: CHECKING FOREIGN KEY INTEGRITY', 'section');
    log('════════════════════════════════════════════════════════════');
    
    const [fkInfo] = await connection.execute(
      `SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME,
        CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [process.env.DB_NAME]
    );

    log(`Found ${fkInfo.length} foreign key relationships`);
    log('');

    for (const fk of fkInfo) {
      log(`${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      
      // Verify FK integrity
      try {
        const [orphans] = await connection.execute(
          `SELECT COUNT(*) as orphan_count
           FROM ${fk.TABLE_NAME} t
           LEFT JOIN ${fk.REFERENCED_TABLE_NAME} r ON t.${fk.COLUMN_NAME} = r.${fk.REFERENCED_COLUMN_NAME}
           WHERE t.${fk.COLUMN_NAME} IS NOT NULL AND r.${fk.REFERENCED_COLUMN_NAME} IS NULL`
        );
        
        if (orphans[0].orphan_count > 0) {
          issues.push(`❌ ${fk.TABLE_NAME}: ${orphans[0].orphan_count} orphaned ${fk.COLUMN_NAME} references`);
          log(`   ⚠️  ${orphans[0].orphan_count} orphaned records!`, 'warning');
        } else {
          log(`   ✓ Integrity OK`, 'success');
        }
      } catch (error) {
        log(`   ⚠️  Could not verify: ${error.message}`, 'warning');
      }
    }

    log('');

    // 4. Check views
    log('STEP 3: CHECKING VIEWS', 'section');
    log('════════════════════════════════════════════════════════════');
    
    const [views] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'VIEW'`,
      [process.env.DB_NAME]
    );

    log(`Found ${views.length} views`);
    for (const view of views) {
      log(`   ${view.TABLE_NAME}`);
      
      // Try to select from view
      try {
        const [result] = await connection.execute(`SELECT * FROM ${view.TABLE_NAME} LIMIT 1`);
        log(`      ✓ View works (${Object.keys(result[0] || {}).length} columns)`, 'success');
      } catch (error) {
        issues.push(`❌ View ${view.TABLE_NAME} has error: ${error.message}`);
        log(`      ❌ Error: ${error.message}`, 'error');
      }
    }

    log('');

    // 5. Check for schema mismatches with API expectations
    log('STEP 4: API vs DATABASE SCHEMA VALIDATION', 'section');
    log('════════════════════════════════════════════════════════════');
    
    const schemaExpectations = [
      { table: 'users', expectedPK: 'user_id', requiredCols: ['username', 'password_hash', 'role', 'full_name', 'email'] },
      { table: 'daily_reports', expectedPK: 'report_id', requiredCols: ['user_id', 'report_date', 'work_description', 'hours_worked'] },
      { table: 'tasks', expectedPK: 'task_id', requiredCols: ['user_id', 'title', 'status', 'priority'] },
      { table: 'issues', expectedPK: 'issue_id', requiredCols: ['report_id', 'user_id', 'title', 'description'] },
      { table: 'problems_solved', expectedPK: 'solution_id', requiredCols: ['report_id', 'user_id', 'title'] },
      { table: 'requests', expectedPK: 'request_id', requiredCols: ['user_id', 'title', 'description', 'status'] },
      { table: 'ai_prompts', expectedPK: 'prompt_id', requiredCols: ['user_id', 'prompt_text'] },
      { table: 'file_versions', expectedPK: 'file_id', requiredCols: ['user_id', 'file_path', 'file_name'] },
      { table: 'sessions', expectedPK: 'session_id', requiredCols: ['user_id', 'token', 'expires_at'] }
    ];

    for (const expectation of schemaExpectations) {
      if (!tableStructures[expectation.table]) {
        issues.push(`❌ Table ${expectation.table} does not exist!`);
        log(`${expectation.table}: ❌ Table missing`, 'error');
        continue;
      }

      const structure = tableStructures[expectation.table];
      const actualPK = structure.primaryKey;
      
      log(`${expectation.table}:`);
      
      // Check primary key
      if (actualPK !== expectation.expectedPK) {
        issues.push(`❌ ${expectation.table}: Primary key is '${actualPK}' but expected '${expectation.expectedPK}'`);
        log(`   ❌ PK mismatch: got '${actualPK}', expected '${expectation.expectedPK}'`, 'error');
      } else {
        log(`   ✓ Primary key correct: ${actualPK}`, 'success');
      }

      // Check required columns
      const actualCols = structure.columns.map(c => c.name);
      const missingCols = expectation.requiredCols.filter(col => !actualCols.includes(col));
      
      if (missingCols.length > 0) {
        issues.push(`❌ ${expectation.table}: Missing columns: ${missingCols.join(', ')}`);
        log(`   ❌ Missing columns: ${missingCols.join(', ')}`, 'error');
      } else {
        log(`   ✓ All required columns present`, 'success');
      }
    }

    log('');

    // 6. Check indexes
    log('STEP 5: CHECKING INDEXES', 'section');
    log('════════════════════════════════════════════════════════════');
    
    const [indexes] = await connection.execute(
      `SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, NON_UNIQUE
       FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = ?
       AND INDEX_NAME != 'PRIMARY'
       ORDER BY TABLE_NAME, INDEX_NAME`,
      [process.env.DB_NAME]
    );

    const indexesByTable = {};
    for (const idx of indexes) {
      if (!indexesByTable[idx.TABLE_NAME]) {
        indexesByTable[idx.TABLE_NAME] = [];
      }
      indexesByTable[idx.TABLE_NAME].push(idx);
    }

    for (const [table, idxs] of Object.entries(indexesByTable)) {
      log(`${table}: ${idxs.length} indexes`);
    }

    log('');

    // 7. Final Summary
    log('AUDIT SUMMARY', 'section');
    log('════════════════════════════════════════════════════════════');
    log('');
    log(`Total Tables: ${tableNames.length}`);
    log(`Total Views: ${views.length}`);
    log(`Foreign Keys: ${fkInfo.length}`);
    log(`Total Indexes: ${indexes.length}`);
    log('');

    if (issues.length === 0) {
      log('✨ NO ISSUES FOUND - Database is healthy!', 'success');
    } else {
      log('ISSUES FOUND:', 'error');
      log('');
      issues.forEach(issue => log(issue));
    }

    // Save audit report
    const reportPath = join(__dirname, '..', 'AUDIT_REPORT.txt');
    fs.writeFileSync(reportPath, AUDIT_REPORT.join('\n'));
    log('');
    log(`Full report saved to: ${reportPath}`, 'success');

    // Return structured data
    return {
      tables: tableStructures,
      foreignKeys: fkInfo,
      views: views.map(v => v.TABLE_NAME),
      indexes: indexesByTable,
      issues,
      healthy: issues.length === 0
    };

  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run audit
auditDatabase().then(() => {
  console.log('\n✅ Audit complete!\n');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Audit failed:', error.message);
  process.exit(1);
});

