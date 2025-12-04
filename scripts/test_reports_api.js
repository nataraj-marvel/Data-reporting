// Test Reports API endpoints to see exact errors
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:3000';
let cookie = '';

function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_URL + path);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 3000,
            path: url.pathname + url.search,
            method: method,
            headers: { 
                'Content-Type': 'application/json'
            }
        };
        
        if (cookie) options.headers['Cookie'] = cookie;

        const req = http.request(options, (res) => {
            let body = '';
            
            if (res.headers['set-cookie']) {
                cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
            }
            
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ 
                        status: res.statusCode, 
                        headers: res.headers,
                        data: JSON.parse(body) 
                    });
                } catch (e) {
                    resolve({ 
                        status: res.statusCode,
                        headers: res.headers,
                        data: body 
                    });
                }
            });
        });
        
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     🔍 TESTING REPORTS API ENDPOINTS                    ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

async function testReportsAPI() {
    try {
        // Test 1: Login
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 1: Login');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const login = await request('POST', '/api/auth/login', {
            username: 'testuser',
            password: 'Test@123'
        });
        
        console.log(`Status: ${login.status}`);
        if (login.data.success) {
            console.log('✅ Login successful');
            console.log(`User: ${login.data.data.username} (${login.data.data.role})\n`);
        } else {
            console.log('❌ Login failed:', login.data.error, '\n');
            return;
        }

        // Test 2: Get Reports List
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 2: Get Reports List');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const reportsList = await request('GET', '/api/reports?page=1&limit=10');
        
        console.log(`Status: ${reportsList.status}`);
        if (reportsList.data.success) {
            console.log(`✅ Reports list retrieved`);
            console.log(`Found: ${reportsList.data.data.length} reports`);
            console.log(`Total: ${reportsList.data.pagination?.total || 0}\n`);
        } else {
            console.log('❌ Reports list FAILED');
            console.log('Error:', reportsList.data.error || reportsList.data);
            console.log('\nFull Response:', JSON.stringify(reportsList.data, null, 2), '\n');
        }

        // Test 3: Create Report
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 3: Create Report');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const newReport = await request('POST', '/api/reports', {
            report_date: new Date().toISOString().split('T')[0],
            work_description: 'Test report - checking API functionality',
            hours_worked: 2.5,
            tasks_completed: '1. Test item one\n2. Test item two',
            issues_found: 'Test issue found',
            issues_solved: 'Test issue solved',
            status: 'submitted'
        });
        
        console.log(`Status: ${newReport.status}`);
        if (newReport.data.success) {
            console.log(`✅ Report created successfully`);
            console.log(`Report ID: ${newReport.data.data.report_id}`);
            console.log(`Created at: ${newReport.data.data.created_at}\n`);
            
            // Clean up - delete test report
            const reportId = newReport.data.data.report_id;
            await request('DELETE', `/api/reports/${reportId}`);
            console.log(`🧹 Test report deleted\n`);
        } else {
            console.log('❌ Report creation FAILED');
            console.log('Error:', newReport.data.error || newReport.data);
            console.log('\nFull Response:', JSON.stringify(newReport.data, null, 2), '\n');
        }

        // Test 4: Check if server is using correct database
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 4: Database Connection Check');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        console.log('Environment Variables:');
        console.log(`DB_HOST: ${process.env.DB_HOST}`);
        console.log(`DB_PORT: ${process.env.DB_PORT}`);
        console.log(`DB_NAME: ${process.env.DB_NAME}`);
        console.log(`DB_USER: ${process.env.DB_USER}\n`);
        
        console.log('⚠️  Make sure your dev server is using the same .env file!\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Is your dev server running? Start it with: npm run dev\n');
        }
    }
}

testReportsAPI();

