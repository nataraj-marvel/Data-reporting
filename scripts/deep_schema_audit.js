// Deep Schema Audit - Compare API expectations vs Database reality
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     🔍 DEEP SCHEMA AUDIT - API vs DATABASE               ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

async function auditSchema() {
  let connection;
  const issues = [];
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to:', dbConfig.host);
    console.log('📂 Database:', dbConfig.database, '\n');

    // Get actual database schema
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 COMPARING API EXPECTATIONS vs DATABASE REALITY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Define what APIs expect
    const apiExpectations = {
      users: {
        pk: 'user_id',
        columns: ['user_id', 'username', 'password_hash', 'email', 'full_name', 'role', 'created_at', 'updated_at', 'last_login']
      },
      daily_reports: {
        pk: 'report_id',
        columns: ['report_id', 'user_id', 'report_date', 'work_description', 'hours_worked', 'tasks_completed', 'status', 'created_at', 'updated_at', 'submitted_at']
      },
      tasks: {
        pk: 'task_id',
        columns: ['task_id', 'user_id', 'title', 'description', 'status', 'priority', 'report_id', 'request_id', 'issue_id', 'prompt_id', 'parent_task_id', 'assigned_to', 'created_at', 'updated_at']
      },
      requests: {
        pk: 'request_id',
        columns: ['request_id', 'user_id', 'title', 'description', 'status', 'priority', 'assigned_to', 'created_at', 'updated_at']
      },
      ai_prompts: {
        pk: 'prompt_id',
        columns: ['prompt_id', 'user_id', 'prompt_text', 'response_text', 'created_at', 'updated_at']
      },
      file_versions: {
        pk: 'file_version_id',
        columns: ['file_version_id', 'user_id', 'file_name', 'file_path', 'created_at']
      },
      issues: {
        pk: 'issue_id',
        columns: ['issue_id', 'user_id', 'title', 'description', 'severity', 'status', 'created_at', 'updated_at']
      },
      problems_solved: {
        pk: 'solution_id',
        columns: ['solution_id', 'issue_id', 'user_id', 'solution_description', 'created_at']
      }
    };

    for (const [tableName, expected] of Object.entries(apiExpectations)) {
      console.log(`\n🔍 Checking: ${tableName}`);
      console.log('─'.repeat(60));

      if (!tableNames.includes(tableName)) {
        console.log('   ❌ TABLE DOES NOT EXIST');
        issues.push({
          table: tableName,
          issue: 'Table missing',
          severity: 'CRITICAL',
          fix: `CREATE TABLE ${tableName} (...)`
        });
        continue;
      }

      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      const actualColumns = columns.map(col => col.Field);
      const pkColumn = columns.find(col => col.Key === 'PRI');

      // Check primary key
      if (pkColumn?.Field !== expected.pk) {
        console.log(`   ❌ PRIMARY KEY MISMATCH:`);
        console.log(`      Expected: ${expected.pk}`);
        console.log(`      Found: ${pkColumn?.Field || 'none'}`);
        
        issues.push({
          table: tableName,
          issue: `Wrong PK: has "${pkColumn?.Field}", needs "${expected.pk}"`,
          severity: 'CRITICAL',
          fix: pkColumn?.Field === 'id' || pkColumn?.Field?.includes('_id') 
            ? `ALTER TABLE ${tableName} CHANGE ${pkColumn.Field} ${expected.pk} INT(11) AUTO_INCREMENT`
            : `Rename primary key from ${pkColumn?.Field} to ${expected.pk}`
        });
      } else {
        console.log(`   ✅ Primary Key: ${expected.pk}`);
      }

      // Check required columns
      const missingColumns = expected.columns.filter(col => !actualColumns.includes(col));
      if (missingColumns.length > 0) {
        console.log(`   ⚠️  MISSING COLUMNS: ${missingColumns.join(', ')}`);
        missingColumns.forEach(col => {
          issues.push({
            table: tableName,
            issue: `Missing column: ${col}`,
            severity: 'WARNING',
            fix: `ADD COLUMN ${col} (type needs to be determined)`
          });
        });
      }

      // Check for extra columns that might be wrong
      const extraColumns = actualColumns.filter(col => {
        // If column ends with _id but isn't in expected list, it might be wrong
        if (col.endsWith('_id') && !expected.columns.includes(col) && col !== expected.pk) {
          return false; // Foreign keys are OK
        }
        // Check if it's an old 'id' column that should be renamed
        if (col === 'id' && expected.pk !== 'id') {
          return true;
        }
        return false;
      });

      if (extraColumns.length > 0) {
        console.log(`   ⚠️  SUSPICIOUS COLUMNS: ${extraColumns.join(', ')}`);
      }

      // Check for 'id' column when PK should be specific
      if (actualColumns.includes('id') && expected.pk !== 'id') {
        issues.push({
          table: tableName,
          issue: `Has generic 'id' column, should be '${expected.pk}'`,
          severity: 'CRITICAL',
          fix: `ALTER TABLE ${tableName} CHANGE id ${expected.pk} INT(11) AUTO_INCREMENT`
        });
      }
    }

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 AUDIT SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
    const warnings = issues.filter(i => i.severity === 'WARNING');

    console.log(`Total Issues: ${issues.length}`);
    console.log(`🔴 Critical: ${criticalIssues.length}`);
    console.log(`🟡 Warnings: ${warnings.length}\n`);

    if (criticalIssues.length > 0) {
      console.log('🔴 CRITICAL ISSUES:\n');
      criticalIssues.forEach((issue, idx) => {
        console.log(`${idx + 1}. ${issue.table}`);
        console.log(`   Problem: ${issue.issue}`);
        console.log(`   Fix: ${issue.fix}\n`);
      });
    }

    if (warnings.length > 0) {
      console.log('🟡 WARNINGS:\n');
      warnings.forEach((issue, idx) => {
        console.log(`${idx + 1}. ${issue.table}: ${issue.issue}`);
      });
      console.log('');
    }

    // Generate fix SQL
    const fixSQL = generateFixSQL(issues);
    const fixPath = path.join(__dirname, '..', 'database', 'COMPREHENSIVE_FIX.sql');
    fs.writeFileSync(fixPath, fixSQL);
    console.log(`✅ Fix SQL generated: database/COMPREHENSIVE_FIX.sql\n`);

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      database: dbConfig.database,
      host: dbConfig.host,
      totalIssues: issues.length,
      critical: criticalIssues.length,
      warnings: warnings.length,
      issues: issues
    };

    const reportPath = path.join(__dirname, '..', 'SCHEMA_AUDIT_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ Detailed report: SCHEMA_AUDIT_REPORT.json\n`);

  } catch (error) {
    console.error('❌ Audit failed:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

function generateFixSQL(issues) {
  const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
  
  let sql = `-- COMPREHENSIVE SCHEMA FIX
-- Generated: ${new Date().toISOString()}
-- Database: ${dbConfig.database}
-- Host: ${dbConfig.host}

-- This script fixes all schema mismatches between API expectations and database reality

USE ${dbConfig.database};

`;

  // Group by table
  const byTable = {};
  criticalIssues.forEach(issue => {
    if (!byTable[issue.table]) byTable[issue.table] = [];
    byTable[issue.table].push(issue);
  });

  for (const [table, tableIssues] of Object.entries(byTable)) {
    sql += `\n-- Fix ${table}\n`;
    sql += `-- Issues: ${tableIssues.map(i => i.issue).join(', ')}\n`;
    
    tableIssues.forEach(issue => {
      // Handle primary key renames
      if (issue.issue.includes('Wrong PK')) {
        const match = issue.issue.match(/has "(.+?)", needs "(.+?)"/);
        if (match) {
          const [, oldPK, newPK] = match;
          sql += `ALTER TABLE ${table} CHANGE ${oldPK} ${newPK} INT(11) AUTO_INCREMENT;\n`;
        }
      } else if (issue.issue.includes("generic 'id'")) {
        const match = issue.issue.match(/should be '(.+?)'/);
        if (match) {
          const [, newPK] = match;
          sql += `ALTER TABLE ${table} CHANGE id ${newPK} INT(11) AUTO_INCREMENT;\n`;
        }
      }
    });
  }

  sql += `\n-- Verify fixes\n`;
  Object.keys(byTable).forEach(table => {
    sql += `DESCRIBE ${table};\n`;
  });

  sql += `\n-- End of fixes\n`;
  
  return sql;
}

auditSchema();

