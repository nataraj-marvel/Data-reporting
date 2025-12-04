// Apply daily_reports schema fix to remote database
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const remoteConfig = {
  host: '103.108.220.47',
  port: 3307,
  user: 'reporting',
  password: 'Reporting@2025',
  database: 'nautilus_reporting'
};

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     🔧 FIXING REMOTE daily_reports TABLE                 ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('📡 Target:', remoteConfig.host);
console.log('📂 Database:', remoteConfig.database);
console.log('\n⚠️  Will add 2 missing columns: start_time, end_time');
console.log('⏰ Waiting 3 seconds... Press Ctrl+C to cancel\n');

await new Promise(resolve => setTimeout(resolve, 3000));

async function applyFix() {
  let connection;
  
  try {
    connection = await mysql.createConnection(remoteConfig);
    console.log('✅ Connected!\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 APPLYING FIXES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Add start_time
    console.log('🔧 Adding start_time column...');
    try {
      await connection.query('ALTER TABLE daily_reports ADD COLUMN start_time TIME NULL');
      console.log('✅ start_time added\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  start_time already exists\n');
      } else {
        throw error;
      }
    }

    // Add end_time
    console.log('🔧 Adding end_time column...');
    try {
      await connection.query('ALTER TABLE daily_reports ADD COLUMN end_time TIME NULL');
      console.log('✅ end_time added\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  end_time already exists\n');
      } else {
        throw error;
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 VERIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const [columns] = await connection.query('DESCRIBE daily_reports');
    
    console.log(`Total columns: ${columns.length}`);
    console.log('\nChecking for required columns:');
    
    const required = ['start_time', 'end_time', 'issues_found', 'issues_solved'];
    required.forEach(col => {
      const exists = columns.find(c => c.Field === col);
      if (exists) {
        console.log(`  ✅ ${col}: ${exists.Type}`);
      } else {
        console.log(`  ❌ ${col}: MISSING`);
      }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 FINAL STATUS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const allPresent = required.every(col => columns.find(c => c.Field === col));
    
    if (allPresent) {
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║                                                           ║');
      console.log('║    ✅ daily_reports TABLE NOW COMPLETE! ✅               ║');
      console.log('║                                                           ║');
      console.log('╚═══════════════════════════════════════════════════════════╝\n');
      
      console.log('✅ All required columns present');
      console.log(`✅ Total columns: ${columns.length}`);
      console.log('\n🎯 Next steps:');
      console.log('   1. Restart your dev server');
      console.log('   2. Test reports create/list/view/edit');
      console.log('   3. Everything should work now!\n');
    } else {
      console.log('⚠️  Some columns still missing. Check errors above.\n');
    }

  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    console.error('Error code:', error.code);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed\n');
    }
  }
}

applyFix();

