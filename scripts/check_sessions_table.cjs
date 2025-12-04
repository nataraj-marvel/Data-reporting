// Check sessions table structure and data
const mysql = require('mysql2/promise');

async function checkSessions() {
    console.log('\n🔍 CHECKING SESSIONS TABLE');
    console.log('='.repeat(70));
    
    const connection = await mysql.createConnection({
        host: '103.108.220.47',
        port: 3307,
        user: 'reporting',
        password: 'Reporting@2025',
        database: 'nautilus_reporting'
    });

    try {
        // 1. Check table structure
        console.log('\n📋 Step 1: Table structure...');
        const [columns] = await connection.execute('SHOW COLUMNS FROM sessions');
        console.log('Columns:');
        columns.forEach(col => {
            const key = col.Key ? ` [${col.Key}]` : '';
            const extra = col.Extra ? ` (${col.Extra})` : '';
            console.log(`   - ${col.Field}: ${col.Type}${key}${extra}`);
        });
        
        // 2. Check for session_id = 0
        console.log('\n🔍 Step 2: Checking for session_id = 0...');
        const [zeroSessions] = await connection.execute(
            'SELECT * FROM sessions WHERE session_id = 0'
        );
        
        if (zeroSessions.length > 0) {
            console.log(`⚠️  Found ${zeroSessions.length} session(s) with session_id = 0:`);
            zeroSessions.forEach(s => {
                console.log(`   - User ID: ${s.user_id}, Token: ${s.token.substring(0, 20)}...`);
            });
            
            console.log('\n💾 Deleting sessions with session_id = 0...');
            await connection.execute('DELETE FROM sessions WHERE session_id = 0');
            console.log('✅ Deleted');
        } else {
            console.log('✅ No sessions with session_id = 0');
        }
        
        // 3. Check all sessions
        console.log('\n📊 Step 3: All sessions:');
        const [allSessions] = await connection.execute(
            'SELECT session_id, user_id, LEFT(token, 20) as token_start, expires_at FROM sessions ORDER BY session_id LIMIT 10'
        );
        
        if (allSessions.length === 0) {
            console.log('   No sessions found');
        } else {
            allSessions.forEach(s => {
                console.log(`   ID: ${s.session_id} | User: ${s.user_id} | Token: ${s.token_start}... | Expires: ${s.expires_at}`);
            });
        }
        
        // 4. Check for duplicate entries
        console.log('\n🔍 Step 4: Checking for duplicates...');
        const [duplicates] = await connection.execute(
            'SELECT session_id, COUNT(*) as count FROM sessions GROUP BY session_id HAVING count > 1'
        );
        
        if (duplicates.length > 0) {
            console.log(`⚠️  Found ${duplicates.length} duplicate session_id(s):`);
            duplicates.forEach(d => {
                console.log(`   - session_id ${d.session_id}: ${d.count} entries`);
            });
        } else {
            console.log('✅ No duplicate session_ids');
        }
        
        // 5. Clean up expired sessions
        console.log('\n🧹 Step 5: Cleaning expired sessions...');
        const [result] = await connection.execute(
            'DELETE FROM sessions WHERE expires_at < NOW()'
        );
        console.log(`✅ Deleted ${result.affectedRows} expired session(s)`);

    } finally {
        await connection.end();
        console.log('\n' + '='.repeat(70));
        console.log('✅ Check complete\n');
    }
}

checkSessions().catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
});

