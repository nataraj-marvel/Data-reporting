// Simple view fix - executes views one by one
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function fixViews() {
  let connection;
  
  try {
    console.log('\n══════════════════════════════════════════════════════════');
    console.log('  🔧 FIXING DATABASE VIEWS');
    console.log('══════════════════════════════════════════════════════════\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nautilus_reporting'
    });

    console.log('✅ Connected to database\n');

    // Step 1: Drop all old views
    console.log('Step 1: Dropping old views...\n');
    const viewsToDrop = ['v_file_activity', 'v_prompt_activity', 'v_request_pipeline', 'v_task_dashboard'];
    
    for (const view of viewsToDrop) {
      try {
        await connection.execute(`DROP VIEW IF EXISTS ${view}`);
        console.log(`  ✅ Dropped ${view}`);
      } catch (error) {
        console.log(`  ⚠️  ${view}: ${error.message.substring(0, 50)}...`);
      }
    }

    console.log('\nStep 2: Creating new views...\n');

    // View 1: v_task_dashboard
    try {
      await connection.execute(`
        CREATE VIEW v_task_dashboard AS
        SELECT 
          t.task_id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.task_type,
          t.completion_percentage,
          t.estimated_hours,
          t.actual_hours,
          t.due_date,
          u_creator.username as created_by,
          u_creator.full_name as creator_name,
          u_assigned.username as assigned_to_username,
          u_assigned.full_name as assigned_to_name,
          dr.report_date,
          r.title as request_title,
          i.title as issue_title,
          t.created_at,
          t.updated_at
        FROM tasks t
        LEFT JOIN users u_creator ON t.user_id = u_creator.user_id
        LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.user_id
        LEFT JOIN daily_reports dr ON t.report_id = dr.report_id
        LEFT JOIN requests r ON t.request_id = r.request_id
        LEFT JOIN issues i ON t.issue_id = i.issue_id
      `);
      console.log('  ✅ Created v_task_dashboard');
    } catch (error) {
      console.log(`  ❌ v_task_dashboard: ${error.message}`);
    }

    // View 2: v_request_pipeline
    try {
      await connection.execute(`
        CREATE VIEW v_request_pipeline AS
        SELECT 
          r.request_id,
          r.title,
          r.description,
          r.request_type,
          r.status,
          r.priority,
          u_creator.username as created_by,
          u_creator.full_name as creator_name,
          u_assigned.username as assigned_to_username,
          u_assigned.full_name as assigned_to_name,
          r.estimated_hours,
          r.actual_hours,
          r.due_date,
          r.created_at,
          r.updated_at
        FROM requests r
        LEFT JOIN users u_creator ON r.user_id = u_creator.user_id
        LEFT JOIN users u_assigned ON r.assigned_to = u_assigned.user_id
      `);
      console.log('  ✅ Created v_request_pipeline');
    } catch (error) {
      console.log(`  ❌ v_request_pipeline: ${error.message}`);
    }

    // View 3: v_prompt_activity
    try {
      await connection.execute(`
        CREATE VIEW v_prompt_activity AS
        SELECT 
          p.prompt_id,
          p.prompt_text,
          p.ai_model,
          p.category,
          p.effectiveness_rating,
          p.tokens_used,
          u.username,
          u.full_name,
          p.created_at
        FROM ai_prompts p
        LEFT JOIN users u ON p.user_id = u.user_id
      `);
      console.log('  ✅ Created v_prompt_activity');
    } catch (error) {
      console.log(`  ❌ v_prompt_activity: ${error.message}`);
    }

    // View 4: v_file_activity
    try {
      await connection.execute(`
        CREATE VIEW v_file_activity AS
        SELECT 
          fv.file_version_id,
          fv.file_path,
          fv.version_number,
          fv.change_type,
          fv.lines_added,
          fv.lines_deleted,
          u.username,
          u.full_name,
          fv.created_at
        FROM file_versions fv
        LEFT JOIN users u ON fv.user_id = u.user_id
      `);
      console.log('  ✅ Created v_file_activity');
    } catch (error) {
      console.log(`  ❌ v_file_activity: ${error.message}`);
    }

    console.log('\nStep 3: Testing all views...\n');

    // Test each view
    const viewsToTest = ['v_task_dashboard', 'v_request_pipeline', 'v_prompt_activity', 'v_file_activity'];
    let successCount = 0;

    for (const view of viewsToTest) {
      try {
        const [result] = await connection.execute(`SELECT * FROM ${view} LIMIT 1`);
        console.log(`  ✅ ${view}: Working (${result.length} rows)`);
        successCount++;
      } catch (error) {
        console.log(`  ❌ ${view}: ${error.message.substring(0, 60)}...`);
      }
    }

    console.log('\n══════════════════════════════════════════════════════════');
    if (successCount === viewsToTest.length) {
      console.log('  ✅ ALL VIEWS FIXED SUCCESSFULLY!');
    } else {
      console.log(`  ⚠️  ${successCount}/${viewsToTest.length} views working`);
    }
    console.log('══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run
fixViews().then(() => {
  console.log('🎉 View fix complete!\n');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Failed:', error.message);
  process.exit(1);
});

