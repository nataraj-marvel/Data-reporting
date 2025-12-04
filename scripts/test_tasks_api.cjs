// Test tasks API with authentication
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

async function testTasks() {
    console.log('\n🔍 TESTING TASKS API');
    console.log('='.repeat(70));

    try {
        // 1. Login
        console.log('\n📝 Step 1: Login as testuser...');
        const loginRes = await makeRequest('POST', '/api/auth/login', {
            username: 'testuser',
            password: 'Test@123'
        });
        
        console.log(`   Status: ${loginRes.status}`);
        if (!loginRes.data.success) {
            console.log('❌ Login failed:', loginRes.data.error);
            return;
        }
        console.log('✅ Login successful');

        // 2. Get tasks
        console.log('\n📋 Step 2: Fetching tasks...');
        const tasksRes = await makeRequest('GET', '/api/tasks?limit=10');
        
        console.log(`   Status: ${tasksRes.status}`);
        if (tasksRes.data.success) {
            console.log(`✅ Tasks fetched: ${tasksRes.data.data.length} tasks`);
            if (tasksRes.data.data.length > 0) {
                console.log('\n   Sample task:');
                const task = tasksRes.data.data[0];
                console.log(`   - ID: ${task.task_id}`);
                console.log(`   - Title: ${task.title}`);
                console.log(`   - Status: ${task.status}`);
            }
        } else {
            console.log('❌ Failed:', tasksRes.data.error || tasksRes.data);
        }

        // 3. Create task
        console.log('\n➕ Step 3: Creating new task...');
        const createRes = await makeRequest('POST', '/api/tasks', {
            title: 'Test Task via API',
            description: 'Testing task creation through API',
            status: 'pending',
            priority: 'medium',
            task_type: 'development',
            estimated_hours: 2
        });
        
        console.log(`   Status: ${createRes.status}`);
        if (createRes.data.success) {
            console.log(`✅ Task created!`);
            console.log(`   Task ID: ${createRes.data.data.task_id}`);
            console.log(`   Title: ${createRes.data.data.title}`);
        } else {
            console.log('❌ Failed:', createRes.data.error || createRes.data);
            console.log('   Full response:', JSON.stringify(createRes.data, null, 2));
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(70));
}

testTasks();

