// Script to diagnose database structure
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

async function diagnoseDatabaseStructure() {
  console.log('\n========================================');
  console.log('🔍 Database Structure Diagnosis');
  console.log('========================================\n');

  let connection;
  
  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || '3306'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'nautilus_reporting'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}\n`);

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nautilus_reporting',
    });

    console.log('✅ Connected successfully!\n');

    // List all tables
    console.log('📊 Tables in database:\n');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found in database!\n');
      return;
    }

    const tableKey = Object.keys(tables[0])[0];
    console.log(`Found ${tables.length} table(s):`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table[tableKey]}`);
    });
    console.log('');

    // Check users table structure
    console.log('👤 USERS TABLE STRUCTURE:\n');
    try {
      const [columns] = await connection.execute(
        `SELECT 
          COLUMN_NAME, 
          COLUMN_TYPE, 
          IS_NULLABLE,
          COLUMN_KEY,
          COLUMN_DEFAULT,
          EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
        ORDER BY ORDINAL_POSITION`,
        [process.env.DB_NAME || 'nautilus_reporting']
      );

      if (columns.length === 0) {
        console.log('❌ Users table not found!\n');
      } else {
        console.log('┌─────────────────┬──────────────────────┬──────────┬─────────┐');
        console.log('│ Column Name     │ Type                 │ Nullable │ Key     │');
        console.log('├─────────────────┼──────────────────────┼──────────┼─────────┤');
        
        columns.forEach(col => {
          const name = String(col.COLUMN_NAME).padEnd(15);
          const type = String(col.COLUMN_TYPE).padEnd(20);
          const nullable = String(col.IS_NULLABLE).padEnd(8);
          const key = String(col.COLUMN_KEY || '').padEnd(7);
          
          console.log(`│ ${name} │ ${type} │ ${nullable} │ ${key} │`);
        });
        
        console.log('└─────────────────┴──────────────────────┴──────────┴─────────┘\n');

        // Find the primary key
        const primaryKey = columns.find(col => col.COLUMN_KEY === 'PRI');
        if (primaryKey) {
          console.log(`✅ Primary Key: ${primaryKey.COLUMN_NAME}\n`);
        } else {
          console.log(`⚠️  No primary key found!\n`);
        }

        // Check for username column
        const usernameCol = columns.find(col => col.COLUMN_NAME === 'username');
        if (usernameCol) {
          console.log(`✅ Username column exists\n`);
        } else {
          console.log(`❌ Username column not found!\n`);
        }

        // Check for password column
        const passwordCol = columns.find(col => 
          col.COLUMN_NAME === 'password_hash' || 
          col.COLUMN_NAME === 'password'
        );
        if (passwordCol) {
          console.log(`✅ Password column: ${passwordCol.COLUMN_NAME}\n`);
        } else {
          console.log(`❌ Password column not found!\n`);
        }
      }

      // Try to count users
      console.log('📊 User Count:\n');
      const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM users');
      const userCount = countResult[0].total;
      console.log(`   Total users: ${userCount}\n`);

      if (userCount > 0) {
        // Try to fetch first user to see actual structure
        console.log('👤 Sample User Record:\n');
        const [sampleUsers] = await connection.execute('SELECT * FROM users LIMIT 1');
        if (sampleUsers.length > 0) {
          const user = sampleUsers[0];
          console.log('   Columns found in actual data:');
          Object.keys(user).forEach(key => {
            const value = user[key];
            const type = typeof value;
            const display = type === 'string' && key.includes('password') ? '[HIDDEN]' : 
                           type === 'string' ? `"${value}"` :
                           value;
            console.log(`      ${key}: ${display} (${type})`);
          });
          console.log('');
        }
      }

    } catch (error) {
      console.error('❌ Error checking users table:', error.message);
    }

    // Check daily_reports table structure
    console.log('\n📋 DAILY_REPORTS TABLE STRUCTURE:\n');
    try {
      const [columns] = await connection.execute(
        `SELECT 
          COLUMN_NAME, 
          COLUMN_TYPE, 
          COLUMN_KEY
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'daily_reports'
        ORDER BY ORDINAL_POSITION`,
        [process.env.DB_NAME || 'nautilus_reporting']
      );

      if (columns.length === 0) {
        console.log('❌ daily_reports table not found!\n');
      } else {
        console.log('   Key columns:');
        const primaryKey = columns.find(col => col.COLUMN_KEY === 'PRI');
        const foreignKeys = columns.filter(col => col.COLUMN_KEY === 'MUL');
        
        if (primaryKey) {
          console.log(`      Primary Key: ${primaryKey.COLUMN_NAME}`);
        }
        foreignKeys.forEach(fk => {
          console.log(`      Foreign Key: ${fk.COLUMN_NAME}`);
        });
        console.log('');
      }
    } catch (error) {
      console.error('❌ Error checking daily_reports table:', error.message);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  Database connection failed: Access denied');
      console.error('   Check your DB_USER and DB_PASSWORD in .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Database connection failed: Connection refused');
      console.error('   Make sure MySQL is running');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n⚠️  Database not found');
      console.error('   Check your DB_NAME in .env');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('📡 Database connection closed.\n');
    }
  }
}

diagnoseDatabaseStructure();

