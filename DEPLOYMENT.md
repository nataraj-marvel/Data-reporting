# MarvelQuant Reporting System - Deployment Guide

## 🚀 Quick Deployment Options

Choose the best option for your needs:

| Platform | Difficulty | Cost | Best For |
|----------|-----------|------|----------|
| **Vercel** | ⭐ Easy | Free tier | Quick deployment, auto-scaling |
| **Docker** | ⭐⭐ Medium | VPS cost | Full control, portable |
| **AWS EC2** | ⭐⭐⭐ Advanced | Variable | Enterprise, custom setup |
| **DigitalOcean** | ⭐⭐ Medium | $5+/month | Balance of control and ease |

---

## 🎯 Method 1: Vercel (Easiest)

### Prerequisites
- Vercel account (free)
- MySQL database (PlanetScale, AWS RDS, or other)

### Steps

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Configure Environment Variables**
   - Go to: https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add variables from `.env.example`

5. **Setup Database**
   - Option A: Use PlanetScale (free tier)
   - Option B: Use external MySQL host
   - Update DB_HOST in Vercel env vars

6. **Deploy to Production**
```bash
vercel --prod
```

**Your site is live!** 🎉

---

## 🐳 Method 2: Docker (Recommended)

### Prerequisites
- Docker installed
- Docker Compose installed

### Steps

1. **Configure Environment**

Edit `docker-compose.yml`:
```yaml
environment:
  - DB_PASSWORD=your_secure_password
  - JWT_SECRET=your_jwt_secret
```

2. **Build and Run**
```bash
docker-compose up -d
```

3. **Initialize Database**
```bash
# Import schema (first time only)
docker-compose exec db mysql -u reporting_user -p reporting_db < /docker-entrypoint-initdb.d/01_schema.sql
```

4. **Create Admin User**
```bash
docker-compose exec app node scripts/reset_admin_password.js
```

5. **Access Application**
```
http://localhost:3000
```

### Docker Management

```bash
# View logs
docker-compose logs -f app

# Stop containers
docker-compose down

# Restart
docker-compose restart

# Update and redeploy
git pull
docker-compose build
docker-compose up -d
```

---

## ☁️ Method 3: AWS EC2

### Prerequisites
- AWS account
- EC2 instance (Ubuntu 22.04)
- Security group configured (ports 80, 443, 3000)

### Steps

1. **Connect to EC2**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install mysql-server

# Install Nginx
sudo apt install nginx

# Install PM2
sudo npm install -g pm2
```

3. **Setup MySQL**
```bash
sudo mysql_secure_installation

sudo mysql
```

```sql
CREATE DATABASE reporting_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'reporting_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON reporting_db.* TO 'reporting_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

4. **Deploy Application**
```bash
# Clone repository
cd /var/www
sudo git clone <your-repo> reporting
cd reporting

# Install dependencies
sudo npm install

# Configure environment
sudo cp .env.example .env.local
sudo nano .env.local
# Add your configuration

# Build
sudo npm run build

# Start with PM2
pm2 start npm --name "marvelquant" -- start
pm2 startup
pm2 save
```

5. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/marvelquant
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/marvelquant /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **Setup SSL**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 🌊 Method 4: DigitalOcean

### Using App Platform (PaaS)

1. **Create Account**
   - Go to digitalocean.com
   - Sign up for account

2. **Create App**
   - Apps → Create App
   - Connect GitHub repository

3. **Configure Build**
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Port: 3000

4. **Add Database**
   - Add Component → Database
   - Select MySQL
   - Note connection details

5. **Environment Variables**
   - Add all from `.env.example`
   - Use database connection string

6. **Deploy**
   - Click "Deploy"
   - Wait for build

### Using Droplet (VPS)

Similar to AWS EC2 steps above, but:
- Use DigitalOcean Droplet ($5/month)
- Ubuntu 22.04
- Follow EC2 installation steps

---

## 🔐 Production Security Checklist

Before going live:

### 1. Environment Variables
- [ ] Change JWT_SECRET to random string
- [ ] Use strong database passwords
- [ ] Set NODE_ENV=production

### 2. Database Security
- [ ] Create dedicated database user
- [ ] Use strong passwords
- [ ] Restrict permissions
- [ ] Enable SSL connections

### 3. Application Security
- [ ] Change default admin password
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Setup rate limiting

### 4. Server Security
- [ ] Configure firewall
- [ ] Keep system updated
- [ ] Setup fail2ban
- [ ] Configure backups

### 5. Monitoring
- [ ] Setup error logging
- [ ] Configure uptime monitoring
- [ ] Enable application logs
- [ ] Setup database monitoring

---

## 📊 Post-Deployment

### 1. Initialize Admin User
```bash
node scripts/reset_admin_password.js
```

### 2. Import Sample Data (Optional)
```sql
-- Add sample data if needed
```

### 3. Test Application
- [ ] Login works
- [ ] Create report
- [ ] Create task
- [ ] All dashboards load
- [ ] Mobile responsive

### 4. Configure Monitoring
```bash
# PM2 monitoring
pm2 monit

# Setup alerts
pm2 install pm2-logrotate
```

### 5. Setup Backups
```bash
# Daily database backup
crontab -e
```

Add:
```
0 2 * * * mysqldump -u reporting_user -p'password' reporting_db > /backups/db_$(date +\%Y\%m\%d).sql
```

---

## 🔄 Updates & Maintenance

### Updating Application

```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Rebuild
npm run build

# Restart (PM2)
pm2 restart marvelquant

# Restart (Docker)
docker-compose restart

# Restart (systemd)
sudo systemctl restart marvelquant
```

### Database Migrations

```bash
# Backup first!
mysqldump -u reporting_user -p reporting_db > backup_before_migration.sql

# Run migration
mysql -u reporting_user -p reporting_db < database/new_migration.sql
```

---

## 🆘 Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs marvelquant
# or
docker-compose logs app

# Verify environment variables
cat .env.local

# Check port availability
lsof -i :3000
```

### Database Connection Issues
```bash
# Test connection
mysql -u reporting_user -p -h localhost reporting_db

# Check MySQL status
sudo systemctl status mysql

# Review MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### SSL/HTTPS Issues
```bash
# Test SSL certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run

# Check Nginx config
sudo nginx -t
```

---

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer**: Use AWS ELB, Nginx, or CloudFlare
2. **Database**: Use read replicas
3. **Caching**: Add Redis for sessions
4. **CDN**: Use CloudFlare or AWS CloudFront

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Add database indexes
- Enable caching

---

## 💰 Cost Estimates

| Platform | Setup | Monthly | Annual |
|----------|-------|---------|--------|
| **Vercel** | Free | $0-20 | $0-240 |
| **DigitalOcean** | Free | $10-20 | $120-240 |
| **AWS EC2** | Free | $15-50 | $180-600 |
| **Docker (VPS)** | Free | $5-15 | $60-180 |

*Costs vary based on traffic and resources*

---

## ✅ Deployment Complete!

Your MarvelQuant Reporting System is now live!

### Next Steps
1. Login and change admin password
2. Create user accounts
3. Configure settings
4. Start using the system
5. Monitor performance

### URLs
- **Application**: https://your-domain.com
- **Login**: https://your-domain.com/login

### Default Credentials
- Username: `admin`
- Password: `admin123`
- **Change immediately after first login!**

---

**Deployment Guide Version**: 1.0  
**Last Updated**: December 3, 2025  
**Support**: See INSTALLATION_GUIDE.md for help

