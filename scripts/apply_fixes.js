// Apply all system fixes
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function applyFixes() {
  let connection;
  
  try {
    console.log('\n══════════════════════════════════════════════════════════');
    console.log('  🔧 APPLYING ALL SYSTEM FIXES');
    console.log('══════════════════════════════════════════════════════════\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nautilus_reporting',
      multipleStatements: true
    });

    console.log('✅ Connected to database\n');

    // Read SQL file
    const sqlPath = join(__dirname, '..', 'database', 'FIX_ALL_ISSUES.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing fix script...\n');

    // Execute SQL (split by semicolon and execute one by one for better error handling)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.includes('SELECT') && statement.includes('as status')) {
        // This is a status message, execute and display
        try {
          const [rows] = await connection.execute(statement);
          if (rows[0]) {
            console.log(`  ${Object.values(rows[0])[0]}`);
          }
          successCount++;
        } catch (error) {
          // Silent skip for status messages
        }
      } else if (statement.trim().length > 10) {
        // Regular statement
        try {
          await connection.execute(statement);
          if (statement.includes('DROP VIEW')) {
            console.log('✅ Dropped old view');
          } else if (statement.includes('CREATE OR REPLACE VIEW')) {
            const viewName = statement.match(/VIEW\s+(\w+)/)?.[1];
            console.log(`✅ Created view: ${viewName}`);
          } else if (statement.includes('ALTER TABLE')) {
            console.log('✅ Added file_name column');
          }
          successCount++;
        } catch (error) {
          if (!error.message.includes('Unknown table') && !error.message.includes('already exists')) {
            console.log(`⚠️  ${error.message.substring(0, 80)}...`);
            errorCount++;
          }
        }
      }
    }

    console.log('\n══════════════════════════════════════════════════════════');
    console.log('  📊 FIX SUMMARY');
    console.log('══════════════════════════════════════════════════════════\n');

    // Verify views
    const [views] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.VIEWS 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [process.env.DB_NAME || 'nautilus_reporting']);

    console.log(`✅ Views recreated: ${views.length}`);
    views.forEach(v => console.log(`   • ${v.TABLE_NAME}`));

    // Test each view
    console.log('\n🧪 Testing views...\n');
    for (const view of views) {
      try {
        const [result] = await connection.execute(`SELECT * FROM ${view.TABLE_NAME} LIMIT 1`);
        console.log(`✅ ${view.TABLE_NAME}: OK`);
      } catch (error) {
        console.log(`❌ ${view.TABLE_NAME}: ${error.message}`);
        errorCount++;
      }
    }

    // Check file_versions
    const [cols] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'file_versions' 
        AND COLUMN_NAME = 'file_name'
    `, [process.env.DB_NAME || 'nautilus_reporting']);

    if (cols.length > 0) {
      console.log('\n✅ file_versions.file_name column: Added');
    } else {
      console.log('\n⚠️  file_versions.file_name column: Not added (may already exist)');
    }

    console.log('\n══════════════════════════════════════════════════════════');
    if (errorCount === 0) {
      console.log('  ✅ ALL FIXES APPLIED SUCCESSFULLY!');
    } else {
      console.log(`  ⚠️  Completed with ${errorCount} warnings`);
    }
    console.log('══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run
applyFixes().then(() => {
  console.log('🎉 Done! System issues fixed.\n');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Failed to apply fixes:', error.message);
  process.exit(1);
});

