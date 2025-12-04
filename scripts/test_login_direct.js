// Direct login test against database
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function testLogin() {
  console.log('\n========================================');
  console.log('🔐 Testing Login Credentials');
  console.log('========================================\n');

  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nautilus_reporting',
    });

    console.log('✅ Connected to database\n');

    // Get the admin user
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      ['admin']
    );

    if (users.length === 0) {
      console.log('❌ Admin user not found!\n');
      return;
    }

    const user = users[0];
    console.log('👤 Found user:');
    console.log(`   Username: ${user.username}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
    console.log(`   Email: ${user.email}\n`);

    // Test common passwords
    const testPasswords = ['admin123', 'password', 'admin', '123456', 'admin@123'];
    
    console.log('🔑 Testing common passwords...\n');
    
    for (const testPassword of testPasswords) {
      try {
        const isValid = await bcrypt.compare(testPassword, user.password_hash);
        if (isValid) {
          console.log(`✅ SUCCESS! Password is: "${testPassword}"\n`);
          console.log('═══════════════════════════════════════════');
          console.log('   LOGIN CREDENTIALS:');
          console.log('═══════════════════════════════════════════');
          console.log(`   Username: ${user.username}`);
          console.log(`   Password: ${testPassword}`);
          console.log('═══════════════════════════════════════════\n');
          return;
        } else {
          console.log(`❌ Not: "${testPassword}"`);
        }
      } catch (error) {
        console.log(`⚠️  Error testing "${testPassword}": ${error.message}`);
      }
    }

    console.log('\n❌ None of the common passwords worked.\n');
    console.log('💡 You may need to reset the password.');
    console.log('   Run: node scripts/reset_admin_password.js\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testLogin();

