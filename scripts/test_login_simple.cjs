// Simple login test with bcrypt verification
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function testLogin() {
    console.log('\n🔐 Testing Login Flow\n');
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Step 1: Query user (same as API)
        console.log('1. Querying user...');
        const [users] = await connection.execute(
            'SELECT user_id, username, password_hash, role, full_name, email, is_active FROM users WHERE username = ? AND is_active = TRUE',
            ['admin']
        );
        
        if (users.length === 0) {
            console.log('❌ User not found');
            return;
        }
        
        const user = users[0];
        console.log(`✅ User found: ${user.username} (ID: ${user.user_id})`);
        console.log(`   Password hash: ${user.password_hash.substring(0, 30)}...`);
        
        // Step 2: Verify password
        console.log('\n2. Verifying password...');
        const testPassword = 'admin123';
        const isValid = await bcrypt.compare(testPassword, user.password_hash);
        
        if (isValid) {
            console.log(`✅ Password VALID! Login should work.`);
            console.log(`\n✅ Token data would be:`);
            console.log(`   - user_id: ${user.user_id}`);
            console.log(`   - username: ${user.username}`);
            console.log(`   - role: ${user.role}`);
        } else {
            console.log(`❌ Password INVALID!`);
            console.log(`\n⚠️  The password hash doesn't match "admin123"`);
        }
        
    } finally {
        await connection.end();
    }
}

testLogin().catch(console.error);

