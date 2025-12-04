import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function migrateDatabase() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   REMOTE DATABASE SCHEMA MIGRATION                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nautilus_reporting',
    multipleStatements: true
  };

  console.log('📡 Target Database:');
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.user}\n`);

  let connection;
  
  try {
    console.log('🔌 Connecting to remote database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected!\n');

    // Read migration file
    const sqlFile = join(__dirname, '..', 'database', 'schema_update_remote.sql');
    console.log('📄 Reading migration file...');
    const sql = await readFile(sqlFile, 'utf-8');
    console.log('✅ Migration file loaded\n');

    // Backup check
    console.log('⚠️  WARNING: This will modify your database schema');
    console.log('   The changes are non-destructive, but it\'s recommended to backup first\n');

    // Execute migration
    console.log('🔧 Executing migration...');
    const [results] = await connection.query(sql);
    console.log('✅ Migration executed successfully!\n');

    // Verify the changes
    console.log('🔍 Verifying schema updates...\n');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME IN ('users', 'daily_reports', 'issues', 'problems_solved', 'data_uploads', 'sessions', 'tasks')
        AND COLUMN_KEY = 'PRI'
      ORDER BY TABLE_NAME
    `, [config.database]);

    console.log('Primary Keys Updated:');
    console.log('─────────────────────────────────────────────────────');
    tables.forEach(row => {
      console.log(`✓ ${row.TABLE_NAME.padEnd(20)} → ${row.COLUMN_NAME}`);
    });
    console.log('');

    // Test a query
    console.log('🧪 Testing API compatibility...');
    const [testUser] = await connection.query('SELECT user_id, username FROM users LIMIT 1');
    if (testUser.length > 0) {
      console.log(`✅ Query successful: Found user "${testUser[0].username}" (ID: ${testUser[0].user_id})\n`);
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   ✅ MIGRATION COMPLETED SUCCESSFULLY!                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('💡 Next steps:');
    console.log('   1. Restart your Next.js development server');
    console.log('   2. Try logging in again');
    console.log('   3. Dashboard should now load correctly\n');

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED!\n');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Code:', error.code);
    }
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Ensure you have ALTER TABLE permissions');
    console.error('   2. Check if foreign keys can be dropped');
    console.error('   3. Verify database connection settings');
    console.error('   4. Contact DBA if you lack necessary permissions\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed.\n');
    }
  }
}

migrateDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

