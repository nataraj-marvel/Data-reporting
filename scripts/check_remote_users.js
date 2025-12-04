// Check what users exist in remote database
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
console.log('║     👥 CHECKING REMOTE DATABASE USERS                    ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

async function checkUsers() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to remote database');
    console.log(`Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`Database: ${dbConfig.database}\n`);

    const [users] = await connection.query('SELECT user_id, username, role, email, is_active FROM users');
    
    console.log(`Found ${users.length} user(s):\n`);
    
    users.forEach((user, idx) => {
      const status = user.is_active ? '✅ Active' : '❌ Inactive';
      console.log(`${idx + 1}. User ID: ${user.user_id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Status: ${status}\n`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 To login via API, use one of these usernames');
    console.log('   (password needs to be known/reset if forgotten)\n');

  } catch (error) {
    console.error('❌ Failed:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkUsers();

