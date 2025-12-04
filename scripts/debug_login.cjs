// Debug Login API
const http = require('http');

function makeRequest(method, path, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log('Request:', options);
        console.log('Body:', postData);

        const req = http.request(options, (res) => {
            let body = '';
            
            console.log('Status Code:', res.statusCode);
            console.log('Headers:', res.headers);

            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log('Response Body:', body);
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', (e) => {
            console.error('Request error:', e);
            reject(e);
        });
        
        req.write(postData);
        req.end();
    });
}

async function test() {
    console.log('\n🔍 Testing Login API...\n');
    
    const result = await makeRequest('POST', '/api/auth/login', {
        username: 'admin',
        password: 'admin123'
    });
    
    console.log('\n✅ Final result:', result);
}

test().catch(console.error);

