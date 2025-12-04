// Test password verification - NO DATABASE CHANGES
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testPassword() {
    console.log('\n🔍 Password Verification Test (READ ONLY)');
    console.log('='.repeat(50));
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'nautilus_reporting'
    });

    try {
        // Get admin user's password hash
        const [users] = await connection.execute(
            'SELECT user_id, username, password_hash FROM users WHERE username = ?',
            ['admin']
        );

        if (users.length === 0) {
            console.log('❌ Admin user not found');
            return;
        }

        const user = users[0];
        console.log(`\n✅ User found: ${user.username} (ID: ${user.user_id})`);
        console.log(`   Password hash: ${user.password_hash.substring(0, 29)}...`);

        // Test password
        const testPassword = 'admin123';
        console.log(`\n🔑 Testing password: "${testPassword}"`);
        
        const isValid = await bcrypt.compare(testPassword, user.password_hash);
        
        if (isValid) {
            console.log('✅ Password MATCHES! Login should work.');
        } else {
            console.log('❌ Password DOES NOT MATCH!');
            console.log('\n⚠️  The password hash in database does not match "admin123"');
            console.log('\n📋 To fix this, I need your CONFIRMATION to run:');
            console.log('   UPDATE users SET password_hash = <new_hash> WHERE username = "admin"');
            console.log('\n   This will reset the admin password to "admin123"');
            console.log('\n   Do you want me to do this? (Yes/No)');
        }

    } finally {
        await connection.end();
    }
}

testPassword().catch(err => {
    console.error('❌ Error:', err.message);
});

