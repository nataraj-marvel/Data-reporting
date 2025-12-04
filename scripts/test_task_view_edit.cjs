// Test task view and edit functionality
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

async function testTaskViewEdit() {
    console.log('\n🔍 TESTING TASK VIEW & EDIT');
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

        // 2. Get task by ID
        console.log('\n📋 Step 2: Fetching task ID 6...');
        const viewRes = await makeRequest('GET', '/api/tasks/6');
        
        console.log(`   Status: ${viewRes.status}`);
        if (viewRes.data.success) {
            console.log('✅ Task fetched successfully!');
            const task = viewRes.data.data;
            console.log(`   - Task ID: ${task.task_id}`);
            console.log(`   - Title: ${task.title}`);
            console.log(`   - Status: ${task.status}`);
            console.log(`   - Priority: ${task.priority}`);
        } else {
            console.log('❌ Failed to fetch task');
            console.log('   Error:', viewRes.data.error || viewRes.data);
            console.log('   Full response:', JSON.stringify(viewRes.data, null, 2));
        }

        // 3. Update task
        console.log('\n✏️  Step 3: Updating task...');
        const updateRes = await makeRequest('PUT', '/api/tasks/6', {
            title: 'Updated Test Task',
            description: 'Updated via API test',
            status: 'in_progress',
            priority: 'high'
        });
        
        console.log(`   Status: ${updateRes.status}`);
        if (updateRes.data.success) {
            console.log('✅ Task updated successfully!');
            console.log(`   - New title: ${updateRes.data.data.title}`);
            console.log(`   - New status: ${updateRes.data.data.status}`);
        } else {
            console.log('❌ Failed to update task');
            console.log('   Error:', updateRes.data.error || updateRes.data);
            console.log('   Full response:', JSON.stringify(updateRes.data, null, 2));
        }

        // 4. Verify update
        console.log('\n🔍 Step 4: Verifying update...');
        const verifyRes = await makeRequest('GET', '/api/tasks/6');
        
        if (verifyRes.data.success) {
            console.log('✅ Verification successful!');
            const task = verifyRes.data.data;
            console.log(`   - Title: ${task.title}`);
            console.log(`   - Status: ${task.status}`);
            console.log(`   - Priority: ${task.priority}`);
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }

    console.log('\n' + '='.repeat(70));
}

testTaskViewEdit();

