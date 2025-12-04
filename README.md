# MarvelQuant Reporting System

<div align="center">

![MarvelQuant Logo](public/logo.png)

**Professional Quantitative Trading Platform for Daily Reports & Task Management**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/mysql-%3E%3D8.0-blue.svg)](https://www.mysql.com)

[Features](#-features) •
[Quick Start](#-quick-start) •
[Installation](#-installation) •
[Deployment](#-deployment) •
[Documentation](#-documentation)

</div>

---

## 🎯 Overview

MarvelQuant Reporting System is a professional web application designed for quantitative trading teams to manage daily reports, track tasks, log AI prompts, handle requests, and version files. Built with Next.js, React, TypeScript, and MySQL.

### ✨ Key Features

- 📊 **Daily Reports** - Create, edit, and manage comprehensive daily work reports
- ✅ **Task Management** - Track tasks with priorities, assignments, and progress
- 🤖 **AI Prompt Logging** - Document AI agent interactions and prompts
- 📋 **Request Tracking** - Manage feature requests and bug reports
- 📁 **File Versioning** - Track file changes with version history
- 🔐 **Authentication** - Secure JWT-based authentication system
- 👥 **Role-Based Access** - Admin and Programmer roles with different permissions
- 🎨 **Modern UI** - Professional theme with glassmorphism effects
- 📱 **Responsive** - Works perfectly on desktop, tablet, and mobile
- 🚀 **Fast Performance** - Optimized Next.js with server-side rendering

---

## 🖼️ Screenshots

### Dashboard
![Dashboard](docs/images/dashboard.png)

### Reports
![Reports](docs/images/reports.png)

### Tasks
![Tasks](docs/images/tasks.png)

---

## 📋 Table of Contents

- [System Requirements](#-system-requirements)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Deployment](#-deployment)
- [Configuration](#-configuration)
- [Documentation](#-documentation)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Contributing](#-contributing)
- [License](#-license)

---

## 💻 System Requirements

### Minimum Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **MySQL**: v8.0 or higher
- **RAM**: 2GB minimum
- **Disk**: 500MB free space

### Recommended
- **Node.js**: v18.17.0 (LTS)
- **MySQL**: v8.0.35
- **RAM**: 4GB
- **Disk**: 2GB free space

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
cd Data-reporting
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy environment template
cp env.example.txt .env.local

# Edit with your database credentials
nano .env.local
```

### 4. Setup Database
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE reporting_db;"

# Import schema
mysql -u root -p reporting_db < database/schema.sql
mysql -u root -p reporting_db < database/schema_v2_migration.sql
mysql -u root -p reporting_db < database/add_assigned_to_tasks.sql

# Create default admin user
node scripts/reset_admin_password.js
```

### 5. Run Development Server
```bash
npm run dev
```

### 6. Open in Browser
```
http://localhost:3000
```

**Default Login**:
- Username: `admin`
- Password: `admin123`
- **⚠️ Change password immediately!**

---

## 📦 Installation

For detailed installation instructions, see [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md).

### Quick Install Script (Linux/macOS)

```bash
#!/bin/bash
# Quick installation script

# Install Node.js (if needed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL (if needed)
sudo apt-get install mysql-server

# Clone and setup project
git clone <repository-url>
cd Data-reporting
npm install

# Configure environment
cp env.example.txt .env.local
echo "Please edit .env.local with your database credentials"

# Setup database
mysql -u root -p < database/schema.sql

# Create admin user
node scripts/reset_admin_password.js

# Start server
npm run dev
```

---

## 🌐 Deployment

### Option 1: Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Access application
http://localhost:3000
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
# Deploy to production
vercel --prod
```

### Option 3: AWS/DigitalOcean/VPS

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local` from `env.example.txt`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=reporting_user
DB_PASSWORD=your_password
DB_NAME=reporting_db

# JWT Secret
JWT_SECRET=your_random_secret_key

# Application
NODE_ENV=production
PORT=3000
```

### Database Configuration

MySQL connection is configured in `lib/db.ts`. Use environment variables (recommended) or edit directly.

### Authentication

JWT configuration in `lib/auth.ts`:
- Token expiration: 7 days
- Cookie: httpOnly, secure in production
- Refresh tokens: Not implemented (add if needed)

---

## 📚 Documentation

### User Documentation
- [Installation Guide](INSTALLATION_GUIDE.md) - Complete installation instructions
- [Deployment Guide](DEPLOYMENT.md) - Deploy to various platforms
- [User Manual](docs/USER_MANUAL.md) - How to use the system
- [FAQ](docs/FAQ.md) - Frequently asked questions

### Technical Documentation
- [API Reference](docs/API_REFERENCE_V2.md) - Complete API documentation
- [Database Schema](docs/DATABASE_SCHEMA.md) - Database structure
- [Architecture](docs/NAUTILUS_REPORTING_ARCHITECTURE.md) - System architecture
- [Theme Guide](docs/MARVELQUANT_THEME.md) - UI theme documentation

### Development Documentation
- [Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md) - Development history
- [Daily Report](docs/DAILY_REPORT_2025_12_03.md) - Latest development log
- [API Submission](docs/API_SUBMISSION_WITH_AUTH.md) - API authentication guide

---

## 🛠️ Tech Stack

### Frontend
- **Next.js** 13.x - React framework
- **React** 18.x - UI library
- **TypeScript** 5.x - Type safety
- **CSS-in-JS** - Styled components (styled-jsx)

### Backend
- **Node.js** 18.x - Runtime environment
- **Next.js API Routes** - Backend API
- **MySQL** 8.0 - Database
- **MySQL2** - Database driver

### Authentication
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing
- **Cookies** - Session management

### DevOps
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **PM2** - Process management
- **Git** - Version control

---

## 📁 Project Structure

```
Data-reporting/
├── components/          # React components
│   └── Navbar.tsx      # Navigation component
├── database/           # Database schemas
│   ├── schema.sql
│   └── schema_v2_migration.sql
├── docs/               # Documentation
│   ├── DAILY_REPORT_2025_12_03.md
│   ├── MARVELQUANT_THEME.md
│   └── ...
├── lib/                # Utility libraries
│   ├── auth.ts         # Authentication
│   └── db.ts           # Database connection
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   │   ├── auth/
│   │   ├── reports/
│   │   ├── tasks/
│   │   └── ...
│   ├── reports/        # Reports pages
│   ├── tasks/          # Tasks pages
│   └── ...
├── public/             # Static files
│   ├── logo.png
│   └── favicon.png
├── scripts/            # Utility scripts
│   └── submit_report_authenticated.js
├── styles/             # Global styles
│   └── globals.css
├── types/              # TypeScript types
│   └── index.ts
├── tests/              # Test files
├── docker-compose.yml  # Docker configuration
├── Dockerfile          # Docker build file
├── nginx.conf          # Nginx configuration
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript config
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report
- `GET /api/reports/[id]` - Get report
- `PUT /api/reports/[id]` - Update report
- `DELETE /api/reports/[id]` - Delete report

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/[id]` - Get task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Prompts, Requests, Files
Similar CRUD endpoints for each entity.

See [API_REFERENCE_V2.md](docs/API_REFERENCE_V2.md) for complete documentation.

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

---

## 🤝 Contributing

This is a proprietary project. Contributions are managed internally.

### Development Workflow

1. Create feature branch
2. Make changes
3. Run tests
4. Submit for review
5. Merge to main

---

## 📄 License

**Proprietary** - All Rights Reserved

This software is proprietary and confidential. Unauthorized copying, distribution, or modification is strictly prohibited.

---

## 👥 Team

- **Lead Developer**: AI Development Team
- **Project Manager**: [Your Name]
- **Designer**: MarvelQuant Design Team

---

## 📞 Support

### Getting Help
- 📖 Read the [Documentation](docs/)
- 🐛 Check [Known Issues](docs/TROUBLESHOOTING.md)
- 💬 Contact support team

### Reporting Issues
When reporting issues, include:
- Error message
- Steps to reproduce
- Environment details
- Screenshots (if applicable)

---

## 🗺️ Roadmap

### v2.1 (Planned)
- [ ] Email notifications
- [ ] Advanced reporting analytics
- [ ] Export to PDF
- [ ] Chart visualizations
- [ ] Dark/light theme toggle

### v2.2 (Future)
- [ ] Real-time updates (WebSocket)
- [ ] Mobile app
- [ ] Integration with CI/CD
- [ ] Advanced search
- [ ] Audit logs

---

## 📊 Statistics

- **Lines of Code**: ~10,000+
- **Components**: 15+
- **API Endpoints**: 30+
- **Database Tables**: 12
- **Documentation**: 2,000+ lines

---

## 🎉 Acknowledgments

- **Next.js Team** - Amazing framework
- **Vercel** - Hosting platform
- **MySQL** - Reliable database
- **TypeScript** - Type safety

---

## 📱 Connect

- **Website**: [your-domain.com]
- **Documentation**: [docs.your-domain.com]
- **Support**: support@your-domain.com

---

<div align="center">

**Built with ❤️ by the MarvelQuant Team**

Made with [Next.js](https://nextjs.org) • [React](https://reactjs.org) • [TypeScript](https://www.typescriptlang.org)

⭐ Star this project if you find it useful!

</div>

---

**Version**: 2.0.0  
**Last Updated**: December 3, 2025  
**Status**: Production Ready ✅
