// Compare local and remote daily_reports table structure
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Remote DB config (from .env)
const remoteConfig = {
  host: '103.108.220.47',
  port: 3307,
  user: 'reporting',
  password: 'Reporting@2025',
  database: 'nautilus_reporting'
};

// Local DB config (assuming standard local setup)
const localConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'nautilus_reporting'
};

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     🔍 COMPARING LOCAL vs REMOTE SCHEMA                  ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

async function compareSchemas() {
  let localConn, remoteConn;
  
  try {
    // Connect to local
    console.log('📡 Connecting to LOCAL database...');
    try {
      localConn = await mysql.createConnection(localConfig);
      console.log('✅ Local connection successful\n');
    } catch (error) {
      console.log('❌ Local connection failed:', error.message);
      console.log('⚠️  Will check against expected schema instead\n');
    }

    // Connect to remote
    console.log('📡 Connecting to REMOTE database...');
    remoteConn = await mysql.createConnection(remoteConfig);
    console.log('✅ Remote connection successful\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 COMPARING daily_reports TABLE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let localColumns = [];
    
    if (localConn) {
      const [cols] = await localConn.query('DESCRIBE daily_reports');
      localColumns = cols;
      console.log(`📊 LOCAL has ${localColumns.length} columns:`);
      localColumns.forEach(col => {
        console.log(`   • ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
    } else {
      // Use expected schema from codebase
      console.log('📊 EXPECTED SCHEMA (from codebase):');
      console.log('   • report_id: INT(11) NOT NULL AUTO_INCREMENT');
      console.log('   • user_id: INT(11) NOT NULL');
      console.log('   • report_date: DATE NOT NULL');
      console.log('   • work_description: TEXT NOT NULL');
      console.log('   • hours_worked: DECIMAL(4,2) NOT NULL');
      console.log('   • tasks_completed: TEXT NULL');
      console.log('   • issues_found: TEXT NULL');
      console.log('   • issues_solved: TEXT NULL');
      console.log('   • blockers: TEXT NULL');
      console.log('   • notes: TEXT NULL');
      console.log('   • status: ENUM(...) DEFAULT draft');
      console.log('   • created_at: TIMESTAMP');
      console.log('   • updated_at: TIMESTAMP');
      console.log('   • submitted_at: TIMESTAMP NULL');
      console.log('   • reviewed_at: TIMESTAMP NULL');
      console.log('   • reviewed_by: INT(11) NULL');
      console.log('   • start_time: TIME NULL');
      console.log('   • end_time: TIME NULL');
      console.log('   • task_id: INT(11) NULL');
    }

    console.log('\n');

    const [remoteColumns] = await remoteConn.query('DESCRIBE daily_reports');
    console.log(`📊 REMOTE has ${remoteColumns.length} columns:`);
    remoteColumns.forEach(col => {
      console.log(`   • ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 FINDING DIFFERENCES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Expected columns based on API usage
    const expectedColumns = [
      'report_id', 'user_id', 'report_date', 'work_description', 'hours_worked',
      'tasks_completed', 'issues_found', 'issues_solved', 'blockers', 'notes',
      'status', 'created_at', 'updated_at', 'submitted_at', 'reviewed_at',
      'reviewed_by', 'start_time', 'end_time', 'task_id'
    ];

    const remoteColumnNames = remoteColumns.map(c => c.Field);
    const missingInRemote = expectedColumns.filter(col => !remoteColumnNames.includes(col));
    const extraInRemote = remoteColumnNames.filter(col => !expectedColumns.includes(col));

    if (missingInRemote.length > 0) {
      console.log('❌ MISSING in REMOTE:');
      missingInRemote.forEach(col => {
        console.log(`   • ${col}`);
      });
      console.log('');
    }

    if (extraInRemote.length > 0) {
      console.log('⚠️  EXTRA in REMOTE (not in expected schema):');
      extraInRemote.forEach(col => {
        console.log(`   • ${col}`);
      });
      console.log('');
    }

    if (missingInRemote.length === 0 && extraInRemote.length === 0) {
      console.log('✅ Remote schema matches expected schema!\n');
    }

    // Generate fix SQL
    if (missingInRemote.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔧 GENERATING FIX SQL');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      let fixSQL = `-- FIX REMOTE daily_reports TABLE
-- Generated: ${new Date().toISOString()}
-- Database: ${remoteConfig.database}
-- Host: ${remoteConfig.host}

USE ${remoteConfig.database};

`;

      // Add missing columns based on type
      const columnDefinitions = {
        start_time: 'TIME NULL',
        end_time: 'TIME NULL',
        issues_found: 'TEXT NULL',
        issues_solved: 'TEXT NULL'
      };

      missingInRemote.forEach(col => {
        const def = columnDefinitions[col] || 'TEXT NULL';
        fixSQL += `-- Add missing column: ${col}\n`;
        fixSQL += `ALTER TABLE daily_reports ADD COLUMN ${col} ${def};\n\n`;
      });

      fixSQL += `-- Verify\nDESCRIBE daily_reports;\n`;

      const fixPath = path.join(__dirname, '..', 'database', 'FIX_REMOTE_DAILY_REPORTS.sql');
      fs.writeFileSync(fixPath, fixSQL);
      console.log(`✅ Fix SQL generated: database/FIX_REMOTE_DAILY_REPORTS.sql\n`);
      
      console.log('Preview of fixes:');
      console.log(fixSQL);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`Remote columns: ${remoteColumns.length}`);
    console.log(`Expected columns: ${expectedColumns.length}`);
    console.log(`Missing in remote: ${missingInRemote.length}`);
    console.log(`Extra in remote: ${extraInRemote.length}\n`);

    if (missingInRemote.length > 0) {
      console.log('⚠️  Action required: Run fix script to add missing columns\n');
      return { missing: missingInRemote, extra: extraInRemote };
    } else {
      console.log('✅ Remote database is up to date!\n');
      return { missing: [], extra: extraInRemote };
    }

  } catch (error) {
    console.error('❌ Comparison failed:', error.message);
    return null;
  } finally {
    if (localConn) await localConn.end();
    if (remoteConn) await remoteConn.end();
  }
}

const result = await compareSchemas();

if (result && result.missing.length > 0) {
  console.log('Next step: node scripts/apply_daily_reports_fix.js\n');
  process.exit(1);
} else if (result) {
  process.exit(0);
}

