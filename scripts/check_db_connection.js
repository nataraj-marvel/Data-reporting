import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function checkDatabase() {
  console.log('\n=== Database Connection Diagnostic ===\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nautilus_reporting',
  };

  console.log('📡 Connection Details:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Password: ${config.password ? '***SET***' : '***NOT SET***'}\n`);

  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connection successful!\n');

    // Check tables
    console.log('📊 Checking tables...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`   Found ${tables.length} tables:`);
    tables.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log(`   - ${tableName}`);
    });
    console.log('');

    // Check required v2.0 tables
    const requiredTables = [
      'users', 'daily_reports', 'issues', 'problems_solved', 
      'data_uploads', 'ai_prompts', 'requests', 'tasks', 'file_versions'
    ];
    
    console.log('🔍 Checking required tables...');
    const existingTableNames = tables.map(row => Object.values(row)[0]);
    let missingTables = [];
    
    requiredTables.forEach(table => {
      const exists = existingTableNames.includes(table);
      if (exists) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} - MISSING`);
        missingTables.push(table);
      }
    });
    console.log('');

    // Count records in each table
    console.log('📈 Record counts:');
    for (const tableName of existingTableNames) {
      try {
        const [result] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
        console.log(`   ${tableName}: ${result[0].count} records`);
      } catch (err) {
        console.log(`   ${tableName}: Error - ${err.message}`);
      }
    }
    console.log('');

    // Check users specifically
    if (existingTableNames.includes('users')) {
      console.log('👤 Users in database:');
      const [users] = await connection.query('SELECT user_id, username, email FROM users');
      users.forEach(user => {
        console.log(`   - User ID: ${user.user_id}, Username: ${user.username}, Email: ${user.email}`);
      });
      console.log('');
    }

    if (missingTables.length > 0) {
      console.log('⚠️  WARNING: Missing tables detected!');
      console.log('   You need to run the schema migration:');
      console.log('   - File: database/schema_v2_migration.sql');
      console.log('   - Or use MySQL Workbench to execute the migration\n');
    } else {
      console.log('✅ All required tables present!\n');
    }

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   SQL State:', error.sqlState);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if remote MySQL server is accessible');
    console.error('   2. Verify credentials in .env.local');
    console.error('   3. Check firewall rules');
    console.error('   4. Ensure database exists on remote server\n');
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed.\n');
    }
  }
}

checkDatabase().catch(console.error);

