// Test reports and check hours_worked field
const http = require('http');

let sessionCookie = '';

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (sessionCookie) {
            options.headers['Cookie'] = sessionCookie;
        }

        const req = http.request(options, (res) => {
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

async function testReportsHours() {
    console.log('\n🔍 TESTING REPORTS HOURS CALCULATION');
    console.log('='.repeat(70));

    try {
        // 1. Login
        console.log('\n📝 Step 1: Login...');
        const loginRes = await makeRequest('POST', '/api/auth/login', {
            username: 'testuser',
            password: 'Test@123'
        });
        
        if (!loginRes.data.success) {
            console.log('❌ Login failed:', loginRes.data.error);
            return;
        }
        console.log('✅ Login successful');

        // 2. Get reports
        console.log('\n📋 Step 2: Fetching reports...');
        const reportsRes = await makeRequest('GET', '/api/reports?limit=10');
        
        console.log(`   Status: ${reportsRes.status}`);
        if (reportsRes.data.success) {
            const reports = reportsRes.data.data;
            console.log(`✅ Reports fetched: ${reports.length} reports`);
            
            console.log('\n📊 Hours Analysis:');
            let totalHours = 0;
            reports.forEach((r, i) => {
                console.log(`\n   Report ${i + 1}:`);
                console.log(`   - Report ID: ${r.report_id}`);
                console.log(`   - Date: ${r.report_date}`);
                console.log(`   - Hours: ${r.hours_worked} (Type: ${typeof r.hours_worked})`);
                console.log(`   - Status: ${r.status}`);
                
                const hours = parseFloat(r.hours_worked) || 0;
                totalHours += hours;
            });
            
            console.log('\n' + '='.repeat(70));
            console.log(`📊 TOTAL HOURS: ${totalHours.toFixed(2)}`);
            console.log('='.repeat(70));
            
            // Check calculation
            const calculatedTotal = reports.reduce((sum, r) => {
                const hours = parseFloat(r.hours_worked) || 0;
                return sum + hours;
            }, 0);
            
            console.log(`\n✅ Calculated Total: ${calculatedTotal.toFixed(2)}`);
            console.log(`✅ Using reduce: ${Number(reports.reduce((sum, r) => sum + (r.hours_worked || 0), 0)).toFixed(1)}`);
            
        } else {
            console.log('❌ Failed:', reportsRes.data.error || reportsRes.data);
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(70));
}

testReportsHours();

