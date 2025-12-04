// Fix user_id = 0 issue in remote database
const mysql = require('mysql2/promise');

async function fixUserId() {
    console.log('\n🔧 FIXING user_id = 0 ISSUE IN REMOTE DATABASE');
    console.log('='.repeat(70));
    
    const connection = await mysql.createConnection({
        host: '103.108.220.47',
        port: 3307,
        user: 'reporting',
        password: 'Reporting@2025',
        database: 'nautilus_reporting'
    });

    try {
        console.log('✅ Connected to remote database');
        
        // 1. Check users table structure
        console.log('\n📋 Step 1: Checking users table structure...');
        const [columns] = await connection.execute('SHOW COLUMNS FROM users WHERE Field = "user_id"');
        console.log('user_id column:', columns[0]);
        
        // 2. Find all users with user_id = 0
        console.log('\n🔍 Step 2: Finding users with user_id = 0...');
        const [zeroUsers] = await connection.execute(
            'SELECT user_id, username, email FROM users WHERE user_id = 0'
        );
        
        console.log(`Found ${zeroUsers.length} user(s) with user_id = 0:`);
        zeroUsers.forEach(u => {
            console.log(`   - ${u.username} (${u.email})`);
        });
        
        if (zeroUsers.length === 0) {
            console.log('✅ No users with user_id = 0 found!');
            return;
        }
        
        // 3. Get next available user_id
        console.log('\n🔢 Step 3: Getting next available user_id...');
        const [maxId] = await connection.execute(
            'SELECT MAX(user_id) as max_id FROM users WHERE user_id > 0'
        );
        const nextId = (maxId[0].max_id || 0) + 1;
        console.log(`Next available user_id: ${nextId}`);
        
        // 4. Delete user with user_id = 0 and recreate with proper ID
        console.log('\n💾 Step 4: Fixing user...');
        
        for (const user of zeroUsers) {
            console.log(`\n   Processing: ${user.username}`);
            
            // Get full user data
            const [fullUser] = await connection.execute(
                'SELECT * FROM users WHERE user_id = 0 AND username = ?',
                [user.username]
            );
            
            if (fullUser.length === 0) continue;
            
            const userData = fullUser[0];
            
            // Delete old user
            console.log(`   - Deleting user with ID 0...`);
            await connection.execute('DELETE FROM users WHERE user_id = 0 AND username = ?', [user.username]);
            
            // Insert with proper ID
            console.log(`   - Creating user with ID ${nextId}...`);
            await connection.execute(
                `INSERT INTO users (user_id, username, password_hash, role, full_name, email, is_active, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [nextId, userData.username, userData.password_hash, userData.role, userData.full_name, userData.email, userData.is_active]
            );
            
            console.log(`   ✅ User recreated with user_id = ${nextId}`);
        }
        
        // 5. Verify fix
        console.log('\n🔍 Step 5: Verifying fix...');
        const [stillZero] = await connection.execute(
            'SELECT COUNT(*) as count FROM users WHERE user_id = 0'
        );
        
        if (stillZero[0].count === 0) {
            console.log('✅ All users fixed! No more user_id = 0');
        } else {
            console.log(`⚠️  Still ${stillZero[0].count} user(s) with user_id = 0`);
        }
        
        // 6. Show all users
        console.log('\n👥 Step 6: All users in database:');
        const [allUsers] = await connection.execute(
            'SELECT user_id, username, role, email FROM users ORDER BY user_id'
        );
        allUsers.forEach(u => {
            console.log(`   ID: ${u.user_id} | ${u.username} | ${u.role} | ${u.email}`);
        });

    } finally {
        await connection.end();
        console.log('\n' + '='.repeat(70));
        console.log('✅ Fix complete\n');
    }
}

fixUserId().catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
});

