// Verify the report was created successfully
const mysql = require('mysql2/promise');

async function verifyReport() {
    console.log('\n🔍 VERIFYING REPORT CREATION');
    console.log('='.repeat(70));
    
    const connection = await mysql.createConnection({
        host: '103.108.220.47',
        port: 3307,
        user: 'reporting',
        password: 'Reporting@2025',
        database: 'nautilus_reporting'
    });

    try {
        // Get the latest report
        console.log('\n📊 Latest reports in database:');
        const [reports] = await connection.execute(
            `SELECT report_id, user_id, report_date, hours_worked, status, LEFT(work_description, 50) as desc_start, created_at
             FROM daily_reports 
             ORDER BY created_at DESC 
             LIMIT 5`
        );
        
        if (reports.length === 0) {
            console.log('❌ No reports found!');
            return;
        }
        
        console.log(`\nFound ${reports.length} recent report(s):\n`);
        reports.forEach((r, i) => {
            console.log(`${i + 1}. Report ID: ${r.report_id}`);
            console.log(`   User ID: ${r.user_id}`);
            console.log(`   Date: ${r.report_date}`);
            console.log(`   Hours: ${r.hours_worked}`);
            console.log(`   Status: ${r.status}`);
            console.log(`   Description: ${r.desc_start}...`);
            console.log(`   Created: ${r.created_at}`);
            console.log('');
        });
        
        // Check if our report exists
        const latestReport = reports[0];
        if (latestReport.user_id === 2 && latestReport.hours_worked === 14) {
            console.log('✅ Our report found!');
            console.log(`   Report ID: ${latestReport.report_id}`);
            console.log(`   View at: http://localhost:3000/reports/${latestReport.report_id}`);
        } else {
            console.log('⚠️  Latest report doesn\'t match our submission');
        }

    } finally {
        await connection.end();
        console.log('\n' + '='.repeat(70));
        console.log('✅ Verification complete\n');
    }
}

verifyReport().catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
});

