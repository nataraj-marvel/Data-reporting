// Fix v_file_activity view to use new file_version_id
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     🔧 FIXING v_file_activity VIEW                       ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

async function fixView() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected!\n');

    console.log('🔍 Step 1: Dropping old view...');
    await connection.query('DROP VIEW IF EXISTS v_file_activity');
    console.log('✅ Old view dropped\n');

    console.log('🔧 Step 2: Creating new view with file_version_id...');
    
    const createViewSQL = `
CREATE VIEW v_file_activity AS
SELECT 
    fv.file_version_id,
    fv.file_name,
    fv.file_path,
    fv.change_type,
    fv.change_description,
    fv.lines_added,
    fv.lines_removed,
    fv.commit_hash,
    fv.branch_name,
    fv.created_at,
    u.user_id,
    u.username,
    u.full_name
FROM file_versions fv
LEFT JOIN users u ON fv.user_id = u.user_id;
`;

    await connection.query(createViewSQL);
    console.log('✅ New view created successfully!\n');

    console.log('🧪 Step 3: Testing view...');
    const [result] = await connection.query('SELECT * FROM v_file_activity LIMIT 1');
    console.log('✅ View is working!\n');

    if (result.length > 0) {
      console.log('📊 Sample columns:', Object.keys(result[0]).join(', '));
    } else {
      console.log('📊 View structure verified (no data yet)');
    }

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║         ✅ v_file_activity VIEW FIXED! ✅               ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('❌ Failed:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

fixView();

