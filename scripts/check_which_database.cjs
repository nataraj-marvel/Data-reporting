// Check which database the app is actually using
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
    console.log('\n🔍 CHECKING DATABASE CONNECTION');
    console.log('='.repeat(70));
    
    console.log('\n📋 Environment Variables (.env.local):');
    console.log(`   DB_HOST: ${process.env.DB_HOST}`);
    console.log(`   DB_PORT: ${process.env.DB_PORT}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME}`);
    console.log(`   DB_USER: ${process.env.DB_USER}`);
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('\n✅ Connected to database!');
        
        // Check users
        const [users] = await connection.execute(
            'SELECT user_id, username, email FROM users ORDER BY user_id'
        );
        
        console.log(`\n👥 Users in this database (${users.length}):`);
        users.forEach(u => {
            console.log(`   - ID: ${u.user_id} | ${u.username} | ${u.email}`);
        });
        
        // Check tasks
        const [tasks] = await connection.execute(
            'SELECT COUNT(*) as count FROM tasks'
        );
        console.log(`\n✓ Tasks: ${tasks[0].count}`);
        
        // Check reports
        const [reports] = await connection.execute(
            'SELECT COUNT(*) as count FROM daily_reports'
        );
        console.log(`✓ Reports: ${reports[0].count}`);

    } finally {
        await connection.end();
        console.log('\n' + '='.repeat(70));
    }
}

checkDatabase().catch(console.error);

