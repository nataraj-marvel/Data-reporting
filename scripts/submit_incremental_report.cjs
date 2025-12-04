// Submit incremental report - only new work since last report
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
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function submitIncrementalReport(newWorkData) {
    console.log('\n📊 SUBMITTING INCREMENTAL REPORT');
    console.log('='.repeat(70));

    try {
        // 1. Login
        console.log('\n🔐 Step 1: Authenticating...');
        const login = await request('POST', '/api/auth/login', {
            username: process.env.API_USERNAME || 'testuser',
            password: process.env.API_PASSWORD || 'Test@123'
        });
        
        if (!login.data.success) {
            console.error('❌ Login failed:', login.data.error);
            return null;
        }
        console.log('✅ Login successful');

        // 2. Get last report
        console.log('\n📋 Step 2: Fetching last report...');
        const reports = await request('GET', '/api/reports?limit=1&page=1');
        
        if (!reports.data.success || reports.data.data.length === 0) {
            console.log('⚠️  No previous reports found - creating first report');
            // Create first report with all data
            return await createReport(newWorkData);
        }

        const lastReport = reports.data.data[0];
        console.log(`✅ Last report found: #${lastReport.report_id}`);
        console.log(`   Date: ${new Date(lastReport.report_date).toLocaleDateString()}`);
        console.log(`   Hours: ${lastReport.hours_worked}`);
        console.log(`   Tasks: ${lastReport.tasks_completed ? lastReport.tasks_completed.split('\n').length : 0}`);

        // 3. Check if already reported today
        const today = new Date().toISOString().split('T')[0];
        const lastReportDate = new Date(lastReport.report_date).toISOString().split('T')[0];
        
        if (lastReportDate === today) {
            console.log('\n⚠️  Report already exists for today!');
            console.log('   Options:');
            console.log('   1. Update existing report (append new work)');
            console.log('   2. Create separate report for this session');
            console.log('\n   Choosing: Update existing report...');
            
            // Update existing report by appending new work
            return await updateReport(lastReport, newWorkData);
        }

        // 4. Create new report with only new work
        console.log('\n📝 Step 3: Creating new report with incremental work...');
        return await createReport(newWorkData);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        return null;
    }
}

async function createReport(workData) {
    const reportData = {
        report_date: new Date().toISOString().split('T')[0],
        work_description: workData.work_description,
        hours_worked: workData.hours_worked,
        tasks_completed: workData.tasks_completed,
        issues_found: workData.issues_found || '',
        issues_solved: workData.issues_solved || '',
        blockers: workData.blockers || 'None',
        notes: workData.notes || '',
        status: workData.status || 'submitted'
    };

    const response = await request('POST', '/api/reports', reportData);
    
    if (response.data.success) {
        console.log('\n✅ NEW REPORT CREATED!');
        console.log(`   Report ID: #${response.data.data.report_id}`);
        console.log(`   Hours: ${workData.hours_worked}`);
        console.log(`   View: ${API_URL.origin}/reports/${response.data.data.report_id}`);
        return response.data.data;
    } else {
        console.error('❌ Failed:', response.data.error);
        return null;
    }
}

async function updateReport(lastReport, newWorkData) {
    // Append new work to existing report
    const updatedData = {
        work_description: `${lastReport.work_description}

---

## Update - ${new Date().toLocaleTimeString()}

${newWorkData.work_description}`,
        
        tasks_completed: `${lastReport.tasks_completed || ''}
${newWorkData.tasks_completed}`,
        
        hours_worked: parseFloat(lastReport.hours_worked) + parseFloat(newWorkData.hours_worked),
        
        notes: `${lastReport.notes || ''}

Update ${new Date().toLocaleTimeString()}: ${newWorkData.notes || 'Additional work completed'}`
    };

    const response = await request('PUT', `/api/reports/${lastReport.report_id}`, updatedData);
    
    if (response.data.success) {
        console.log('\n✅ EXISTING REPORT UPDATED!');
        console.log(`   Report ID: #${lastReport.report_id}`);
        console.log(`   Total Hours: ${updatedData.hours_worked}`);
        console.log(`   Added: +${newWorkData.hours_worked} hours`);
        console.log(`   View: ${API_URL.origin}/reports/${lastReport.report_id}`);
        return response.data.data;
    } else {
        console.error('❌ Update failed:', response.data.error);
        return null;
    }
}

// Example usage
const newWork = {
    work_description: `# New Work Completed

## Task: Environment Configuration Updates

### What Was Done
- Added API_BASE_URL to .env files
- Created AGENT_QUICK_GUIDE.md for AI agents
- Updated API documentation to use environment variables

### Files Modified
- .env
- .env.example
- API_REPORT_SUBMISSION_GUIDE.md
- AGENT_QUICK_GUIDE.md (NEW)

### Results
✅ All API calls now use environment configuration
✅ Simple guide available for AI agents
✅ Easy switching between environments`,

    hours_worked: 1.5,
    
    tasks_completed: `1. Added API_BASE_URL to environment
2. Created AI Agent Quick Guide
3. Updated API documentation
4. Created incremental report script`,
    
    issues_found: '',
    issues_solved: '',
    blockers: 'None',
    notes: 'Environment configuration complete',
    status: 'submitted'
};

// Run
submitIncrementalReport(newWork);

