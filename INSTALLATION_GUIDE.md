# MarvelQuant Reporting System - Installation Guide

## 📦 Complete Installation Package

**Version**: 2.0.0  
**Date**: December 3, 2025  
**License**: Proprietary  

---

## 🎯 Overview

The MarvelQuant Reporting System is a professional quantitative trading platform for managing daily reports, tasks, AI prompts, requests, and file versions with a beautiful modern UI.

### Features
- ✅ Professional MarvelQuant theme with glassmorphism
- ✅ Daily report management with rich formatting
- ✅ Task tracking and assignment
- ✅ AI prompt logging
- ✅ Request management
- ✅ File version tracking
- ✅ User authentication and authorization
- ✅ Role-based access control (Admin/Programmer)
- ✅ Responsive design for all devices

---

## 📋 System Requirements

### Server Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **MySQL**: v8.0 or higher
- **Memory**: 2GB RAM minimum (4GB recommended)
- **Disk Space**: 500MB minimum
- **OS**: Linux, Windows, or macOS

### Production Server (Recommended)
- **VPS/Cloud**: AWS, DigitalOcean, Heroku, Vercel
- **Database**: MySQL 8.0+ or MariaDB 10.5+
- **SSL Certificate**: Let's Encrypt or commercial
- **Domain**: Custom domain recommended

---

## 🚀 Quick Start

### Option 1: Local Development

```bash
# 1. Clone/Extract the project
cd Data-reporting

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Configure database in .env.local
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=reporting_db

# 5. Import database schema
mysql -u root -p < database/schema.sql
mysql -u root -p reporting_db < database/schema_v2_migration.sql

# 6. Start development server
npm run dev

# 7. Open browser
http://localhost:3000
```

### Option 2: Production Deployment

