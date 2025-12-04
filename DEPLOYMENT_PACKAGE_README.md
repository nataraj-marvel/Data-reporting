# Deployment Package for XAMPP Server

## 📦 Package Contents

This deployment package includes everything needed to install the Nautilus Reporting System on an XAMPP server.

---

## 📋 Prerequisites

### Required Software
1. **XAMPP** (Latest version with MySQL)
   - Download from: https://www.apachefriends.org/
   - Includes: Apache, MySQL, PHP

2. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Required for Next.js application

3. **Git** (Optional, for updates)
   - Download from: https://git-scm.com/

---

## 🚀 Installation Steps

### Step 1: Install XAMPP

1. Download and install XAMPP
2. Start **Apache** and **MySQL** from XAMPP Control Panel
3. Note MySQL port (usually 3306)

### Step 2: Setup MySQL Database

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Create new database: `nautilus_reporting`
3. Import database schema:
   - Click on `nautilus_reporting` database
   - Go to "Import" tab
   - Select file: `database/CLEAN_INSTALL.sql`
   - Click "Go"

**OR** Run the setup script:
```bash
cd database
mysql -u root -p < CLEAN_INSTALL.sql
```

### Step 3: Extract Application Files

1. Extract the zip file to desired location
2. Example: `C:\xampp\htdocs\reporting`
3. Or: `D:\Projects\reporting`

### Step 4: Install Node.js Dependencies

Open Command Prompt or PowerShell in the application folder:

```bash
cd D:\Projects\reporting
npm install
```

**This will take 2-5 minutes** - it installs all required packages.

### Step 5: Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` file with your settings:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=nautilus_reporting
   JWT_SECRET=your-secret-key-change-this
   NODE_ENV=production
   ```

### Step 6: Create Admin User

Run the setup script:
```bash
node scripts/setup_admin.cjs
```

This creates:
- Username: `admin`
- Password: `admin123`
- Role: admin

### Step 7: Build for Production

```bash
npm run build
```

**This will take 5-10 minutes** - creates optimized production build.

### Step 8: Start the Application

**For Production:**
```bash
npm run start
```

**For Development:**
```bash
npm run dev
```

Application will be available at: **http://localhost:3000**

---

## 🔧 Configuration

### Database Configuration

**File:** `.env`

```bash
# Database Connection
DB_HOST=localhost          # MySQL host (localhost for XAMPP)
DB_PORT=3306              # MySQL port (default 3306)
DB_USER=root              # MySQL username (default root)
DB_PASSWORD=              # MySQL password (empty by default in XAMPP)
DB_NAME=nautilus_reporting # Database name

# Application
JWT_SECRET=change-this-to-random-string
NODE_ENV=production
```

### Port Configuration

**Default Port:** 3000

To change port, edit `package.json`:
```json
"scripts": {
  "start": "next start -p 8080"
}
```

---

## 📁 Package Structure

```
nautilus-reporting/
├── pages/                    # Application pages
│   ├── api/                 # API endpoints
│   ├── reports/             # Reports pages
│   ├── tasks/               # Tasks pages
│   └── ...
├── database/                # Database files
│   ├── CLEAN_INSTALL.sql   # Database schema
│   └── sample_data.sql     # Sample data (optional)
├── scripts/                 # Setup & utility scripts
│   ├── setup_admin.cjs     # Create admin user
│   └── test_connection.cjs # Test database connection
├── public/                  # Static files
├── types/                   # TypeScript types
├── lib/                     # Utilities
├── .env.example            # Environment template
├── package.json            # Dependencies
└── README.md              # This file
```

---

## 🔐 Default Login Credentials

After installation:

```
URL: http://localhost:3000
Username: admin
Password: admin123
```

**⚠️ IMPORTANT:** Change the admin password after first login!

---

## 🧪 Testing the Installation

### 1. Test Database Connection

```bash
node scripts/test_connection.cjs
```

Expected output:
```
✅ Database connection successful
✅ Found X tables
✅ Found X users
```

### 2. Test Application

1. Open browser: http://localhost:3000
2. Login with admin credentials
3. Create a test report
4. Create a test task
5. Verify everything works

---

## 🔄 Running as Windows Service

To run the application as a Windows service (auto-start on boot):

### Option 1: Using PM2

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Start application:
   ```bash
   pm2 start npm --name "nautilus-reporting" -- start
   ```

3. Save configuration:
   ```bash
   pm2 save
   pm2 startup
   ```

### Option 2: Using NSSM (Windows Service Wrapper)

1. Download NSSM from: https://nssm.cc/download
2. Install service:
   ```bash
   nssm install NautilusReporting
   ```
3. Configure:
   - Path: `C:\Program Files\nodejs\node.exe`
   - Startup directory: `D:\Projects\reporting`
   - Arguments: `node_modules\next\dist\bin\next start`

---

## 🔧 Troubleshooting

### Database Connection Failed

**Problem:** Cannot connect to MySQL

**Solutions:**
1. Check XAMPP MySQL is running
2. Verify port in `.env` matches XAMPP (usually 3306)
3. Check username/password
4. Test connection:
   ```bash
   node scripts/test_connection.cjs
   ```

### Port Already in Use

**Problem:** Port 3000 is already in use

**Solution:** Change port in package.json:
```json
"scripts": {
  "start": "next start -p 8080"
}
```

### npm install fails

**Problem:** Dependencies installation fails

**Solutions:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete `node_modules` and retry:
   ```bash
   rmdir /s node_modules
   npm install
   ```

### Build fails

**Problem:** `npm run build` fails

**Solution:** Check Node.js version (must be 18+):
```bash
node --version
```

### Application won't start

**Problem:** Application crashes on startup

**Solutions:**
1. Check logs in terminal
2. Verify database is running
3. Check `.env` configuration
4. Test database connection

---

## 📊 System Requirements

### Minimum Requirements
- **OS:** Windows 10/11, Linux, macOS
- **RAM:** 4 GB
- **Disk:** 500 MB free space
- **Node.js:** v18 or higher
- **MySQL:** 5.7 or higher

### Recommended Requirements
- **OS:** Windows 11
- **RAM:** 8 GB
- **Disk:** 2 GB free space
- **Node.js:** v20 LTS
- **MySQL:** 8.0

---

## 🔄 Updates

### Updating the Application

1. Backup database:
   ```bash
   mysqldump -u root -p nautilus_reporting > backup.sql
   ```

2. Extract new version files

3. Install new dependencies:
   ```bash
   npm install
   ```

4. Rebuild:
   ```bash
   npm run build
   ```

5. Restart application

---

## 📞 Support

### Documentation Files
- `COMPLETE_FIX_SUMMARY.md` - Complete technical documentation
- `QUICK_START_GUIDE.md` - Quick start guide
- `LOGIN_CREDENTIALS.txt` - Login information

### Testing Scripts
- `scripts/test_connection.cjs` - Test database
- `scripts/test_tasks_api.cjs` - Test tasks API
- `scripts/test_reports_hours.cjs` - Test reports API

---

## 🎉 Installation Complete!

After successful installation:

1. Open: http://localhost:3000
2. Login with admin/admin123
3. Change password
4. Start using the system!

**The Nautilus Reporting System is now ready to use! 🚀**

