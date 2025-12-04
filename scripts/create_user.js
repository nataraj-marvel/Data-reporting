// Script to create a user in the database
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createUser() {
  console.log('\n========================================');
  console.log('👤 Create New User');
  console.log('========================================\n');

  let connection;
  
  try {
    // Connect to database
    console.log('📡 Connecting to database...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nautilus_reporting',
    });

    console.log('✅ Connected successfully!\n');

    // Get user input
    const username = await question('Enter username: ');
    if (!username || username.trim() === '') {
      console.log('❌ Username is required!');
      process.exit(1);
    }

    // Check if username already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      console.log(`\n❌ Username "${username}" already exists!`);
      console.log('Please choose a different username.\n');
      process.exit(1);
    }

    const password = await question('Enter password: ');
    if (!password || password.trim() === '') {
      console.log('❌ Password is required!');
      process.exit(1);
    }

    const fullName = await question('Enter full name: ');
    if (!fullName || fullName.trim() === '') {
      console.log('❌ Full name is required!');
      process.exit(1);
    }

    const email = await question('Enter email: ');
    if (!email || email.trim() === '') {
      console.log('❌ Email is required!');
      process.exit(1);
    }

    const roleInput = await question('Enter role (admin/manager/programmer) [programmer]: ');
    const role = roleInput.trim() || 'programmer';
    
    if (!['admin', 'manager', 'programmer'].includes(role)) {
      console.log('❌ Invalid role! Must be: admin, manager, or programmer');
      process.exit(1);
    }

    console.log('\n🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('💾 Creating user...\n');

    const [result] = await connection.execute(
      `INSERT INTO users (username, password_hash, role, full_name, email, is_active) 
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [username, passwordHash, role, fullName, email]
    );

    console.log('✅ User created successfully!\n');
    console.log('User Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   ID: ${result.insertId}`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Full Name: ${fullName}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: ${role}`);
    console.log(`   Active: Yes`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 You can now log in with these credentials!\n');
    console.log(`   Login URL: http://localhost:3000/login`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('email')) {
        console.error('\n⚠️  Email already exists in database');
      } else if (error.message.includes('username')) {
        console.error('\n⚠️  Username already exists in database');
      }
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  Database connection failed: Access denied');
      console.error('   Check your DB_USER and DB_PASSWORD in .env.local');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Database connection failed: Connection refused');
      console.error('   Make sure MySQL is running');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n⚠️  Database not found');
      console.error('   Run the schema.sql file to create the database');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
    rl.close();
  }
}

// Usage instructions
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('\nUsage:');
  console.log('  node scripts/create_user.js');
  console.log('\nThe script will prompt you for:');
  console.log('  - Username');
  console.log('  - Password');
  console.log('  - Full Name');
  console.log('  - Email');
  console.log('  - Role (admin/manager/programmer)');
  console.log('');
  process.exit(0);
}

createUser();

