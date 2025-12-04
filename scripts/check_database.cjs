// Check Database - READ ONLY (No changes)
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
    console.log('\n📊 DATABASE CHECK (READ ONLY - NO CHANGES)');
    console.log('='.repeat(50));
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'nautilus_reporting'
    });

    try {
        // Check admin user
        const [users] = await connection.execute(
            'SELECT user_id, username, role, full_name, email, is_active, LEFT(password_hash, 20) as password_start FROM users WHERE username = ?',
            ['admin']
        );

        console.log('\n✅ Admin User Found:');
        console.log(JSON.stringify(users[0], null, 2));

        // Check table structure
        const [columns] = await connection.execute(
            "SHOW COLUMNS FROM users WHERE Field IN ('id', 'user_id')"
        );

        console.log('\n✅ Users Table Primary Key Column:');
        console.log(columns);

        // Count reports
        const [reportCount] = await connection.execute(
            'SELECT COUNT(*) as count FROM daily_reports'
        );
        console.log(`\n✅ Total Reports: ${reportCount[0].count}`);

    } finally {
        await connection.end();
        console.log('\n' + '='.repeat(50));
        console.log('✅ Database check complete (no changes made)\n');
    }
}

checkDatabase().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});

