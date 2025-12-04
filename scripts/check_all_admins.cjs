// Check ALL admin users in database - READ ONLY
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAllAdmins() {
    console.log('\n🔍 Checking ALL Admin Users (READ ONLY)');
    console.log('='.repeat(60));
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'nautilus_reporting'
    });

    try {
        // Get ALL users with admin role
        const [users] = await connection.execute(
            'SELECT user_id, username, role, full_name, email, is_active, LEFT(password_hash, 30) as password_start, created_at FROM users WHERE role = "admin" OR username = "admin" ORDER BY user_id'
        );

        console.log(`\n✅ Found ${users.length} admin user(s):\n`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. User ID: ${user.user_id}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
            console.log(`   Password Hash: ${user.password_start}...`);
            console.log(`   Created: ${user.created_at}`);
            console.log('');
        });

        // Check if there's a user_id = 0
        const [zeroUser] = await connection.execute(
            'SELECT * FROM users WHERE user_id = 0'
        );
        
        if (zeroUser.length > 0) {
            console.log('⚠️  WARNING: Found user with user_id = 0:');
            console.log(JSON.stringify(zeroUser[0], null, 2));
            console.log('\n❗ This is likely the problem!');
            console.log('   User ID 0 is invalid and should be deleted or fixed.');
            console.log('\n📋 To fix, I need your CONFIRMATION to run:');
            console.log('   DELETE FROM users WHERE user_id = 0;');
            console.log('\n   Do you want me to do this? (Yes/No)');
        }

    } finally {
        await connection.end();
    }
}

checkAllAdmins().catch(console.error);

