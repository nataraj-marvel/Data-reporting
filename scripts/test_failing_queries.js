// Test the exact queries that are failing
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     🔍 TESTING FAILING QUERIES ON REMOTE DB              ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

async function testQueries() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to remote database\n');

    // Test 1: Reports List Query (FAILING)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 1: Reports List Query');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
      const reportsListQuery = `
        SELECT r.*, u.full_name 
        FROM daily_reports r
        LEFT JOIN users u ON r.user_id = u.user_id
        WHERE 1=1
        LIMIT 10
      `;
      console.log('Query:', reportsListQuery.trim());
      const [reports] = await connection.query(reportsListQuery);
      console.log(`✅ SUCCESS: Found ${reports.length} reports\n`);
      if (reports.length > 0) {
        console.log('Sample columns:', Object.keys(reports[0]).slice(0, 10).join(', '));
      }
    } catch (error) {
      console.log('❌ FAILED:', error.message);
      console.log('SQL State:', error.sqlState);
      console.log('Error Code:', error.code, '\n');
    }

    // Test 2: Reports View Query (FAILING)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 2: Reports View Query');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
      const reportsViewQuery = `
        SELECT * FROM daily_reports WHERE report_id = 1
      `;
      console.log('Query:', reportsViewQuery.trim());
      const [report] = await connection.query(reportsViewQuery);
      console.log(`✅ SUCCESS: Query executed\n`);
      if (report.length > 0) {
        console.log('Columns:', Object.keys(report[0]).join(', '));
      } else {
        console.log('(No report with ID 1, but query syntax is OK)');
      }
    } catch (error) {
      console.log('❌ FAILED:', error.message);
      console.log('SQL State:', error.sqlState);
      console.log('Error Code:', error.code, '\n');
    }

    // Test 3: Check daily_reports table structure
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 3: Check daily_reports Table Structure');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const [columns] = await connection.query('DESCRIBE daily_reports');
    console.log('Columns in daily_reports:');
    columns.forEach(col => {
      const marker = col.Key === 'PRI' ? ' [PRIMARY KEY]' : col.Key === 'MUL' ? ' [FK]' : '';
      console.log(`  • ${col.Field}: ${col.Type}${marker}`);
    });

    // Check for missing columns
    const expectedColumns = [
      'report_id', 'user_id', 'report_date', 'work_description', 
      'hours_worked', 'tasks_completed', 'issues_found', 'issues_solved',
      'blockers', 'notes', 'status', 'created_at', 'updated_at', 
      'submitted_at', 'reviewed_at', 'reviewed_by'
    ];
    
    const actualColumns = columns.map(col => col.Field);
    const missing = expectedColumns.filter(col => !actualColumns.includes(col));
    
    if (missing.length > 0) {
      console.log('\n⚠️  MISSING COLUMNS:', missing.join(', '));
    } else {
      console.log('\n✅ All expected columns present');
    }

    // Test 4: Task View Query (FAILING)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 4: Task View Query');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
      const taskViewQuery = `
        SELECT 
          t.*,
          u_creator.username as creator_username,
          u_creator.full_name as creator_name,
          u_assigned.username as assigned_user,
          u_assigned.full_name as assigned_user_name,
          dr.report_date,
          r.title as request_title,
          i.title as issue_title,
          p.prompt_text as related_prompt,
          pt.title as parent_task_title
        FROM tasks t
        LEFT JOIN users u_creator ON t.user_id = u_creator.user_id
        LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.user_id
        LEFT JOIN daily_reports dr ON t.report_id = dr.report_id
        LEFT JOIN requests r ON t.request_id = r.request_id
        LEFT JOIN issues i ON t.issue_id = i.issue_id
        LEFT JOIN ai_prompts p ON t.prompt_id = p.prompt_id
        LEFT JOIN tasks pt ON t.parent_task_id = pt.task_id
        WHERE t.task_id = 1
      `;
      console.log('Query: [Complex task view query]');
      const [task] = await connection.query(taskViewQuery);
      console.log(`✅ SUCCESS: Query executed\n`);
      if (task.length > 0) {
        console.log('Columns:', Object.keys(task[0]).slice(0, 15).join(', '), '...');
      } else {
        console.log('(No task with ID 1, but query syntax is OK)');
      }
    } catch (error) {
      console.log('❌ FAILED:', error.message);
      console.log('SQL State:', error.sqlState);
      console.log('Error Code:', error.code, '\n');
    }

    // Test 5: Check if there are any reports/tasks in the database
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 5: Check Data Availability');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const [reportCount] = await connection.query('SELECT COUNT(*) as count FROM daily_reports');
    const [taskCount] = await connection.query('SELECT COUNT(*) as count FROM tasks');
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    
    console.log(`Reports: ${reportCount[0].count}`);
    console.log(`Tasks: ${taskCount[0].count}`);
    console.log(`Users: ${userCount[0].count}`);

    // Test 6: Try inserting and selecting a test report
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 6: Test Report Insert & Select');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      // Get first user ID
      const [users] = await connection.query('SELECT user_id FROM users LIMIT 1');
      if (users.length === 0) {
        console.log('⚠️  No users found, skipping insert test');
      } else {
        const userId = users[0].user_id;
        console.log(`Using user_id: ${userId}`);

        // Try to insert a test report
        const insertQuery = `
          INSERT INTO daily_reports 
          (user_id, report_date, work_description, hours_worked, status)
          VALUES (?, CURDATE(), 'Test report from diagnostic', 1.0, 'draft')
        `;
        
        const [insertResult] = await connection.query(insertQuery, [userId]);
        console.log(`✅ Test report inserted with ID: ${insertResult.insertId}`);

        // Try to select it back
        const [testReport] = await connection.query(
          'SELECT * FROM daily_reports WHERE report_id = ?',
          [insertResult.insertId]
        );
        
        if (testReport.length > 0) {
          console.log('✅ Test report retrieved successfully');
          console.log('Columns:', Object.keys(testReport[0]).join(', '));
        }

        // Clean up - delete test report
        await connection.query('DELETE FROM daily_reports WHERE report_id = ?', [insertResult.insertId]);
        console.log('✅ Test report cleaned up');
      }
    } catch (error) {
      console.log('❌ Insert/Select test failed:', error.message);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('If any queries failed, the error details above show the issue.');
    console.log('Common causes:');
    console.log('  • Missing columns in table');
    console.log('  • Wrong column names in query');
    console.log('  • Permission issues');
    console.log('  • Column type mismatches\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

testQueries();

