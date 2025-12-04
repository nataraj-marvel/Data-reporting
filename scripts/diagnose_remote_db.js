// Diagnose Remote Database Schema at 103.108.220.47
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '103.108.220.47',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
};

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     🔍 REMOTE DATABASE SCHEMA DIAGNOSTICS                ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('📡 Connecting to:', dbConfig.host);
console.log('📂 Database:', dbConfig.database);
console.log('👤 User:', dbConfig.user);
console.log('\n');

async function diagnose() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connection successful!\n');

    // 1. Check all tables
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 STEP 1: Checking Tables');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables:\n`);
    
    const tableNames = tables.map(t => Object.values(t)[0]);
    tableNames.forEach((table, idx) => {
      console.log(`   ${idx + 1}. ${table}`);
    });

    // 2. Check critical tables structure
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 STEP 2: Checking Critical Table Structures');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const criticalTables = ['users', 'daily_reports', 'tasks', 'requests', 'ai_prompts', 'file_versions'];
    
    for (const tableName of criticalTables) {
      if (tableNames.includes(tableName)) {
        console.log(`\n🔍 Table: ${tableName}`);
        console.log('─'.repeat(60));
        
        const [columns] = await connection.query(`DESCRIBE ${tableName}`);
        
        // Find primary key
        const pkColumn = columns.find(col => col.Key === 'PRI');
        if (pkColumn) {
          console.log(`   🔑 Primary Key: ${pkColumn.Field} (${pkColumn.Type})`);
        } else {
          console.log('   ❌ No primary key found!');
        }
        
        // Show all columns
        console.log('   📊 Columns:');
        columns.forEach(col => {
          const nullable = col.Null === 'YES' ? 'NULL' : 'NOT NULL';
          const key = col.Key ? ` [${col.Key}]` : '';
          console.log(`      • ${col.Field}: ${col.Type} ${nullable}${key}`);
        });

        // Check for common foreign keys
        console.log('   🔗 Checking foreign key columns:');
        const fkColumns = columns.filter(col => 
          col.Field.includes('_id') && col.Field !== pkColumn?.Field
        );
        if (fkColumns.length > 0) {
          fkColumns.forEach(col => {
            console.log(`      • ${col.Field}: ${col.Type}`);
          });
        } else {
          console.log('      • None found');
        }

      } else {
        console.log(`\n❌ Table: ${tableName} - NOT FOUND!`);
      }
    }

    // 3. Check for views
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 STEP 3: Checking Views');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const [views] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.VIEWS WHERE TABLE_SCHEMA = ?`,
      [dbConfig.database]
    );

    if (views.length > 0) {
      console.log(`✅ Found ${views.length} views:\n`);
      views.forEach((view, idx) => {
        console.log(`   ${idx + 1}. ${view.TABLE_NAME}`);
      });
    } else {
      console.log('⚠️  No views found');
    }

    // 4. Test critical queries
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 STEP 4: Testing Critical Queries');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const queries = [
      {
        name: 'Count Users',
        sql: 'SELECT COUNT(*) as count FROM users'
      },
      {
        name: 'Count Reports',
        sql: 'SELECT COUNT(*) as count FROM daily_reports'
      },
      {
        name: 'Count Tasks',
        sql: 'SELECT COUNT(*) as count FROM tasks'
      },
      {
        name: 'Get Latest Report (with user_id)',
        sql: `SELECT dr.*, u.username 
              FROM daily_reports dr 
              LEFT JOIN users u ON dr.user_id = u.user_id 
              LIMIT 1`
      },
      {
        name: 'Get Latest Task (with task_id)',
        sql: `SELECT t.*, u.username 
              FROM tasks t 
              LEFT JOIN users u ON t.user_id = u.user_id 
              LIMIT 1`
      }
    ];

    for (const query of queries) {
      try {
        console.log(`🧪 Testing: ${query.name}`);
        const [result] = await connection.query(query.sql);
        
        if (Array.isArray(result) && result.length > 0) {
          if (result[0].count !== undefined) {
            console.log(`   ✅ Result: ${result[0].count} records`);
          } else {
            console.log(`   ✅ Success - Sample columns:`, Object.keys(result[0]).slice(0, 5).join(', '));
          }
        } else {
          console.log(`   ⚠️  No data found`);
        }
      } catch (error) {
        console.log(`   ❌ FAILED: ${error.message}`);
      }
      console.log('');
    }

    // 5. Check for schema mismatches
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 STEP 5: Schema Validation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const expectedSchema = {
      users: { pk: 'user_id', columns: ['username', 'password_hash', 'email', 'full_name', 'role'] },
      daily_reports: { pk: 'report_id', columns: ['user_id', 'report_date', 'work_description', 'hours_worked'] },
      tasks: { pk: 'task_id', columns: ['user_id', 'title', 'description', 'status', 'priority'] },
      requests: { pk: 'request_id', columns: ['user_id', 'title', 'description', 'status'] },
      ai_prompts: { pk: 'prompt_id', columns: ['user_id', 'prompt_text', 'response_text'] },
      file_versions: { pk: 'file_version_id', columns: ['user_id', 'file_name', 'file_path'] }
    };

    const issues = [];

    for (const [tableName, expected] of Object.entries(expectedSchema)) {
      if (tableNames.includes(tableName)) {
        const [columns] = await connection.query(`DESCRIBE ${tableName}`);
        const pkColumn = columns.find(col => col.Key === 'PRI');
        
        // Check primary key
        if (pkColumn?.Field !== expected.pk) {
          issues.push({
            table: tableName,
            issue: `Wrong primary key: found "${pkColumn?.Field || 'none'}", expected "${expected.pk}"`,
            severity: 'CRITICAL'
          });
        }

        // Check required columns
        const actualColumns = columns.map(col => col.Field);
        const missingColumns = expected.columns.filter(col => !actualColumns.includes(col));
        
        if (missingColumns.length > 0) {
          issues.push({
            table: tableName,
            issue: `Missing columns: ${missingColumns.join(', ')}`,
            severity: 'WARNING'
          });
        }
      } else {
        issues.push({
          table: tableName,
          issue: 'Table does not exist',
          severity: 'CRITICAL'
        });
      }
    }

    if (issues.length > 0) {
      console.log('❌ ISSUES FOUND:\n');
      issues.forEach((issue, idx) => {
        const icon = issue.severity === 'CRITICAL' ? '🔴' : '🟡';
        console.log(`${icon} ${idx + 1}. [${issue.severity}] ${issue.table}`);
        console.log(`   ${issue.issue}\n`);
      });
    } else {
      console.log('✅ Schema validation passed! All tables match expected structure.\n');
    }

    // 6. Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`📊 Total Tables: ${tables.length}`);
    console.log(`👀 Total Views: ${views.length}`);
    console.log(`❌ Issues Found: ${issues.length}`);
    console.log(`🔴 Critical Issues: ${issues.filter(i => i.severity === 'CRITICAL').length}`);
    console.log(`🟡 Warnings: ${issues.filter(i => i.severity === 'WARNING').length}`);

    if (issues.length > 0) {
      console.log('\n⚠️  ACTION REQUIRED: Schema fixes needed for proper operation');
    } else {
      console.log('\n✅ Database is properly configured!');
    }

  } catch (error) {
    console.error('\n❌ DIAGNOSTIC FAILED:', error.message);
    console.error('\nError Details:', error.code || 'Unknown');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Tip: Check if database server is accessible');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Tip: Check database credentials in .env file');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connection closed\n');
    }
  }
}

diagnose();

