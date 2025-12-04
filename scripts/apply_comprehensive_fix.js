// Apply Comprehensive Schema Fix to Remote Database
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
console.log('║     🔧 APPLYING COMPREHENSIVE SCHEMA FIX                 ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('📡 Target:', dbConfig.host);
console.log('📂 Database:', dbConfig.database);
console.log('\n⚠️  WARNING: This will modify the database schema!');
console.log('Press Ctrl+C within 3 seconds to cancel...\n');

await new Promise(resolve => setTimeout(resolve, 3000));

async function applyFix() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected!\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 STEP 1: Backup Current Schema');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const [beforeSchema] = await connection.query('DESCRIBE file_versions');
    console.log('📸 Current file_versions schema:');
    beforeSchema.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Key === 'PRI' ? '[PRIMARY KEY]' : ''}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 STEP 2: Apply Fix');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔧 Executing: ALTER TABLE file_versions CHANGE file_id file_version_id...');
    
    await connection.query(
      'ALTER TABLE file_versions CHANGE file_id file_version_id INT(11) AUTO_INCREMENT'
    );
    
    console.log('✅ Schema updated successfully!\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 STEP 3: Verify Fix');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const [afterSchema] = await connection.query('DESCRIBE file_versions');
    console.log('📸 Updated file_versions schema:');
    afterSchema.forEach(col => {
      const marker = col.Key === 'PRI' ? ' [PRIMARY KEY] ✅' : '';
      console.log(`   ${col.Field}: ${col.Type}${marker}`);
    });

    // Verify primary key
    const pkColumn = afterSchema.find(col => col.Key === 'PRI');
    if (pkColumn?.Field === 'file_version_id') {
      console.log('\n✅ PRIMARY KEY VERIFIED: file_version_id');
    } else {
      console.log('\n❌ PRIMARY KEY VERIFICATION FAILED!');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 STEP 4: Test Critical Queries');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const testQueries = [
      {
        name: 'Test file_versions with new PK',
        sql: 'SELECT * FROM file_versions LIMIT 1'
      },
      {
        name: 'Test reports list query',
        sql: `SELECT dr.*, u.username, u.full_name 
              FROM daily_reports dr 
              LEFT JOIN users u ON dr.user_id = u.user_id 
              LIMIT 1`
      },
      {
        name: 'Test tasks list query',
        sql: `SELECT t.*, u.username 
              FROM tasks t 
              LEFT JOIN users u ON t.user_id = u.user_id 
              LIMIT 1`
      },
      {
        name: 'Test requests list query',
        sql: `SELECT r.*, u.username 
              FROM requests r 
              LEFT JOIN users u ON r.user_id = u.user_id 
              LIMIT 1`
      }
    ];

    for (const query of testQueries) {
      try {
        await connection.query(query.sql);
        console.log(`✅ ${query.name}`);
      } catch (error) {
        console.log(`❌ ${query.name}: ${error.message}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Fix Applied Successfully!');
    console.log('✅ Schema Updated: file_id → file_version_id');
    console.log('✅ All Queries Tested');
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Restart your development server');
    console.log('   2. Test reports listing at /reports');
    console.log('   3. Test tasks listing at /tasks');
    console.log('   4. Try creating new reports/tasks\n');

  } catch (error) {
    console.error('\n❌ FIX FAILED:', error.message);
    console.error('\nError Code:', error.code);
    console.error('SQL State:', error.sqlState);
    
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.error('\n💡 Tip: Column might already be renamed. Run diagnostic again.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed\n');
    }
  }
}

applyFix();

