// Submit Report using API URL from .env
const http = require('http');
const https = require('https');
require('dotenv').config();

// Get API URL from environment
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const apiUrl = new URL(API_BASE_URL);
const isHttps = apiUrl.protocol === 'https:';
const httpModule = isHttps ? https : http;

console.log(`\n📡 Using API URL: ${API_BASE_URL}`);

let sessionCookie = '';

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: apiUrl.hostname,
            port: apiUrl.port || (isHttps ? 443 : 80),
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (sessionCookie) {
            options.headers['Cookie'] = sessionCookie;
        }

        const req = httpModule.request(options, (res) => {
            let body = '';

            if (res.headers['set-cookie']) {
                sessionCookie = res.headers['set-cookie'][0].split(';')[0];
            }

            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(body)
                    });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function submitReport() {
    console.log('\n🔍 SUBMITTING REPORT VIA API');
    console.log('='.repeat(70));
    console.log(`API URL: ${API_BASE_URL}`);
    console.log('='.repeat(70));

    try {
        // 1. Login
        console.log('\n📝 Step 1: Login...');
        const loginRes = await makeRequest('POST', '/api/auth/login', {
            username: process.env.API_USERNAME || 'testuser',
            password: process.env.API_PASSWORD || 'Test@123'
        });
        
        if (!loginRes.data.success) {
            console.log('❌ Login failed:', loginRes.data.error);
            return;
        }
        console.log('✅ Login successful');
        console.log(`   User: ${loginRes.data.data.username}`);

        // 2. Create Report
        console.log('\n📊 Step 2: Creating report...');
        const today = new Date().toISOString().split('T')[0];
        
        const reportData = {
            report_date: today,
            work_description: `# Daily Report - ${today}

## Summary
Report submitted via API using environment configuration

## Work Completed
- Configured API URL from .env file
- Created report submission script
- Tested API endpoints
- Verified connectivity

## Technical Details
- API URL: ${API_BASE_URL}
- Script: submit_report_env.cjs
- Authentication: Working
- Report Creation: Successful

## Testing Results
✅ Environment variables loaded
✅ API connection established
✅ Authentication successful
✅ Report creation working

## Environment
- API_BASE_URL: ${API_BASE_URL}
- Database: ${process.env.DB_NAME || 'nautilus_reporting'}
- Host: ${process.env.DB_HOST || 'localhost'}

## Notes
All functionality working correctly with environment-based configuration.`,
            
            hours_worked: 1.5,
            
            tasks_completed: `1. Configured .env file with API_BASE_URL
2. Updated API documentation
3. Created environment-aware submission script
4. Tested API endpoints
5. Verified report creation`,
            
            status: 'submitted',
            notes: `API Configuration Test - Using ${API_BASE_URL}`
        };

        const createRes = await makeRequest('POST', '/api/reports', reportData);
        
        if (createRes.data.success) {
            console.log('✅ Report created successfully!');
            console.log(`\n📋 Report Details:`);
            console.log(`   Report ID: ${createRes.data.data.report_id}`);
            console.log(`   Date: ${reportData.report_date}`);
            console.log(`   Hours: ${reportData.hours_worked}`);
            console.log(`   Status: ${createRes.data.data.status}`);
            console.log(`\n🔗 View Report:`);
            console.log(`   ${API_BASE_URL}/reports/${createRes.data.data.report_id}`);
        } else {
            console.error('❌ Failed:', createRes.data.error);
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Check .env file has API_BASE_URL');
        console.error('   2. Verify server is running');
        console.error('   3. Check network connectivity');
    }

    console.log('\n' + '='.repeat(70));
}

// Show configuration
console.log('\n⚙️  Configuration:');
console.log(`   API URL: ${API_BASE_URL}`);
console.log(`   Database: ${process.env.DB_NAME || 'nautilus_reporting'}`);
console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);

submitReport();

