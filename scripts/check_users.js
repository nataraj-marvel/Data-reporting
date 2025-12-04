// Script to check users in database
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

async function checkUsers() {
  console.log('\n========================================');
  console.log('🔍 Checking Users in Database');
  console.log('========================================\n');

  let connection;
  
  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: ${process.env.DB_PORT}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USER}\n`);

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nautilus_reporting',
    });

    console.log('✅ Connected successfully!\n');

    // Check all users
    const [users] = await connection.execute(
      'SELECT id, username, role, full_name, email, is_active, created_at FROM users'
    );

    if (users.length === 0) {
      console.log('⚠️  NO USERS FOUND IN DATABASE!\n');
      console.log('You need to create a user first.');
      console.log('Run: node scripts/create_user.js\n');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      console.log('┌─────┬──────────────┬───────────┬─────────────────────┬────────┐');
      console.log('│ ID  │ Username     │ Role      │ Full Name           │ Active │');
      console.log('├─────┼──────────────┼───────────┼─────────────────────┼────────┤');
      
      users.forEach(user => {
        const id = String(user.id).padEnd(3);
        const username = String(user.username).padEnd(12);
        const role = String(user.role).padEnd(9);
        const fullName = String(user.full_name).padEnd(19);
        const active = user.is_active ? '  ✓   ' : '  ✗   ';
        
        console.log(`│ ${id} │ ${username} │ ${role} │ ${fullName} │ ${active}│`);
      });
      
      console.log('└─────┴──────────────┴───────────┴─────────────────────┴────────┘\n');

      // Show inactive users
      const inactiveUsers = users.filter(u => !u.is_active);
      if (inactiveUsers.length > 0) {
        console.log('⚠️  Warning: Found inactive users:', inactiveUsers.map(u => u.username).join(', '));
        console.log('   Inactive users cannot log in.\n');
      }

      // Check for users without password hash
      const [usersWithoutPassword] = await connection.execute(
        "SELECT username FROM users WHERE password_hash IS NULL OR password_hash = ''"
      );

      if (usersWithoutPassword.length > 0) {
        console.log('⚠️  Warning: Users without password:');
        usersWithoutPassword.forEach(u => console.log(`   - ${u.username}`));
        console.log('\n');
      }
    }

    // Test a specific user (if you know the username)
    const testUsername = process.argv[2];
    if (testUsername) {
      console.log(`\n🔍 Testing user: ${testUsername}\n`);
      const [testUser] = await connection.execute(
        'SELECT id, username, role, full_name, email, is_active, LENGTH(password_hash) as password_length FROM users WHERE username = ?',
        [testUsername]
      );

      if (testUser.length === 0) {
        console.log(`❌ User "${testUsername}" not found!\n`);
      } else {
        const user = testUser[0];
        console.log('User details:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Full Name: ${user.full_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Active: ${user.is_active ? '✓ Yes' : '✗ No'}`);
        console.log(`   Password Hash Length: ${user.password_length} characters`);
        
        if (user.password_length === 0 || !user.password_length) {
          console.log('\n   ⚠️  WARNING: No password set for this user!');
        }
        
        if (!user.is_active) {
          console.log('\n   ⚠️  WARNING: User is inactive and cannot log in!');
        }
        
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
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
      console.log('📡 Database connection closed.\n');
    }
  }
}

// Usage instructions
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('\nUsage:');
  console.log('  node scripts/check_users.js              - List all users');
  console.log('  node scripts/check_users.js <username>   - Check specific user');
  console.log('\nExamples:');
  console.log('  node scripts/check_users.js');
  console.log('  node scripts/check_users.js admin');
  console.log('');
  process.exit(0);
}

checkUsers();

