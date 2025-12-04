// Compare all task-related tables between local and remote
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const remoteConfig = {
  host: '103.108.220.47',
  port: 3307,
  user: 'reporting',
  password: 'Reporting@2025',
  database: 'nautilus_reporting'
};

const localConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'nautilus_reporting'
};

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     🔍 COMPARING TASK-RELATED TABLES                     ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Task-related tables to check
const taskTables = [
  'tasks',
  'task_files',
  'task_dependencies'
];

async function compareTaskTables() {
  let localConn, remoteConn;
  const allIssues = [];
  const allFixes = [];
  
  try {
    // Connect to local
    console.log('📡 Connecting to LOCAL database...');
    try {
      localConn = await mysql.createConnection(localConfig);
      console.log('✅ Local connection successful\n');
    } catch (error) {
      console.log('❌ Local connection failed:', error.message);
      console.log('⚠️  Will use expected schema from codebase\n');
    }

    // Connect to remote
    console.log('📡 Connecting to REMOTE database...');
    remoteConn = await mysql.createConnection(remoteConfig);
    console.log('✅ Remote connection successful\n');

    // Get list of all tables in remote
    const [remoteTables] = await remoteConn.query('SHOW TABLES');
    const remoteTableNames = remoteTables.map(t => Object.values(t)[0]);
    
    console.log(`Found ${remoteTableNames.length} tables in remote database\n`);
    
    // Filter for task-related tables
    const actualTaskTables = remoteTableNames.filter(t => 
      t === 'tasks' || 
      t.startsWith('task_') || 
      t.includes('task')
    );
    
    console.log('📋 Task-related tables in remote:');
    actualTaskTables.forEach(t => console.log(`   • ${t}`));
    console.log('');

    // Compare each task-related table
    for (const tableName of actualTaskTables) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📊 Comparing: ${tableName}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Get local structure
      let localColumns = [];
      if (localConn) {
        try {
          const [cols] = await localConn.query(`DESCRIBE ${tableName}`);
          localColumns = cols;
          console.log(`LOCAL (${localColumns.length} columns):`);
          localColumns.forEach(col => {
            const pk = col.Key === 'PRI' ? ' [PK]' : '';
            const fk = col.Key === 'MUL' ? ' [FK]' : '';
            console.log(`   • ${col.Field}: ${col.Type}${pk}${fk}`);
          });
        } catch (error) {
          console.log(`⚠️  Table "${tableName}" not found in local DB`);
        }
      }
      
      console.log('');

      // Get remote structure
      const [remoteColumns] = await remoteConn.query(`DESCRIBE ${tableName}`);
      console.log(`REMOTE (${remoteColumns.length} columns):`);
      remoteColumns.forEach(col => {
        const pk = col.Key === 'PRI' ? ' [PK]' : '';
        const fk = col.Key === 'MUL' ? ' [FK]' : '';
        console.log(`   • ${col.Field}: ${col.Type}${pk}${fk}`);
      });

      // Compare
      if (localColumns.length > 0) {
        const localColumnNames = localColumns.map(c => c.Field);
        const remoteColumnNames = remoteColumns.map(c => c.Field);
        
        const missingInRemote = localColumnNames.filter(col => !remoteColumnNames.includes(col));
        const extraInRemote = remoteColumnNames.filter(col => !localColumnNames.includes(col));
        
        console.log('');
        
        if (missingInRemote.length > 0) {
          console.log('❌ MISSING in REMOTE:');
          missingInRemote.forEach(col => {
            const localCol = localColumns.find(c => c.Field === col);
            console.log(`   • ${col}: ${localCol.Type}`);
            
            allIssues.push({
              table: tableName,
              column: col,
              issue: 'Missing in remote',
              type: localCol.Type
            });
            
            allFixes.push({
              table: tableName,
              column: col,
              sql: `ALTER TABLE ${tableName} ADD COLUMN ${col} ${localCol.Type} ${localCol.Null === 'YES' ? 'NULL' : 'NOT NULL'}${localCol.Default ? ` DEFAULT ${localCol.Default}` : ''};`
            });
          });
          console.log('');
        }
        
        if (extraInRemote.length > 0) {
          console.log('⚠️  EXTRA in REMOTE (not in local):');
          extraInRemote.forEach(col => console.log(`   • ${col}`));
          console.log('');
        }
        
        if (missingInRemote.length === 0 && extraInRemote.length === 0) {
          console.log('✅ Schemas match perfectly!\n');
        }
      } else {
        console.log('\n⚠️  Cannot compare - table not in local database\n');
      }
    }

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 OVERALL SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`Task-related tables found: ${actualTaskTables.length}`);
    console.log(`Tables checked: ${actualTaskTables.length}`);
    console.log(`Issues found: ${allIssues.length}`);
    console.log(`Fixes needed: ${allFixes.length}\n`);

    if (allIssues.length > 0) {
      console.log('❌ ISSUES FOUND:\n');
      
      // Group by table
      const byTable = {};
      allIssues.forEach(issue => {
        if (!byTable[issue.table]) byTable[issue.table] = [];
        byTable[issue.table].push(issue);
      });
      
      Object.entries(byTable).forEach(([table, issues]) => {
        console.log(`🔴 ${table}: ${issues.length} missing column(s)`);
        issues.forEach(issue => {
          console.log(`   • ${issue.column}: ${issue.type}`);
        });
        console.log('');
      });
    }

    // Generate fix SQL
    if (allFixes.length > 0) {
      let fixSQL = `-- FIX TASK-RELATED TABLES SCHEMA
-- Generated: ${new Date().toISOString()}
-- Database: ${remoteConfig.database}
-- Host: ${remoteConfig.host}

USE ${remoteConfig.database};

`;

      // Group fixes by table
      const fixesByTable = {};
      allFixes.forEach(fix => {
        if (!fixesByTable[fix.table]) fixesByTable[fix.table] = [];
        fixesByTable[fix.table].push(fix);
      });

      Object.entries(fixesByTable).forEach(([table, fixes]) => {
        fixSQL += `\n-- Fix ${table} (${fixes.length} column${fixes.length !== 1 ? 's' : ''})\n`;
        fixes.forEach(fix => {
          fixSQL += `${fix.sql}\n`;
        });
      });

      fixSQL += `\n-- Verify fixes\n`;
      Object.keys(fixesByTable).forEach(table => {
        fixSQL += `DESCRIBE ${table};\n`;
      });

      const fixPath = path.join(__dirname, '..', 'database', 'FIX_TASK_TABLES.sql');
      fs.writeFileSync(fixPath, fixSQL);
      console.log(`✅ Fix SQL generated: database/FIX_TASK_TABLES.sql\n`);
      
      return { issues: allIssues, fixes: allFixes };
    } else {
      console.log('✅ ALL TASK TABLES SYNCHRONIZED!\n');
      return { issues: [], fixes: [] };
    }

  } catch (error) {
    console.error('❌ Comparison failed:', error.message);
    return null;
  } finally {
    if (localConn) await localConn.end();
    if (remoteConn) await remoteConn.end();
  }
}

const result = await compareTaskTables();

if (result && result.fixes.length > 0) {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     ⚠️  FIXES NEEDED                                      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log(`Next step: node scripts/apply_task_tables_fix.js\n`);
  process.exit(1);
} else if (result) {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     ✅ ALL TASK TABLES SYNCHRONIZED!                     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  process.exit(0);
}

