# Environment Configuration Guide

**Purpose:** Configure API URLs and environment variables for the Nautilus Reporting System

**Last Updated:** December 3, 2025

---

## 📋 Overview

The system now uses environment variables for API URLs, making it easy to switch between development, staging, and production environments.

---

## 🔧 Configuration Files

### .env File

The `.env` file contains your local environment configuration. This file is **NOT** committed to git (it's in `.gitignore`).

**Location:** `D:\Github\reporting\Data-reporting\.env`

### Complete .env Configuration

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=nautilus_reporting

# API Configuration
API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=9f8b1c2d3e4f5g6h7i8j9k0l!@#QWEasdZXC123

# Application Configuration
NODE_ENV=development
```

---

## 🌐 Environment-Specific Settings

### Development (Local)

```bash
# API Configuration
API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nautilus_reporting

# Application
NODE_ENV=development
```

### Staging

```bash
# API Configuration
API_BASE_URL=https://staging.your-domain.com
NEXT_PUBLIC_API_URL=https://staging.your-domain.com

# Database
DB_HOST=staging-db-server.com
DB_PORT=3306
DB_NAME=nautilus_reporting

# Application
NODE_ENV=staging
```

### Production

```bash
# API Configuration
API_BASE_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com

# Database
DB_HOST=production-db-server.com
DB_PORT=3306
DB_NAME=nautilus_reporting

# Application
NODE_ENV=production
```

---

## 📝 Variable Descriptions

| Variable | Purpose | Example |
|----------|---------|---------|
| `API_BASE_URL` | Backend API URL | http://localhost:3000 |
| `NEXT_PUBLIC_API_URL` | Frontend API URL (public) | http://localhost:3000 |
| `DB_HOST` | Database server hostname | localhost |
| `DB_PORT` | Database server port | 3306 |
| `DB_USER` | Database username | root |
| `DB_PASSWORD` | Database password | (empty for local) |
| `DB_NAME` | Database name | nautilus_reporting |
| `JWT_SECRET` | Secret key for JWT tokens | (random string) |
| `NODE_ENV` | Environment mode | development/production |

---

## 🔐 Security Best Practices

### DO:
✅ Use different values for each environment
✅ Keep `.env` file secret (never commit to git)
✅ Use strong JWT_SECRET in production
✅ Use environment-specific database credentials
✅ Use HTTPS for production API URLs

### DON'T:
❌ Commit `.env` to version control
❌ Share `.env` file publicly
❌ Use same credentials across environments
❌ Use HTTP in production (use HTTPS)
❌ Use weak or default JWT_SECRET in production

---

## 🚀 Usage in Code

### Node.js Scripts

```javascript
require('dotenv').config();

const API_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const DB_HOST = process.env.DB_HOST || 'localhost';

console.log(`Connecting to: ${API_URL}`);
```

### Next.js Pages

```javascript
// For client-side (public variables only)
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// For server-side (all variables)
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
```

### PowerShell Scripts

```powershell
# Load from .env file
$envFile = Get-Content .env
$apiUrl = ($envFile | Select-String "API_BASE_URL=(.+)").Matches.Groups[1].Value

Write-Host "Using API: $apiUrl"
```

### Bash/Linux Scripts

```bash
# Load from .env file
export $(cat .env | grep -v '^#' | xargs)

echo "Using API: $API_BASE_URL"
```

---

## 🧪 Testing Configuration

### Test Database Connection

```bash
node scripts/test_connection.cjs
```

**Expected Output:**
```
✅ Connection successful!
   Host: localhost
   Database: nautilus_reporting
   Tables: 19
```

### Test API Connection

```bash
node scripts/submit_report_env.cjs
```

**Expected Output:**
```
⚙️  Configuration:
   API URL: http://localhost:3000
   Database: nautilus_reporting

📝 Step 1: Login...
✅ Login successful

📊 Step 2: Creating report...
✅ Report created successfully!
```

---

## 🔄 Switching Environments

### Method 1: Multiple .env Files

Create separate files:
- `.env.development`
- `.env.staging`
- `.env.production`

Copy the appropriate file:
```bash
# Windows
copy .env.production .env

# Linux/Mac
cp .env.production .env
```

### Method 2: Environment Variables

Set directly in terminal:

**Windows PowerShell:**
```powershell
$env:API_BASE_URL = "https://your-domain.com"
$env:NODE_ENV = "production"
```

**Linux/Mac:**
```bash
export API_BASE_URL="https://your-domain.com"
export NODE_ENV="production"
```

### Method 3: Update .env File

Edit `.env` directly and change values:
```bash
# Change from:
API_BASE_URL=http://localhost:3000

# To:
API_BASE_URL=https://your-domain.com
```

---

## 📊 Verification Checklist

After configuring environment:

- [ ] `.env` file exists
- [ ] All required variables are set
- [ ] API_BASE_URL is correct
- [ ] Database credentials are correct
- [ ] JWT_SECRET is set (and strong for production)
- [ ] Test database connection works
- [ ] Test API connection works
- [ ] Application starts without errors

### Quick Verification

```bash
# Check configuration
node -e "require('dotenv').config(); console.log('API:', process.env.API_BASE_URL); console.log('DB:', process.env.DB_NAME);"
```

**Expected Output:**
```
API: http://localhost:3000
DB: nautilus_reporting
```

---

## 🐛 Troubleshooting

### Issue: Variables not loading

**Problem:** `process.env.API_BASE_URL` is undefined

**Solutions:**
1. Check `.env` file exists in project root
2. Verify `require('dotenv').config()` is called
3. Check variable names match exactly (case-sensitive)
4. Restart application after changing .env

### Issue: Wrong environment being used

**Problem:** Application using development settings in production

**Solutions:**
1. Check `NODE_ENV` variable
2. Verify correct `.env` file is being loaded
3. Check for environment variable overrides
4. Restart application

### Issue: Database connection fails

**Problem:** Cannot connect to database

**Solutions:**
1. Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
2. Check database server is running
3. Test connection manually: `mysql -h localhost -u root -p`
4. Run: `node scripts/test_connection.cjs`

---

## 📦 Deployment Checklist

When deploying to a new environment:

1. **Create .env file**
   ```bash
   cp .env.example .env
   ```

2. **Update all variables**
   - API_BASE_URL
   - Database credentials
   - JWT_SECRET
   - NODE_ENV

3. **Test configuration**
   ```bash
   node scripts/test_connection.cjs
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Build application**
   ```bash
   npm run build
   ```

6. **Start application**
   ```bash
   npm start
   ```

7. **Verify**
   - Test login
   - Create test report
   - Check database

---

## 🔗 Related Documentation

- `API_REPORT_SUBMISSION_GUIDE.md` - API usage guide
- `COMPLETE_FIX_SUMMARY.md` - Technical documentation
- `QUICK_START_GUIDE.md` - Quick start guide
- `DEPLOYMENT_PACKAGE_README.md` - Deployment guide

---

## 📞 Support

### Configuration Issues

Run diagnostics:
```bash
# Check environment
node scripts/test_connection.cjs

# Test API
node scripts/submit_report_env.cjs

# Check configuration
Get-Content .env
```

### Example .env File

If you need to reset your `.env`, copy from `.env.example`:
```bash
copy .env.example .env
# Edit .env with your values
```

---

## ✅ Summary

**Current Setup:**
- ✅ API URL from environment variable
- ✅ Database config from environment
- ✅ All scripts use .env file
- ✅ Easy environment switching

**Benefits:**
- 🔐 Secure (secrets not in code)
- 🔄 Easy environment switching
- 🚀 Production-ready
- 📝 Well-documented
- 🧪 Testable

**Next Steps:**
1. Verify your `.env` file is configured
2. Test with: `node scripts/test_connection.cjs`
3. Test API: `node scripts/submit_report_env.cjs`
4. Start using the system! 🎉

---

**Last Updated:** December 3, 2025  
**Version:** 1.0.0  
**Status:** Production Ready

