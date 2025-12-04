// Test script for creating and updating reports via API
const https = require('http');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let reportId = null;

// Helper function to make API requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (authToken) {
      options.headers['Cookie'] = `auth-token=${authToken}`;
    }

    const req = https.request(url, options, (res) => {
      let body = '';
      
      // Capture cookies from response
      if (res.headers['set-cookie']) {
        const cookies = res.headers['set-cookie'];
        cookies.forEach(cookie => {
          if (cookie.startsWith('auth-token=')) {
            authToken = cookie.split(';')[0].split('=')[1];
          }
        });
      }

      res.on('data', (chunk) => body += chunk);
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

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function login() {
  console.log('\n📝 Step 1: Login...');
  const response = await makeRequest('POST', '/api/auth/login', {
    username: 'admin',
    password: 'admin123'
  });

  console.log(`Status: ${response.status}`);
  console.log('Response:', JSON.stringify(response.data, null, 2));

  if (response.data.success) {
    console.log('✅ Login successful!');
    console.log(`User: ${response.data.data.username} (${response.data.data.role})`);
  } else {
    console.log('❌ Login failed!');
    throw new Error('Login failed');
  }
}

async function createReport() {
  console.log('\n📝 Step 2: Create a new report...');
  
  const reportData = {
    report_date: new Date().toISOString().split('T')[0], // Today's date
    start_time: '09:00',
    end_time: '12:00',
    work_description: 'Fixed database schema integration issues and updated TypeScript types',
    hours_worked: 3.0,
    tasks_completed: '- Updated TypeScript types to match database schema\n- Fixed SQL queries in API endpoints\n- Updated frontend pages to use proper column names',
    blockers: 'None',
    notes: 'All schema integration work completed successfully',
    status: 'draft'
  };

  const response = await makeRequest('POST', '/api/reports', reportData);

  console.log(`Status: ${response.status}`);
  console.log('Response:', JSON.stringify(response.data, null, 2));

  if (response.data.success) {
    reportId = response.data.data.report_id;
    console.log(`✅ Report created successfully! ID: ${reportId}`);
  } else {
    console.log('❌ Report creation failed!');
    throw new Error('Report creation failed');
  }
}

async function getReport() {
  console.log(`\n📝 Step 3: Get report ${reportId}...`);
  
  const response = await makeRequest('GET', `/api/reports/${reportId}`);

  console.log(`Status: ${response.status}`);
  console.log('Response:', JSON.stringify(response.data, null, 2));

  if (response.data.success) {
    console.log('✅ Report retrieved successfully!');
    const report = response.data.data;
    console.log(`Report Date: ${report.report_date}`);
    console.log(`Hours: ${report.hours_worked}`);
    console.log(`Status: ${report.status}`);
  } else {
    console.log('❌ Failed to retrieve report!');
  }
}

async function updateReport() {
  console.log(`\n📝 Step 4: Update report ${reportId}...`);
  
  const updateData = {
    work_description: 'Fixed database schema integration issues, updated TypeScript types, and created comprehensive documentation',
    hours_worked: 4.5,
    tasks_completed: '- Updated TypeScript types to match database schema\n- Fixed SQL queries in API endpoints\n- Updated frontend pages to use proper column names\n- Created comprehensive documentation',
    notes: 'All schema integration work completed successfully. Added API testing documentation.',
    status: 'submitted'
  };

  const response = await makeRequest('PUT', `/api/reports/${reportId}`, updateData);

  console.log(`Status: ${response.status}`);
  console.log('Response:', JSON.stringify(response.data, null, 2));

  if (response.data.success) {
    console.log('✅ Report updated successfully!');
    const report = response.data.data;
    console.log(`Hours: ${report.hours_worked}`);
    console.log(`Status: ${report.status}`);
    if (report.submitted_at) {
      console.log(`Submitted at: ${report.submitted_at}`);
    }
  } else {
    console.log('❌ Failed to update report!');
  }
}

async function getAllReports() {
  console.log('\n📝 Step 5: Get all reports...');
  
  const response = await makeRequest('GET', '/api/reports?page=1&limit=5');

  console.log(`Status: ${response.status}`);
  
  if (response.data.success) {
    console.log('✅ Reports retrieved successfully!');
    console.log(`Total reports: ${response.data.pagination.total}`);
    console.log(`Page: ${response.data.pagination.page}/${response.data.pagination.totalPages}`);
    console.log('\nReports:');
    response.data.data.forEach((report, index) => {
      console.log(`  ${index + 1}. ID: ${report.report_id} | Date: ${report.report_date} | Hours: ${report.hours_worked} | Status: ${report.status}`);
    });
  } else {
    console.log('❌ Failed to retrieve reports!');
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Report API Tests...');
  console.log('================================');

  try {
    await login();
    await createReport();
    await getReport();
    await updateReport();
    await getAllReports();
    
    console.log('\n================================');
    console.log('✅ All tests completed successfully!');
    console.log(`\n🎉 Created and updated report ID: ${reportId}`);
    console.log(`\nView in browser: ${BASE_URL}/reports/${reportId}`);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  }
}

// Run the tests
runTests();

