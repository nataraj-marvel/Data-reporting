// Fix report_id AUTO_INCREMENT in remote database
const mysql = require('mysql2/promise');

async function fixReportId() {
    console.log('\n🔧 FIXING report_id AUTO_INCREMENT');
    console.log('='.repeat(70));
    
    const connection = await mysql.createConnection({
        host: '103.108.220.47',
        port: 3307,
        user: 'reporting',
        password: 'Reporting@2025',
        database: 'nautilus_reporting'
    });

    try {
        // 1. Check current structure
        console.log('\n📋 Step 1: Checking daily_reports structure...');
        const [columns] = await connection.execute(
            'SHOW COLUMNS FROM daily_reports WHERE Field = "report_id"'
        );
        console.log('report_id column:', columns[0]);
        
        if (columns[0].Extra.includes('auto_increment')) {
            console.log('✅ report_id already has AUTO_INCREMENT');
        } else {
            console.log('⚠️  report_id does NOT have AUTO_INCREMENT!');
        }
        
        // 2. Delete report with report_id = 0
        console.log('\n💾 Step 2: Deleting report with report_id = 0...');
        const [deleteResult] = await connection.execute(
            'DELETE FROM daily_reports WHERE report_id = 0'
        );
        console.log(`✅ Deleted ${deleteResult.affectedRows} report(s)`);
        
        // 3. Get max report_id
        console.log('\n🔢 Step 3: Getting max report_id...');
        const [maxId] = await connection.execute(
            'SELECT MAX(report_id) as max_id FROM daily_reports'
        );
        const nextId = (maxId[0].max_id || 0) + 1;
        console.log(`Next report_id should be: ${nextId}`);
        
        // 4. Fix AUTO_INCREMENT
        console.log('\n🔧 Step 4: Setting AUTO_INCREMENT...');
        await connection.execute(
            `ALTER TABLE daily_reports MODIFY report_id INT AUTO_INCREMENT`
        );
        console.log('✅ report_id set to AUTO_INCREMENT');
        
        // 5. Set AUTO_INCREMENT value
        console.log('\n🔢 Step 5: Setting AUTO_INCREMENT value...');
        await connection.execute(
            `ALTER TABLE daily_reports AUTO_INCREMENT = ${nextId}`
        );
        console.log(`✅ AUTO_INCREMENT set to ${nextId}`);
        
        // 6. Verify
        console.log('\n🔍 Step 6: Verifying...');
        const [newColumns] = await connection.execute(
            'SHOW COLUMNS FROM daily_reports WHERE Field = "report_id"'
        );
        console.log('report_id column now:', newColumns[0]);
        
        if (newColumns[0].Extra.includes('auto_increment')) {
            console.log('✅ AUTO_INCREMENT successfully enabled!');
        } else {
            console.log('❌ AUTO_INCREMENT still not enabled');
        }

    } finally {
        await connection.end();
        console.log('\n' + '='.repeat(70));
        console.log('✅ Fix complete\n');
    }
}

fixReportId().catch(err => {
    console.error('\n❌ Error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
});

