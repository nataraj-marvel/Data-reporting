// Update remote database admin password
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function updatePassword() {
    console.log('\n🔐 UPDATING REMOTE DATABASE PASSWORD');
    console.log('='.repeat(70));
    console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log('='.repeat(70));
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // 1. Check current password hash
        console.log('\n📋 Step 1: Checking current admin user...');
        const [users] = await connection.execute(
            'SELECT user_id, username, LEFT(password_hash, 30) as pw_start FROM users WHERE username = ?',
            ['admin']
        );
        
        if (users.length === 0) {
            console.log('❌ Admin user not found!');
            return;
        }
        
        console.log(`✅ Found: ${users[0].username} (ID: ${users[0].user_id})`);
        console.log(`   Old hash: ${users[0].pw_start}...`);

        // 2. Generate new password hash
        console.log('\n🔑 Step 2: Generating new password hash for "admin123"...');
        const newHash = await bcrypt.hash('admin123', 10);
        console.log(`✅ New hash: ${newHash.substring(0, 30)}...`);

        // 3. Update password
        console.log('\n💾 Step 3: Updating password in remote database...');
        const [result] = await connection.execute(
            'UPDATE users SET password_hash = ? WHERE username = ?',
            [newHash, 'admin']
        );
        
        if (result.affectedRows > 0) {
            console.log(`✅ Password updated successfully! (${result.affectedRows} row affected)`);
        } else {
            console.log('❌ No rows updated!');
            return;
        }

        // 4. Verify update
        console.log('\n🔍 Step 4: Verifying password update...');
        const [updated] = await connection.execute(
            'SELECT user_id, username, password_hash FROM users WHERE username = ?',
            ['admin']
        );
        
        const isValid = await bcrypt.compare('admin123', updated[0].password_hash);
        
        if (isValid) {
            console.log('✅ Password verification: SUCCESS!');
            console.log('✅ Login with "admin" / "admin123" should now work!');
        } else {
            console.log('❌ Password verification: FAILED!');
        }

    } finally {
        await connection.end();
        console.log('\n' + '='.repeat(70));
        console.log('✅ Update complete\n');
    }
}

updatePassword().catch(err => {
    console.error('\n❌ Error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
});

