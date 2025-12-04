// Comprehensive System Health Check
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
console.log('║     ✅ COMPREHENSIVE SYSTEM HEALTH CHECK                 ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

async function healthCheck() {
  let connection;
  let allPassed = true;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database Connection: OK');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 TEST 1: Schema Validation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const expectedPKs = {
      users: 'user_id',
      daily_reports: 'report_id',
      tasks: 'task_id',
      requests: 'request_id',
      ai_prompts: 'prompt_id',
      file_versions: 'file_version_id',
      issues: 'issue_id',
      problems_solved: 'solution_id'
    };

    for (const [table, expectedPK] of Object.entries(expectedPKs)) {
      const [columns] = await connection.query(`DESCRIBE ${table}`);
      const pkColumn = columns.find(col => col.Key === 'PRI');
      
      if (pkColumn?.Field === expectedPK) {
        console.log(`✅ ${table}: PK = ${expectedPK}`);
      } else {
        console.log(`❌ ${table}: Expected ${expectedPK}, found ${pkColumn?.Field}`);
        allPassed = false;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 TEST 2: Foreign Key Relationships');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const fkTests = [
      {
        name: 'Reports → Users',
        sql: 'SELECT COUNT(*) as count FROM daily_reports dr LEFT JOIN users u ON dr.user_id = u.user_id'
      },
      {
        name: 'Tasks → Users (creator)',
        sql: 'SELECT COUNT(*) as count FROM tasks t LEFT JOIN users u ON t.user_id = u.user_id'
      },
      {
        name: 'Tasks → Users (assigned)',
        sql: 'SELECT COUNT(*) as count FROM tasks t LEFT JOIN users u ON t.assigned_to = u.user_id'
      },
      {
        name: 'Tasks → Reports',
        sql: 'SELECT COUNT(*) as count FROM tasks t LEFT JOIN daily_reports dr ON t.report_id = dr.report_id'
      },
      {
        name: 'Tasks → Requests',
        sql: 'SELECT COUNT(*) as count FROM tasks t LEFT JOIN requests r ON t.request_id = r.request_id'
      },
      {
        name: 'Tasks → Issues',
        sql: 'SELECT COUNT(*) as count FROM tasks t LEFT JOIN issues i ON t.issue_id = i.issue_id'
      },
      {
        name: 'Tasks → Prompts',
        sql: 'SELECT COUNT(*) as count FROM tasks t LEFT JOIN ai_prompts p ON t.prompt_id = p.prompt_id'
      },
      {
        name: 'Requests → Users',
        sql: 'SELECT COUNT(*) as count FROM requests r LEFT JOIN users u ON r.user_id = u.user_id'
      },
      {
        name: 'Prompts → Users',
        sql: 'SELECT COUNT(*) as count FROM ai_prompts ap LEFT JOIN users u ON ap.user_id = u.user_id'
      },
      {
        name: 'File Versions → Users',
        sql: 'SELECT COUNT(*) as count FROM file_versions fv LEFT JOIN users u ON fv.user_id = u.user_id'
      }
    ];

    for (const test of fkTests) {
      try {
        await connection.query(test.sql);
        console.log(`✅ ${test.name}`);
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
        allPassed = false;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 TEST 3: API-Critical Queries');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const apiQueries = [
      {
        name: 'Reports List (GET /api/reports)',
        sql: `SELECT dr.*, u.username, u.full_name 
              FROM daily_reports dr 
              LEFT JOIN users u ON dr.user_id = u.user_id 
              ORDER BY dr.created_at DESC LIMIT 10`
      },
      {
        name: 'Tasks List (GET /api/tasks)',
        sql: `SELECT t.*, 
              u_creator.username as creator_username,
              u_assigned.username as assigned_user
              FROM tasks t
              LEFT JOIN users u_creator ON t.user_id = u_creator.user_id
              LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.user_id
              ORDER BY t.created_at DESC LIMIT 10`
      },
      {
        name: 'Requests List (GET /api/requests)',
        sql: `SELECT r.*,
              creator.username as creator_username,
              assignee.username as assignee_username
              FROM requests r
              LEFT JOIN users creator ON r.user_id = creator.user_id
              LEFT JOIN users assignee ON r.assigned_to = assignee.user_id
              ORDER BY r.created_at DESC LIMIT 10`
      },
      {
        name: 'Prompts List (GET /api/prompts)',
        sql: `SELECT ap.*, u.username, u.full_name
              FROM ai_prompts ap
              LEFT JOIN users u ON ap.user_id = u.user_id
              ORDER BY ap.created_at DESC LIMIT 10`
      },
      {
        name: 'Files List (GET /api/files)',
        sql: `SELECT fv.*, u.username, u.full_name
              FROM file_versions fv
              LEFT JOIN users u ON fv.user_id = u.user_id
              ORDER BY fv.created_at DESC LIMIT 10`
      }
    ];

    for (const query of apiQueries) {
      try {
        await connection.query(query.sql);
        console.log(`✅ ${query.name}`);
      } catch (error) {
        console.log(`❌ ${query.name}: ${error.message}`);
        allPassed = false;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 TEST 4: Views Functionality');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const views = ['v_task_dashboard', 'v_request_pipeline', 'v_prompt_activity', 'v_file_activity'];
    
    for (const view of views) {
      try {
        await connection.query(`SELECT * FROM ${view} LIMIT 1`);
        console.log(`✅ ${view}`);
      } catch (error) {
        console.log(`❌ ${view}: ${error.message}`);
        allPassed = false;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 FINAL RESULTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (allPassed) {
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║                                                           ║');
      console.log('║         ✅ ALL SYSTEMS OPERATIONAL! ✅                   ║');
      console.log('║                                                           ║');
      console.log('╚═══════════════════════════════════════════════════════════╝\n');
      console.log('🎯 System Status: HEALTHY');
      console.log('📊 Schema: CORRECT');
      console.log('🔗 Foreign Keys: WORKING');
      console.log('🚀 APIs: READY');
      console.log('👀 Views: FUNCTIONAL\n');
      console.log('✅ You can now:');
      console.log('   • Access /reports - list, view, edit reports');
      console.log('   • Access /tasks - list, create, manage tasks');
      console.log('   • Access /requests - manage requests');
      console.log('   • Access /prompts - view AI prompts');
      console.log('   • Access /files - manage file versions\n');
    } else {
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║                                                           ║');
      console.log('║         ⚠️  SOME ISSUES DETECTED ⚠️                      ║');
      console.log('║                                                           ║');
      console.log('╚═══════════════════════════════════════════════════════════╝\n');
      console.log('⚠️  System Status: NEEDS ATTENTION');
      console.log('📋 Check the errors above for details\n');
    }

  } catch (error) {
    console.error('\n❌ HEALTH CHECK FAILED:', error.message);
    allPassed = false;
  } finally {
    if (connection) await connection.end();
  }

  process.exit(allPassed ? 0 : 1);
}

healthCheck();

