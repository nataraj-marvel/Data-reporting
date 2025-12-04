// Force connection pool reset by hitting a special endpoint
const http = require('http');

async function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function test() {
    console.log('\n🔄 Attempting to trigger server reload...\n');
    
    // Make a request to trigger recompilation
    try {
        const result = await makeRequest('/api/auth/login');
        console.log('✅ Server responded, waiting for recompilation...');
        
        // Wait 5 seconds for Next.js to recompile
        console.log('⏳ Waiting 5 seconds for recompilation...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('\n✅ Server should be ready now. Try login again.\n');
    } catch (e) {
        console.log('⚠️  Could not connect to server');
    }
}

test();

