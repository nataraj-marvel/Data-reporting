// Test database connection
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('\n🔍 Testing Database Connection');
    console.log('='.repeat(70));
    
    console.log('\n📋 Configuration:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || '3306'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'nautilus_reporting'}`);
    
    try {
        console.log('\n📡 Connecting...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'nautilus_reporting'
        });
        
        console.log('✅ Connection successful!');
        
        // Test queries
        console.log('\n📊 Database Information:');
        
        // Get tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`   Tables: ${tables.length}`);
        
        // Get users
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log(`   Users: ${users[0].count}`);
        
        // Get reports
        const [reports] = await connection.execute('SELECT COUNT(*) as count FROM daily_reports');
        console.log(`   Reports: ${reports[0].count}`);
        
        // Get tasks
        const [tasks] = await connection.execute('SELECT COUNT(*) as count FROM tasks');
        console.log(`   Tasks: ${tasks[0].count}`);
        
        await connection.end();
        
        console.log('\n✅ All tests passed!');
        console.log('='.repeat(70));
        console.log('Database is ready to use! 🚀');
        console.log('='.repeat(70));
        
    } catch (error) {
        console.error('\n❌ Connection failed!');
        console.error(`   Error: ${error.message}`);
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Check if MySQL is running');
        console.error('   2. Verify .env configuration');
        console.error('   3. Check database name exists');
        console.error('   4. Verify username/password');
        console.error('\n📝 Current config:');
        console.error(`   mysql -h ${process.env.DB_HOST || 'localhost'} -P ${process.env.DB_PORT || '3306'} -u ${process.env.DB_USER || 'root'} -p`);
        console.error('='.repeat(70));
        process.exit(1);
    }
}

testConnection();

