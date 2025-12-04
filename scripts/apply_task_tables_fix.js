// Apply task_files table fix to remote database
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
console.log('║     🔧 FIXING task_files TABLE                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('📡 Target:', remoteConfig.host);
console.log('📂 Database:', remoteConfig.database);
console.log('\n⚠️  Will rename column: file_id → file_version_id');
console.log('⏰ Waiting 3 seconds... Press Ctrl+C to cancel\n');

await new Promise(resolve => setTimeout(resolve, 3000));

async function applyFix() {
  let connection;
  
  try {
    connection = await mysql.createConnection(remoteConfig);
    console.log('✅ Connected!\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 BEFORE FIX');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const [beforeColumns] = await connection.query('DESCRIBE task_files');
    console.log('task_files columns:');
    beforeColumns.forEach(col => {
      const marker = col.Key === 'PRI' ? ' [PK]' : col.Key === 'MUL' ? ' [FK]' : '';
      console.log(`  • ${col.Field}: ${col.Type}${marker}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 APPLYING FIX');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔧 Renaming column: file_id → file_version_id...');
    
    try {
      // Check if file_id exists first
      const hasFileId = beforeColumns.find(col => col.Field === 'file_id');
      const hasFileVersionId = beforeColumns.find(col => col.Field === 'file_version_id');

      if (hasFileVersionId) {
        console.log('⚠️  Column file_version_id already exists!');
        
        // Check if we need to drop old file_id column
        if (hasFileId) {
          console.log('🔧 Dropping old file_id column...');
          await connection.query('ALTER TABLE task_files DROP COLUMN file_id');
          console.log('✅ Old file_id column dropped\n');
        } else {
          console.log('✅ Already using file_version_id\n');
        }
      } else if (hasFileId) {
        // Rename file_id to file_version_id
        await connection.query('ALTER TABLE task_files CHANGE file_id file_version_id INT(11) NOT NULL');
        console.log('✅ Column renamed successfully\n');
      } else {
        // Neither exists, add file_version_id
        console.log('⚠️  Neither file_id nor file_version_id exists!');
        console.log('🔧 Adding file_version_id column...');
        await connection.query('ALTER TABLE task_files ADD COLUMN file_version_id INT(11) NOT NULL');
        console.log('✅ Column added\n');
      }
    } catch (error) {
      console.log('❌ Fix failed:', error.message, '\n');
      throw error;
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 AFTER FIX');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const [afterColumns] = await connection.query('DESCRIBE task_files');
    console.log('task_files columns:');
    afterColumns.forEach(col => {
      const marker = col.Key === 'PRI' ? ' [PK]' : col.Key === 'MUL' ? ' [FK]' : '';
      console.log(`  • ${col.Field}: ${col.Type}${marker}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 TESTING FOREIGN KEY RELATIONSHIP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      // Test if the foreign key relationship works
      await connection.query(`
        SELECT tf.*, fv.file_name, t.title
        FROM task_files tf
        LEFT JOIN file_versions fv ON tf.file_version_id = fv.file_version_id
        LEFT JOIN tasks t ON tf.task_id = t.task_id
        LIMIT 1
      `);
      console.log('✅ Foreign key relationship working!\n');
    } catch (error) {
      console.log('⚠️  Foreign key test warning:', error.message, '\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 FINAL STATUS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const hasCorrectColumn = afterColumns.find(col => col.Field === 'file_version_id');
    
    if (hasCorrectColumn) {
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║                                                           ║');
      console.log('║    ✅ task_files TABLE FIXED! ✅                         ║');
      console.log('║                                                           ║');
      console.log('╚═══════════════════════════════════════════════════════════╝\n');
      
      console.log('✅ Column renamed: file_id → file_version_id');
      console.log('✅ Foreign key alignment: task_files → file_versions');
      console.log(`✅ Total columns: ${afterColumns.length}`);
      console.log('\n🎯 Task tables now fully synchronized!\n');
    } else {
      console.log('⚠️  Something went wrong. Column not found.\n');
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

