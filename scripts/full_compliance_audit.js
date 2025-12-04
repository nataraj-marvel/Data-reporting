// Full Database Compliance Audit - Check ALL tables against requirements
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
console.log('║     🔍 FULL DATABASE COMPLIANCE AUDIT                    ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Define complete expected schema for ALL tables
const expectedSchema = {
  users: {
    pk: 'user_id',
    columns: {
      user_id: 'INT(11) AUTO_INCREMENT',
      username: 'VARCHAR(50) NOT NULL',
      password_hash: 'VARCHAR(255) NOT NULL',
      role: "ENUM('admin','manager','programmer') NOT NULL",
      full_name: 'VARCHAR(100) NOT NULL',
      email: 'VARCHAR(100) NOT NULL',
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      last_login: 'TIMESTAMP NULL',
      is_active: 'TINYINT(1) DEFAULT 1'
    }
  },
  daily_reports: {
    pk: 'report_id',
    columns: {
      report_id: 'INT(11) AUTO_INCREMENT',
      user_id: 'INT(11) NOT NULL',
      report_date: 'DATE NOT NULL',
      work_description: 'TEXT NOT NULL',
      hours_worked: 'DECIMAL(4,2) NOT NULL',
      tasks_completed: 'TEXT NULL',
      issues_found: 'TEXT NULL',        // MISSING!
      issues_solved: 'TEXT NULL',       // MISSING!
      blockers: 'TEXT NULL',
      notes: 'TEXT NULL',
      status: "ENUM('draft','submitted','reviewed') DEFAULT 'draft'",
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      submitted_at: 'TIMESTAMP NULL',
      reviewed_at: 'TIMESTAMP NULL',
      reviewed_by: 'INT(11) NULL',
      task_id: 'INT(11) NULL'
    }
  },
  tasks: {
    pk: 'task_id',
    columns: {
      task_id: 'INT(11) AUTO_INCREMENT',
      user_id: 'INT(11) NOT NULL',
      report_id: 'INT(11) NULL',
      request_id: 'INT(11) NULL',
      issue_id: 'INT(11) NULL',
      prompt_id: 'INT(11) NULL',
      title: 'VARCHAR(255) NOT NULL',
      description: 'TEXT NULL',
      status: "ENUM('pending','in_progress','blocked','review','completed','cancelled') DEFAULT 'pending'",
      priority: "ENUM('low','medium','high','critical') DEFAULT 'medium'",
      task_type: "ENUM('development','bugfix','testing','documentation','review','research','deployment','other') NULL",
      estimated_hours: 'DECIMAL(6,2) NULL',
      actual_hours: 'DECIMAL(6,2) NULL',
      completion_percentage: 'INT(11) DEFAULT 0',
      due_date: 'DATE NULL',
      started_at: 'TIMESTAMP NULL',
      completed_at: 'TIMESTAMP NULL',
      blocked_reason: 'TEXT NULL',
      parent_task_id: 'INT(11) NULL',
      assigned_to: 'INT(11) NULL',
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    }
  },
  requests: {
    pk: 'request_id',
    columns: {
      request_id: 'INT(11) AUTO_INCREMENT',
      user_id: 'INT(11) NOT NULL',
      report_id: 'INT(11) NULL',
      title: 'VARCHAR(255) NOT NULL',
      description: 'TEXT NOT NULL',
      request_type: "ENUM('feature','enhancement','refactor','documentation','infrastructure','other') NULL",
      priority: "ENUM('low','medium','high','critical') DEFAULT 'medium'",
      status: "ENUM('submitted','under_review','approved','in_progress','completed','rejected','on_hold') DEFAULT 'submitted'",
      acceptance_criteria: 'TEXT NULL',
      estimated_hours: 'DECIMAL(6,2) NULL',
      actual_hours: 'DECIMAL(6,2) NULL',
      assigned_to: 'INT(11) NULL',
      due_date: 'DATE NULL',
      completed_at: 'TIMESTAMP NULL',
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    }
  },
  ai_prompts: {
    pk: 'prompt_id',
    columns: {
      prompt_id: 'INT(11) AUTO_INCREMENT',
      user_id: 'INT(11) NOT NULL',
      report_id: 'INT(11) NULL',
      prompt_text: 'TEXT NOT NULL',
      response_text: 'LONGTEXT NULL',
      ai_model: 'VARCHAR(100) NULL',
      context_data: 'LONGTEXT NULL',
      category: "ENUM('debug','refactor','feature','documentation','test','optimization','review','other') NULL",
      effectiveness_rating: 'INT(11) NULL',
      tokens_used: 'INT(11) NULL',
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    }
  },
  file_versions: {
    pk: 'file_version_id',
    columns: {
      file_version_id: 'INT(11) AUTO_INCREMENT',
      user_id: 'INT(11) NOT NULL',
      file_path: 'VARCHAR(500) NOT NULL',
      file_name: 'VARCHAR(255) NOT NULL',
      version_number: 'INT(11) NULL',
      change_type: "ENUM('created','modified','deleted','renamed','moved') NULL",
      change_description: 'TEXT NULL',
      lines_added: 'INT(11) NULL',
      lines_removed: 'INT(11) NULL',
      commit_hash: 'VARCHAR(100) NULL',
      branch_name: 'VARCHAR(100) NULL',
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    }
  },
  issues: {
    pk: 'issue_id',
    columns: {
      issue_id: 'INT(11) AUTO_INCREMENT',
      user_id: 'INT(11) NOT NULL',
      report_id: 'INT(11) NULL',
      title: 'VARCHAR(255) NOT NULL',
      description: 'TEXT NOT NULL',
      severity: "ENUM('low','medium','high','critical') DEFAULT 'medium'",
      status: "ENUM('open','in_progress','resolved','closed','reopened') DEFAULT 'open'",
      resolution: 'TEXT NULL',
      resolved_at: 'TIMESTAMP NULL',
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    }
  },
  problems_solved: {
    pk: 'solution_id',
    columns: {
      solution_id: 'INT(11) AUTO_INCREMENT',
      issue_id: 'INT(11) NOT NULL',
      user_id: 'INT(11) NOT NULL',
      report_id: 'INT(11) NULL',
      solution_description: 'TEXT NOT NULL',
      solution_type: "ENUM('fix','workaround','documentation','other') NULL",
      time_spent: 'DECIMAL(4,2) NULL',
      effectiveness: "ENUM('low','medium','high') NULL",
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    }
  }
};

async function fullAudit() {
  let connection;
  const issues = [];
  const fixes = [];
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to:', dbConfig.host);
    console.log('📂 Database:', dbConfig.database, '\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 AUDITING ALL TABLES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const [tableName, expected] of Object.entries(expectedSchema)) {
      console.log(`\n🔍 Checking: ${tableName}`);
      console.log('─'.repeat(60));

      // Check if table exists
      const [tables] = await connection.query('SHOW TABLES LIKE ?', [tableName]);
      
      if (tables.length === 0) {
        console.log('   ❌ TABLE DOES NOT EXIST!');
        issues.push({
          table: tableName,
          issue: 'Table missing',
          severity: 'CRITICAL'
        });
        continue;
      }

      // Get table structure
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      const actualColumns = {};
      columns.forEach(col => {
        actualColumns[col.Field] = col;
      });

      const pkColumn = columns.find(col => col.Key === 'PRI');

      // Check primary key
      if (pkColumn?.Field !== expected.pk) {
        console.log(`   ❌ PRIMARY KEY: Expected ${expected.pk}, found ${pkColumn?.Field || 'none'}`);
        issues.push({
          table: tableName,
          issue: `Wrong PK: ${pkColumn?.Field} should be ${expected.pk}`,
          severity: 'CRITICAL'
        });
      } else {
        console.log(`   ✅ Primary Key: ${expected.pk}`);
      }

      // Check each expected column
      const missingColumns = [];
      for (const [colName, colDef] of Object.entries(expected.columns)) {
        if (!actualColumns[colName]) {
          missingColumns.push({ name: colName, definition: colDef });
        }
      }

      if (missingColumns.length > 0) {
        console.log(`   ❌ MISSING ${missingColumns.length} COLUMN(S):`);
        missingColumns.forEach(col => {
          console.log(`      • ${col.name}: ${col.definition}`);
          
          issues.push({
            table: tableName,
            issue: `Missing column: ${col.name}`,
            severity: 'HIGH'
          });

          // Generate fix
          fixes.push({
            table: tableName,
            column: col.name,
            sql: `ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.definition};`
          });
        });
      } else {
        console.log(`   ✅ All expected columns present (${Object.keys(expected.columns).length} columns)`);
      }
    }

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 AUDIT SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`Total Issues: ${issues.length}`);
    console.log(`🔴 Critical: ${issues.filter(i => i.severity === 'CRITICAL').length}`);
    console.log(`🟠 High: ${issues.filter(i => i.severity === 'HIGH').length}\n`);

    if (issues.length > 0) {
      console.log('❌ ISSUES FOUND:\n');
      issues.forEach((issue, idx) => {
        const icon = issue.severity === 'CRITICAL' ? '🔴' : '🟠';
        console.log(`${icon} ${idx + 1}. [${issue.severity}] ${issue.table}: ${issue.issue}`);
      });
      console.log('');
    }

    if (fixes.length > 0) {
      console.log(`\n🔧 ${fixes.length} FIX(ES) NEEDED:\n`);
      fixes.forEach((fix, idx) => {
        console.log(`${idx + 1}. ${fix.table}.${fix.column}`);
      });
      console.log('');

      // Generate fix SQL file
      let fixSQL = `-- FULL COMPLIANCE FIX
-- Generated: ${new Date().toISOString()}
-- Database: ${dbConfig.database}
-- Host: ${dbConfig.host}

USE ${dbConfig.database};

`;

      fixes.forEach(fix => {
        fixSQL += `-- Fix: ${fix.table}.${fix.column}\n`;
        fixSQL += `${fix.sql}\n\n`;
      });

      fixSQL += `-- Verify fixes\n`;
      const tables = [...new Set(fixes.map(f => f.table))];
      tables.forEach(table => {
        fixSQL += `DESCRIBE ${table};\n`;
      });

      const fixPath = path.join(__dirname, '..', 'database', 'FULL_COMPLIANCE_FIX.sql');
      fs.writeFileSync(fixPath, fixSQL);
      console.log(`✅ Fix SQL generated: database/FULL_COMPLIANCE_FIX.sql\n`);
    } else {
      console.log('✅ ALL TABLES COMPLIANT - No fixes needed!\n');
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      database: dbConfig.database,
      host: dbConfig.host,
      tablesAudited: Object.keys(expectedSchema).length,
      totalIssues: issues.length,
      critical: issues.filter(i => i.severity === 'CRITICAL').length,
      high: issues.filter(i => i.severity === 'HIGH').length,
      issues: issues,
      fixes: fixes
    };

    const reportPath = path.join(__dirname, '..', 'FULL_COMPLIANCE_AUDIT.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ Detailed report: FULL_COMPLIANCE_AUDIT.json\n`);

    return { issues, fixes };

  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    return null;
  } finally {
    if (connection) await connection.end();
  }
}

const result = await fullAudit();

if (result && result.fixes.length > 0) {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     ⚠️  FIXES NEEDED - Ready to apply?                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log('Next step: Run apply_compliance_fixes.js to apply all fixes\n');
  process.exit(1);
} else if (result) {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     ✅ ALL TABLES COMPLIANT!                             ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  process.exit(0);
}

