// Test direct database query to see what's returned
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testQuery() {
    console.log('\n🔍 Testing Direct Database Query');
    console.log('='.repeat(50));
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'nautilus_reporting'
    });

    try {
        // Test 1: SELECT *
        console.log('\n📋 Test 1: SELECT * FROM users');
        const [rows1] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            ['admin']
        );
        console.log('Result:', JSON.stringify(rows1[0], null, 2));

        // Test 2: SELECT specific columns
        console.log('\n📋 Test 2: SELECT specific columns');
        const [rows2] = await connection.execute(
            'SELECT user_id, username, password_hash, role, full_name, email FROM users WHERE username = ?',
            ['admin']
        );
        console.log('Result:', JSON.stringify(rows2[0], null, 2));

        // Test password
        const bcrypt = require('bcryptjs');
        const isValid = await bcrypt.compare('admin123', rows2[0].password_hash);
        console.log('\n🔑 Password verification:', isValid ? '✅ VALID' : '❌ INVALID');

    } finally {
        await connection.end();
    }
}

testQuery().catch(console.error);

