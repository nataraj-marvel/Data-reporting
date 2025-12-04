// Fix remote database admin password to work with admin123
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixRemoteAdmin() {
    console.log('\n🔐 FIXING REMOTE ADMIN PASSWORD');
    console.log('='.repeat(70));
    
    const connection = await mysql.createConnection({
        host: '103.108.220.47',
        port: 3307,
        user: 'reporting',
        password: 'Reporting@2025',
        database: 'nautilus_reporting'
    });

    try {
        // 1. Generate new hash for admin123
        console.log('\n🔑 Step 1: Generating password hash for "admin123"...');
        const newHash = await bcrypt.hash('admin123', 10);
        console.log(`✅ Hash: ${newHash.substring(0, 30)}...`);

        // 2. Update admin user
        console.log('\n💾 Step 2: Updating admin password...');
        const [result] = await connection.execute(
            'UPDATE users SET password_hash = ? WHERE username = ? AND user_id = 1',
            [newHash, 'admin']
        );
        
        console.log(`✅ Updated ${result.affectedRows} row(s)`);

        // 3. Verify
        console.log('\n🔍 Step 3: Verifying...');
        const [users] = await connection.execute(
            'SELECT user_id, username, password_hash FROM users WHERE username = ?',
            ['admin']
        );
        
        if (users.length > 0) {
            const isValid = await bcrypt.compare('admin123', users[0].password_hash);
            if (isValid) {
                console.log('✅ Password verification: SUCCESS!');
                console.log('✅ Login should work now with admin/admin123');
            } else {
                console.log('❌ Password verification: FAILED!');
            }
        }

    } finally {
        await connection.end();
        console.log('\n' + '='.repeat(70));
        console.log('✅ Complete\n');
    }
}

fixRemoteAdmin().catch(console.error);

