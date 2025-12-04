// Demo: Show how incremental reporting works
const http = require('http');
require('dotenv').config();

const API_URL = new URL(process.env.API_BASE_URL || 'http://localhost:3000');
let cookie = '';

function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_URL.hostname,
            port: API_URL.port || 3000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (cookie) options.headers['Cookie'] = cookie;
        const req = http.request(options, (res) => {
            let body = '';
            if (res.headers['set-cookie']) {
                cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
            }
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
                catch (e) { resolve({ status: res.statusCode, data: body }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function demo() {
    console.log('\n🎬 INCREMENTAL REPORTING DEMO');
    console.log('='.repeat(70));

    try {
        // Login
        const login = await request('POST', '/api/auth/login', {
            username: 'testuser',
            password: 'Test@123'
        });
        
        if (!login.data.success) {
            console.error('❌ Login failed');
            return;
        }
        console.log('✅ Login successful\n');

        // Get last report
        console.log('📋 Checking last report...');
        const reports = await request('GET', '/api/reports?limit=1');
        
        if (reports.data.data.length > 0) {
            const last = reports.data.data[0];
            const lastDate = new Date(last.report_date).toISOString().split('T')[0];
            const today = new Date().toISOString().split('T')[0];
            
            console.log(`   Last Report ID: #${last.report_id}`);
            console.log(`   Last Report Date: ${lastDate}`);
            console.log(`   Today: ${today}`);
            console.log(`   Last Hours: ${last.hours_worked}`);
            console.log(`   Last Tasks: ${last.tasks_completed ? last.tasks_completed.split('\n').length : 0} items\n`);
            
            if (lastDate === today) {
                console.log('✅ SAME DAY DETECTED!');
                console.log('   → Would UPDATE existing report #' + last.report_id);
                console.log('   → Would APPEND new work');
                console.log('   → Would ADD new hours to total');
                console.log('   → No duplication! ✓\n');
            } else {
                console.log('✅ DIFFERENT DAY DETECTED!');
                console.log('   → Would CREATE new report');
                console.log('   → Fresh start for today');
                console.log('   → Previous work preserved ✓\n');
            }
        } else {
            console.log('⚠️  No previous reports found');
            console.log('   → Would CREATE first report\n');
        }

        // Show example
        console.log('📝 Example New Work Data:');
        console.log('─'.repeat(70));
        console.log(`
  work_description: "# Latest Work Session
  
  ## Task Completed
  - Fixed incremental reporting
  - Created demo script
  - Updated documentation"
  
  hours_worked: 1.5
  
  tasks_completed: "1. Created incremental script
  2. Added date checking
  3. Implemented update logic"
  
  status: "submitted"
`);
        console.log('─'.repeat(70));
        console.log('\n✅ This script prevents reporting same work twice!');
        console.log('✅ Maintains accurate time tracking!');
        console.log('✅ Perfect for continuous work! 🎯\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    console.log('='.repeat(70));
}

demo();

