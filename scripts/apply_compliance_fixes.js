// Apply Full Compliance Fixes to Remote Database
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
console.log('║     🔧 APPLYING FULL COMPLIANCE FIXES                    ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('📡 Target:', dbConfig.host);
console.log('📂 Database:', dbConfig.database);
console.log('\n⚠️  This will add 5 missing columns to 3 tables');
console.log('⏰ Waiting 3 seconds... Press Ctrl+C to cancel\n');

await new Promise(resolve => setTimeout(resolve, 3000));

async function applyFixes() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected!\n');

    // Load audit report
    const reportPath = path.join(__dirname, '..', 'FULL_COMPLIANCE_AUDIT.json');
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 FIXES TO APPLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    report.fixes.forEach((fix, idx) => {
      console.log(`${idx + 1}. ${fix.table}.${fix.column}`);
      console.log(`   SQL: ${fix.sql.trim()}\n`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 APPLYING FIXES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let successCount = 0;
    let failCount = 0;

    for (const fix of report.fixes) {
      try {
        console.log(`🔧 Adding ${fix.table}.${fix.column}...`);
        await connection.query(fix.sql);
        console.log(`✅ Success\n`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed: ${error.message}\n`);
        failCount++;
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 VERIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verify each table
    const tables = ['daily_reports', 'issues', 'problems_solved'];
    
    for (const table of tables) {
      console.log(`\n📊 ${table}:`);
      const [columns] = await connection.query(`DESCRIBE ${table}`);
      
      const relevantColumns = columns.filter(col => 
        col.Field === 'issues_found' || 
        col.Field === 'issues_solved' || 
        col.Field === 'resolution' ||
        col.Field === 'solution_type' ||
        col.Field === 'effectiveness'
      );

      if (relevantColumns.length > 0) {
        relevantColumns.forEach(col => {
          console.log(`   ✅ ${col.Field}: ${col.Type}`);
        });
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 FINAL SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`✅ Successful: ${successCount}/${report.fixes.length}`);
    console.log(`❌ Failed: ${failCount}/${report.fixes.length}`);

    if (successCount === report.fixes.length) {
      console.log('\n╔═══════════════════════════════════════════════════════════╗');
      console.log('║                                                           ║');
      console.log('║    ✅ ALL FIXES APPLIED SUCCESSFULLY! ✅                 ║');
      console.log('║                                                           ║');
      console.log('╚═══════════════════════════════════════════════════════════╝\n');
      
      console.log('🎯 Database is now fully compliant!\n');
      console.log('📋 Next steps:');
      console.log('   1. Restart your dev server if running');
      console.log('   2. Test reports create/list/view/edit');
      console.log('   3. All internal server errors should be gone!\n');
    } else {
      console.log('\n⚠️  Some fixes failed. Check errors above.\n');
    }

  } catch (error) {
    console.error('\n❌ Application failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed\n');
    }
  }
}

applyFixes();

