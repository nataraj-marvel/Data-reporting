// Fix AUTO_INCREMENT for all primary key columns
const mysql = require('mysql2/promise');

async function fixAllAutoIncrement() {
    console.log('\n🔧 FIXING ALL AUTO_INCREMENT COLUMNS');
    console.log('='.repeat(70));
    
    const connection = await mysql.createConnection({
        host: '103.108.220.47',
        port: 3307,
        user: 'reporting',
        password: 'Reporting@2025',
        database: 'nautilus_reporting'
    });

    const tables = {
        'users': 'user_id',
        'daily_reports': 'report_id',
        'tasks': 'task_id',
        'requests': 'request_id',
        'issues': 'issue_id',
        'problems_solved': 'solution_id',
        'ai_prompts': 'prompt_id',
        'file_versions': 'file_version_id',
        'sessions': 'session_id',
        'activity_log': 'log_id',
        'data_uploads': 'upload_id'
    };

    try {
        for (const [tableName, pkColumn] of Object.entries(tables)) {
            console.log(`\n📋 ${tableName}.${pkColumn}:`);
            
            try {
                // Check current status
                const [columns] = await connection.execute(
                    `SHOW COLUMNS FROM ${tableName} WHERE Field = ?`,
                    [pkColumn]
                );
                
                if (columns.length === 0) {
                    console.log(`   ⚠️  Column not found`);
                    continue;
                }
                
                const hasAutoInc = columns[0].Extra.includes('auto_increment');
                console.log(`   Current: ${hasAutoInc ? '✅ AUTO_INCREMENT' : '❌ NO AUTO_INCREMENT'}`);
                
                if (!hasAutoInc) {
                    // Get max ID
                    const [maxId] = await connection.execute(
                        `SELECT MAX(${pkColumn}) as max_id FROM ${tableName}`
                    );
                    const nextId = (maxId[0].max_id || 0) + 1;
                    
                    // Delete any rows with ID = 0
                    await connection.execute(
                        `DELETE FROM ${tableName} WHERE ${pkColumn} = 0`
                    );
                    
                    // Enable AUTO_INCREMENT
                    await connection.execute(
                        `ALTER TABLE ${tableName} MODIFY ${pkColumn} INT AUTO_INCREMENT`
                    );
                    
                    // Set starting value
                    await connection.execute(
                        `ALTER TABLE ${tableName} AUTO_INCREMENT = ${nextId}`
                    );
                    
                    console.log(`   ✅ Fixed! AUTO_INCREMENT set to ${nextId}`);
                }
            } catch (err) {
                console.log(`   ❌ Error: ${err.message}`);
            }
        }

    } finally {
        await connection.end();
        console.log('\n' + '='.repeat(70));
        console.log('✅ All tables processed\n');
    }
}

fixAllAutoIncrement().catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
});

