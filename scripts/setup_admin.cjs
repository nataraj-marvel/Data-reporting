// Setup admin user for fresh installation
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setupAdmin() {
    console.log('\n' + '='.repeat(70));
    console.log('  🔐 Admin User Setup - Nautilus Reporting System');
    console.log('='.repeat(70));
    
    try {
        // Connect to database
        console.log('\n📡 Connecting to database...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'nautilus_reporting'
        });
        
        console.log('✅ Connected to database');
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   Database: ${process.env.DB_NAME || 'nautilus_reporting'}`);

        // Check if admin exists
        const [existing] = await connection.execute(
            'SELECT user_id, username FROM users WHERE username = ?',
            ['admin']
        );

        if (existing.length > 0) {
            console.log('\n⚠️  Admin user already exists!');
            const answer = await question('   Do you want to reset the password? (yes/no): ');
            
            if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
                console.log('\n❌ Setup cancelled.');
                await connection.end();
                rl.close();
                return;
            }
        }

        // Get admin credentials
        console.log('\n📝 Create Admin User:');
        const username = await question('   Username (press Enter for "admin"): ') || 'admin';
        const password = await question('   Password (press Enter for "admin123"): ') || 'admin123';
        const fullName = await question('   Full Name (press Enter for "System Administrator"): ') || 'System Administrator';
        const email = await question('   Email (press Enter for "admin@nautilus.local"): ') || 'admin@nautilus.local';

        // Hash password
        console.log('\n🔐 Generating secure password hash...');
        const passwordHash = await bcrypt.hash(password, 10);
        console.log('✅ Password hash generated');

        // Create or update admin
        if (existing.length > 0) {
            console.log('\n💾 Updating existing admin user...');
            await connection.execute(
                'UPDATE users SET password_hash = ?, full_name = ?, email = ?, updated_at = NOW() WHERE username = ?',
                [passwordHash, fullName, email, username]
            );
            console.log('✅ Admin user updated');
        } else {
            console.log('\n💾 Creating new admin user...');
            await connection.execute(
                `INSERT INTO users (username, password_hash, role, full_name, email, is_active, created_at, updated_at)
                 VALUES (?, ?, 'admin', ?, ?, 1, NOW(), NOW())`,
                [username, passwordHash, fullName, email]
            );
            console.log('✅ Admin user created');
        }

        // Verify
        console.log('\n🔍 Verifying setup...');
        const [admin] = await connection.execute(
            'SELECT user_id, username, role, full_name, email FROM users WHERE username = ?',
            [username]
        );

        if (admin.length > 0) {
            console.log('✅ Verification successful!');
            console.log('\n' + '='.repeat(70));
            console.log('  📋 Admin User Details');
            console.log('='.repeat(70));
            console.log(`   User ID: ${admin[0].user_id}`);
            console.log(`   Username: ${admin[0].username}`);
            console.log(`   Full Name: ${admin[0].full_name}`);
            console.log(`   Email: ${admin[0].email}`);
            console.log(`   Role: ${admin[0].role}`);
            console.log('='.repeat(70));
            
            console.log('\n✅ Setup Complete!');
            console.log('\n🔐 Login Credentials:');
            console.log(`   Username: ${username}`);
            console.log(`   Password: ${password}`);
            console.log('\n🌐 Access the application:');
            console.log('   URL: http://localhost:3000');
            console.log('\n⚠️  IMPORTANT: Change the password after first login!');
        }

        await connection.end();
        console.log('\n' + '='.repeat(70));
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.error('\nPlease check:');
        console.error('  1. MySQL is running');
        console.error('  2. Database exists: nautilus_reporting');
        console.error('  3. .env file is configured correctly');
        console.error('  4. Database schema is imported');
    }
    
    rl.close();
}

setupAdmin();

