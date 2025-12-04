// Create testuser in LOCAL database
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

async function createLocalUser() {
    console.log('\n👤 CREATING TESTUSER IN LOCAL DATABASE');
    console.log('='.repeat(70));
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'nautilus_reporting'
    });

    try {
        console.log(`✅ Connected to: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
        
        // Check if user exists
        const [existing] = await connection.execute(
            'SELECT user_id, username FROM users WHERE username = ?',
            ['testuser']
        );
        
        if (existing.length > 0) {
            console.log(`\n⚠️  User 'testuser' already exists (ID: ${existing[0].user_id})`);
            console.log('   Deleting and recreating...');
            await connection.execute('DELETE FROM users WHERE username = ?', ['testuser']);
        }

        // Create user
        console.log('\n🔑 Creating new user...');
        const password = 'Test@123';
        const passwordHash = await bcrypt.hash(password, 10);
        
        const [result] = await connection.execute(
            `INSERT INTO users (username, password_hash, role, full_name, email, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            ['testuser', passwordHash, 'programmer', 'Test User', 'testuser@nautilus.local', 1]
        );
        
        console.log(`✅ User created!`);
        console.log(`   User ID: ${result.insertId}`);
        console.log(`   Username: testuser`);
        console.log(`   Password: ${password}`);
        console.log(`   Role: programmer`);
        
        // Verify
        console.log('\n🔍 Verifying...');
        const [users] = await connection.execute(
            'SELECT user_id, username, role, email FROM users WHERE username = ?',
            ['testuser']
        );
        
        if (users.length > 0) {
            console.log('✅ Verification successful!');
            console.log(JSON.stringify(users[0], null, 2));
        }

        // Show all users
        console.log('\n👥 All users in LOCAL database:');
        const [allUsers] = await connection.execute(
            'SELECT user_id, username, role, email FROM users ORDER BY user_id'
        );
        allUsers.forEach(u => {
            console.log(`   - ID: ${u.user_id} | ${u.username} | ${u.role} | ${u.email}`);
        });

    } finally {
        await connection.end();
        console.log('\n' + '='.repeat(70));
        console.log('✅ Complete\n');
    }
}

createLocalUser().catch(console.error);

