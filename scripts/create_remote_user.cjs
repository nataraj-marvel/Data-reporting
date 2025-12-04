// Create new user in remote database
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createUser() {
    console.log('\n👤 CREATING NEW USER IN REMOTE DATABASE');
    console.log('='.repeat(70));
    
    // Connect to remote database directly
    const connection = await mysql.createConnection({
        host: '103.108.220.47',
        port: 3307,
        user: 'reporting',
        password: 'Reporting@2025',
        database: 'nautilus_reporting'
    });

    try {
        console.log('✅ Connected to remote database: 103.108.220.47:3307');
        
        // 1. Check if user already exists
        console.log('\n📋 Step 1: Checking for existing user...');
        const [existing] = await connection.execute(
            'SELECT user_id, username, email FROM users WHERE username = ? OR email = ?',
            ['testuser', 'testuser@nautilus.local']
        );
        
        if (existing.length > 0) {
            console.log(`⚠️  User already exists: ${existing[0].username} (ID: ${existing[0].user_id})`);
            console.log('   Deleting old user...');
            await connection.execute('DELETE FROM users WHERE username = ?', ['testuser']);
            console.log('✅ Old user deleted');
        }

        // 2. Generate password hash
        console.log('\n🔑 Step 2: Generating password hash...');
        const password = 'Test@123';
        const passwordHash = await bcrypt.hash(password, 10);
        console.log(`✅ Password: ${password}`);
        console.log(`✅ Hash: ${passwordHash.substring(0, 30)}...`);

        // 3. Create new user
        console.log('\n💾 Step 3: Creating new user...');
        const [result] = await connection.execute(
            `INSERT INTO users (username, password_hash, role, full_name, email, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            ['testuser', passwordHash, 'programmer', 'Test User', 'testuser@nautilus.local', 1]
        );
        
        const newUserId = result.insertId;
        console.log(`✅ User created successfully!`);
        console.log(`   User ID: ${newUserId}`);
        console.log(`   Username: testuser`);
        console.log(`   Password: ${password}`);
        console.log(`   Role: programmer`);
        console.log(`   Email: testuser@nautilus.local`);

        // 4. Verify user
        console.log('\n🔍 Step 4: Verifying user...');
        const [users] = await connection.execute(
            'SELECT user_id, username, role, full_name, email, is_active FROM users WHERE user_id = ?',
            [newUserId]
        );
        
        if (users.length > 0) {
            console.log('✅ User verified:');
            console.log(JSON.stringify(users[0], null, 2));
        }

        // 5. Test password verification
        console.log('\n🔐 Step 5: Testing password verification...');
        const [testUser] = await connection.execute(
            'SELECT password_hash FROM users WHERE user_id = ?',
            [newUserId]
        );
        
        const isValid = await bcrypt.compare(password, testUser[0].password_hash);
        if (isValid) {
            console.log('✅ Password verification: SUCCESS!');
        } else {
            console.log('❌ Password verification: FAILED!');
        }

        console.log('\n' + '='.repeat(70));
        console.log('📋 USER CREDENTIALS FOR API LOGIN:');
        console.log('='.repeat(70));
        console.log(`Username: testuser`);
        console.log(`Password: ${password}`);
        console.log(`User ID: ${newUserId}`);
        console.log('='.repeat(70));

    } finally {
        await connection.end();
        console.log('\n✅ Complete\n');
    }
}

createUser().catch(err => {
    console.error('\n❌ Error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
});