See [Deployment Guide](#-deployment) below.

---

## 📦 Installation Steps

### Step 1: Prerequisites

#### Install Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows
# Download from https://nodejs.org/

# macOS
brew install node@18
```

#### Install MySQL
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mysql-server

# Windows
# Download from https://dev.mysql.com/downloads/mysql/

# macOS
brew install mysql
```

### Step 2: Project Setup

#### 1. Extract/Clone Project
```bash
# If using git
git clone <repository-url>
cd Data-reporting

# If using zip
unzip Data-reporting.zip
cd Data-reporting
```

#### 2. Install Dependencies
```bash
npm install
```

This will install:
- Next.js (React framework)
- TypeScript
- MySQL2 (database driver)
- bcrypt (password hashing)
- jsonwebtoken (authentication)
- And other dependencies

### Step 3: Database Setup

#### 1. Create Database
```bash
mysql -u root -p
```

```sql
CREATE DATABASE reporting_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'reporting_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON reporting_db.* TO 'reporting_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 2. Import Schema
```bash
# Import base schema
mysql -u reporting_user -p reporting_db < database/schema.sql

# Import v2.0 enhancements
mysql -u reporting_user -p reporting_db < database/schema_v2_migration.sql

# Add assigned_to field
mysql -u reporting_user -p reporting_db < database/add_assigned_to_tasks.sql
```

#### 3. Create Default Admin User
```bash
# Run the script
node scripts/reset_admin_password.js
```

This creates:
- Username: `admin`
- Password: `admin123`
- Role: `admin`

**⚠️ IMPORTANT**: Change this password immediately after first login!

### Step 4: Environment Configuration

#### 1. Create .env.local
```bash
cp .env.example .env.local
```

#### 2. Configure Environment Variables

Edit `.env.local`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=reporting_user
DB_PASSWORD=strong_password_here
DB_NAME=reporting_db

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Application Configuration
NODE_ENV=production
PORT=3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Generate JWT Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 5: Build for Production

```bash
# Build the application
npm run build

# Test the build
npm start
```

### Step 6: Verify Installation

1. Open browser: `http://localhost:3000`
2. Login with default credentials
3. Create a test report
4. Verify all features work

---

## 🌐 Deployment

### Option 1: Vercel (Recommended for Next.js)

#### Prerequisites
- Vercel account
- GitHub repository (optional)

#### Steps

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add all variables from `.env.local`

5. **Configure Database**
   - Use PlanetScale, AWS RDS, or external MySQL
   - Update connection details in Vercel environment variables

6. **Deploy to Production**
```bash
vercel --prod
```

### Option 2: AWS EC2

#### 1. Launch EC2 Instance
- Ubuntu 22.04 LTS
- t2.medium or larger
- Configure security group (ports 80, 443, 3306)

#### 2. Connect and Setup
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt-get install mysql-server

# Install Nginx
sudo apt-get install nginx

# Install PM2
sudo npm install -g pm2
```

#### 3. Deploy Application
```bash
# Clone project
git clone <your-repo> /var/www/reporting
cd /var/www/reporting

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
pm2 start npm --name "reporting" -- start
pm2 startup
pm2 save
```

#### 4. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/reporting
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/reporting /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL with Let's Encrypt
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 3: DigitalOcean App Platform

#### 1. Create App
- Go to DigitalOcean → Apps
- Create New App
- Connect GitHub repository

#### 2. Configure Build
- Build Command: `npm run build`
- Run Command: `npm start`

#### 3. Add Database
- Add MySQL Database Component
- Note connection details

#### 4. Set Environment Variables
- Add all variables from `.env.local`
- Update DB_HOST with database connection string

#### 5. Deploy
- Click "Deploy"

### Option 4: Docker Container

#### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_USER=reporting_user
      - DB_PASSWORD=secure_password
      - DB_NAME=reporting_db
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=reporting_db
      - MYSQL_USER=reporting_user
      - MYSQL_PASSWORD=secure_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database:/docker-entrypoint-initdb.d

volumes:
  mysql_data:
```

#### 3. Deploy
```bash
docker-compose up -d
```

---

## 🔒 Security Configuration

### 1. Change Default Credentials

```sql
-- Change admin password
UPDATE users 
SET password_hash = '$2b$10$new_hashed_password' 
WHERE username = 'admin';
```

Or use the application interface.

### 2. Configure Firewall

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
```

### 3. Setup SSL/HTTPS

Use Let's Encrypt:
```bash
sudo certbot --nginx -d your-domain.com
```

### 4. Environment Variables

**Never commit**:
- `.env.local`
- `.env.production`
- Database credentials
- JWT secrets

### 5. Database Security

```sql
-- Restrict user permissions
REVOKE ALL PRIVILEGES ON *.* FROM 'reporting_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON reporting_db.* TO 'reporting_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🔧 Configuration

### Database Connection

Edit `lib/db.ts` if needed, or use environment variables (recommended).

### Authentication

JWT configuration in `lib/auth.ts`:
- Token expiration: 7 days (configurable)
- Cookie settings: httpOnly, secure in production

### File Uploads

Configure in `pages/api/uploads/[id].ts`:
- Max file size
- Allowed file types
- Storage location

---

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Linting
npm run lint
```

### Manual Testing Checklist

- [ ] Login/logout works
- [ ] Create report
- [ ] Edit report
- [ ] Create task
- [ ] Assign task
- [ ] View dashboards
- [ ] Responsive on mobile
- [ ] All data displays correctly

---

## 📊 Monitoring

### PM2 Monitoring (if using PM2)
```bash
# View logs
pm2 logs reporting

# Monitor
pm2 monit

# Status
pm2 status
```

### Database Monitoring
```bash
# MySQL status
mysql -u root -p -e "SHOW PROCESSLIST;"

# Database size
mysql -u root -p -e "SELECT table_schema AS 'Database', 
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' 
  FROM information_schema.TABLES 
  GROUP BY table_schema;"
```

---

## 🔄 Backup & Restore

### Backup Database
```bash
# Create backup
mysqldump -u reporting_user -p reporting_db > backup_$(date +%Y%m%d).sql

# Automated daily backup
echo "0 2 * * * mysqldump -u reporting_user -p'password' reporting_db > /backups/db_\$(date +\%Y\%m\%d).sql" | crontab -
```

### Restore Database
```bash
mysql -u reporting_user -p reporting_db < backup_20251203.sql
```

### Backup Files
```bash
# Backup entire application
tar -czf reporting_backup_$(date +%Y%m%d).tar.gz /var/www/reporting

# Exclude node_modules and .next
tar --exclude='node_modules' --exclude='.next' -czf reporting_backup.tar.gz /var/www/reporting
```

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Or on Windows
netstat -ano | findstr :3000

# Kill process
kill -9 <PID>
```

#### Database Connection Error
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env.local`
- Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`

#### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### Permission Errors
```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/reporting

# Fix file permissions
chmod -R 755 /var/www/reporting
```

---

## 📚 Documentation

### Available Docs

- `docs/DAILY_REPORT_2025_12_03.md` - Development log
- `docs/MARVELQUANT_THEME.md` - Theme documentation
- `docs/API_SUBMISSION_WITH_AUTH.md` - API authentication
- `docs/NAVBAR_ENHANCEMENT.md` - Navigation guide
- `docs/REPORT_VIEWER_ENHANCEMENT.md` - Report viewer
- `docs/IMPLEMENTATION_SUMMARY.md` - Complete summary

### API Documentation

API endpoints available at:
- `/api/auth/*` - Authentication
- `/api/reports/*` - Reports CRUD
- `/api/tasks/*` - Tasks CRUD
- `/api/prompts/*` - AI Prompts CRUD
- `/api/requests/*` - Requests CRUD
- `/api/files/*` - File versions CRUD
- `/api/users/*` - User management

---

## 🆘 Support

### Getting Help

1. **Documentation**: Check all `.md` files in `/docs`
2. **Logs**: Review application logs
3. **Database**: Verify schema is correct
4. **Environment**: Check all environment variables

### Reporting Issues

Include:
- Error message
- Steps to reproduce
- Environment details
- Relevant log files

---

## 📝 Maintenance

### Regular Tasks

**Daily**:
- Monitor application logs
- Check database size
- Review user activity

**Weekly**:
- Backup database
- Update dependencies (if needed)
- Review security logs

**Monthly**:
- Security updates
- Performance optimization
- Cleanup old data

### Updates

```bash
# Update dependencies
npm update

# Check for security issues
npm audit

# Fix security issues
npm audit fix
```

---

## ✅ Production Checklist

Before going live:

- [ ] Change default admin password
- [ ] Configure proper JWT secret
- [ ] Setup SSL/HTTPS
- [ ] Configure firewall
- [ ] Setup automated backups
- [ ] Configure monitoring
- [ ] Test all features
- [ ] Setup error logging
- [ ] Configure email notifications (if needed)
- [ ] Document custom configurations
- [ ] Train users
- [ ] Prepare support documentation

---

## 📄 License

Proprietary - All Rights Reserved

---

## 🎉 Congratulations!

Your MarvelQuant Reporting System is now installed and ready to use!

**Default Login**:
- URL: `http://your-domain.com` or `http://localhost:3000`
- Username: `admin`
- Password: `admin123`

**Remember to change the password immediately!**

---

**Installation Guide Version**: 1.0  
**Last Updated**: December 3, 2025  
**Project Version**: 2.0.0


